"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMyEnrollments, type Enrollment } from "../../../lib/api/enrollment";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { getValidToken } from "@/lib/auth/token";

type SortOption = "terbaru" | "terlama" | "progres-tinggi" | "progres-rendah" | "a-z";
type FilterStatus = "semua" | "belajar" | "selesai" | "belum-mulai";

export default function KursusSayaPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("terbaru");
  const [filter, setFilter] = useState<FilterStatus>("semua");

  useEffect(() => {
    // Finding #1: read token via getValidToken so a session persisted only in
    // localStorage (new tab / restore) is honored instead of bouncing to /masuk.
    (async () => {
      const token = await getValidToken();
      if (!token) { router.replace("/masuk"); return; }

      getMyEnrollments(token)
        .then(setEnrollments)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    })();
  }, [router]);

  const filtered = useMemo(() => {
    let list = [...enrollments];

    // Filter by status
    if (filter === "selesai") list = list.filter((e) => e.isCompleted);
    else if (filter === "belajar") list = list.filter((e) => !e.isCompleted && Number(e.progressPct) > 0);
    else if (filter === "belum-mulai") list = list.filter((e) => Number(e.progressPct) === 0);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.course.title.toLowerCase().includes(q) ||
          (e.course.trainer?.name ?? "").toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sort) {
      case "terbaru":
        list.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
        break;
      case "terlama":
        list.sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());
        break;
      case "progres-tinggi":
        list.sort((a, b) => Number(b.progressPct) - Number(a.progressPct));
        break;
      case "progres-rendah":
        list.sort((a, b) => Number(a.progressPct) - Number(b.progressPct));
        break;
      case "a-z":
        list.sort((a, b) => a.course.title.localeCompare(b.course.title, "id"));
        break;
    }

    return list;
  }, [enrollments, filter, search, sort]);

  const stats = useMemo(() => ({
    total: enrollments.length,
    selesai: enrollments.filter((e) => e.isCompleted).length,
    belajar: enrollments.filter((e) => !e.isCompleted && Number(e.progressPct) > 0).length,
    belumMulai: enrollments.filter((e) => Number(e.progressPct) === 0).length,
  }), [enrollments]);

  if (loading) {
    return (
      <div className="ks-loading">
        <span className="ks-spinner" />
      </div>
    );
  }

  return (
    <div className="ks-page">
      {/* Header */}
      <div className="ks-header">
        <div>
          <h1 className="ks-title">Kursus Saya</h1>
          <p className="ks-subtitle">{enrollments.length} kursus terdaftar</p>
        </div>
        <Link href="/e-course" className="ks-add-btn">
          + Tambah Kursus
        </Link>
      </div>

      {/* Mini stats */}
      <div className="ks-mini-stats">
        {[
          { label: "Total", value: stats.total, color: "#0077A8" },
          { label: "Selesai", value: stats.selesai, color: "#22C55E" },
          { label: "Berlangsung", value: stats.belajar, color: "#F59E0B" },
          { label: "Belum Mulai", value: stats.belumMulai, color: "#9CA3AF" },
        ].map((s) => (
          <div key={s.label} className="ks-mini-stat">
            <span className="ks-mini-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="ks-mini-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter & Search bar */}
      <div className="ks-controls">
        {/* Search */}
        <div className="ks-search-wrap">
          <svg className="ks-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari kursus atau mentor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ks-search-input"
          />
          {search && (
            <button onClick={() => setSearch("")} className="ks-search-clear">✕</button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="ks-select"
          aria-label="Urutkan"
        >
          <option value="terbaru">Terbaru Didaftar</option>
          <option value="terlama">Terlama Didaftar</option>
          <option value="progres-tinggi">Progres Tertinggi</option>
          <option value="progres-rendah">Progres Terendah</option>
          <option value="a-z">A → Z</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div className="ks-filter-tabs">
        {(["semua", "belajar", "selesai", "belum-mulai"] as FilterStatus[]).map((f) => {
          const labels = { semua: "Semua", belajar: "Berlangsung", selesai: "Selesai", "belum-mulai": "Belum Mulai" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`ks-filter-tab ${filter === f ? "ks-filter-active" : ""}`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="ks-error">{error}</div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="ks-empty">
          <span className="ks-empty-emoji">🔍</span>
          <p className="ks-empty-title">
            {enrollments.length === 0 ? "Belum ada kursus" : "Tidak ada hasil"}
          </p>
          <p className="ks-empty-desc">
            {enrollments.length === 0
              ? "Mulai belajar dengan mendaftar kursus pertama Anda."
              : "Coba ubah kata kunci pencarian atau filter."}
          </p>
          {enrollments.length === 0 && (
            <Link href="/e-course" className="ks-empty-cta">Jelajahi Kursus</Link>
          )}
        </div>
      )}

      {/* Course grid */}
      {filtered.length > 0 && (
        <div className="ks-grid">
          {filtered.map((e) => {
            const pct = Number(e.progressPct);
            const levelColor = {
              pemula: "#22C55E",
              menengah: "#F59E0B",
              mahir: "#EF4444",
            }[e.course.level?.toLowerCase() ?? ""] ?? "#9CA3AF";

            return (
              <Link key={e.id} href={`/belajar/${e.course.slug}`} className="ks-card">
                {/* Thumbnail */}
                <div className="ks-card-thumb">
                  {e.course.thumbnailUrl ? (
                    <Image src={e.course.thumbnailUrl} alt={e.course.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="ks-card-thumb-img" />
                  ) : (
                    <MediaPlaceholder type="foto" ratio="16:9" showRatio={false} className="ks-card-thumb-placeholder" />
                  )}
                  {/* Level badge */}
                  {e.course.level && (
                    <span className="ks-card-level" style={{ background: levelColor }}>
                      {e.course.level}
                    </span>
                  )}
                  {/* Status overlay */}
                  {e.isCompleted && (
                    <div className="ks-card-overlay-done">
                      <span>✓ Selesai</span>
                    </div>
                  )}
                </div>

                <div className="ks-card-body">
                  <p className="ks-card-title">{e.course.title}</p>
                  {e.course.trainer && (
                    <p className="ks-card-trainer">👤 {e.course.trainer.name}</p>
                  )}

                  {/* Progress */}
                  <div className="ks-card-progress">
                    <div className="ks-card-progress-top">
                      <span className="ks-card-progress-label">Progres Belajar</span>
                      <span className="ks-card-progress-pct" style={{ color: pct === 100 ? "#22C55E" : "#0077A8" }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="ks-card-bar">
                      <div
                        className="ks-card-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? "linear-gradient(90deg, #22C55E, #16a34a)"
                            : "linear-gradient(90deg, #0077A8, #00a8d9)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Enrolled date */}
                  <p className="ks-card-date">
                    Terdaftar {new Date(e.enrolledAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>

                  <div className="ks-card-cta">
                    {e.isCompleted ? "Lihat Kembali →" : pct > 0 ? "Lanjut Belajar →" : "Mulai Belajar →"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .ks-page { display: flex; flex-direction: column; gap: 20px; }

        /* Header */
        .ks-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .ks-title { font-size: 22px; font-weight: 800; color: #1D1D1F; }
        .ks-subtitle { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .ks-add-btn {
          padding: 10px 20px; background: #0077A8; color: white;
          border-radius: 10px; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: background 0.2s;
        }
        .ks-add-btn:hover { background: #005f87; }

        /* Mini stats */
        .ks-mini-stats {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .ks-mini-stat {
          background: white; border-radius: 12px;
          padding: 12px 20px; display: flex; flex-direction: column; align-items: center;
          border: 1px solid rgba(0,0,0,0.06); min-width: 80px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .ks-mini-stat-value { font-size: 22px; font-weight: 800; }
        .ks-mini-stat-label { font-size: 11px; color: #6E6E73; margin-top: 2px; font-weight: 500; }

        /* Controls */
        .ks-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .ks-search-wrap {
          flex: 1; min-width: 200px;
          display: flex; align-items: center; gap: 8px;
          background: white; border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px; padding: 10px 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .ks-search-icon { width: 16px; height: 16px; color: #9CA3AF; flex-shrink: 0; }
        .ks-search-input { flex: 1; border: none; outline: none; font-size: 13px; color: #1D1D1F; background: transparent; }
        .ks-search-clear { background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 13px; padding: 0; }
        .ks-select {
          padding: 10px 14px; background: white; border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px; font-size: 13px; color: #1D1D1F;
          outline: none; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        /* Filter tabs */
        .ks-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .ks-filter-tab {
          padding: 7px 16px; border-radius: 999px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          border: 1px solid rgba(0,0,0,0.1);
          background: white; color: #6E6E73;
          transition: all 0.18s;
        }
        .ks-filter-tab:hover { background: #f0f4f8; color: #0077A8; }
        .ks-filter-active { background: #0077A8 !important; color: white !important; border-color: #0077A8 !important; }

        /* Error */
        .ks-error {
          padding: 14px 18px; background: #FEF2F2; border: 1px solid #FCA5A5;
          border-radius: 12px; color: #DC2626; font-size: 13px;
        }

        /* Empty */
        .ks-empty {
          background: white; border-radius: 16px; padding: 56px 24px;
          text-align: center; border: 1px dashed #E5E5EA;
        }
        .ks-empty-emoji { font-size: 48px; display: block; margin-bottom: 16px; }
        .ks-empty-title { font-size: 16px; font-weight: 700; color: #1D1D1F; margin-bottom: 8px; }
        .ks-empty-desc { font-size: 13px; color: #6E6E73; margin-bottom: 20px; }
        .ks-empty-cta {
          display: inline-block; padding: 10px 24px;
          background: #0077A8; color: white; border-radius: 10px;
          font-size: 13px; font-weight: 600; text-decoration: none;
        }

        /* Grid */
        .ks-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* Card */
        .ks-card {
          background: white; border-radius: 16px; overflow: hidden;
          text-decoration: none; display: flex; flex-direction: column;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: all 0.22s;
        }
        .ks-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }

        .ks-card-thumb {
          position: relative; height: 150px; overflow: hidden; background: #e8edf2; flex-shrink: 0;
        }
        .ks-card-thumb-img { width: 100%; height: 100%; object-fit: cover; }
        .ks-card-thumb-placeholder { height: 150px !important; border-radius: 0 !important; }
        .ks-card-level {
          position: absolute; top: 8px; left: 8px;
          color: white; font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 999px; text-transform: capitalize;
        }
        .ks-card-overlay-done {
          position: absolute; inset: 0;
          background: rgba(34,197,94,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .ks-card-overlay-done span {
          background: #22C55E; color: white;
          font-size: 13px; font-weight: 700;
          padding: 6px 16px; border-radius: 999px;
        }

        .ks-card-body { padding: 14px 16px; display: flex; flex-direction: column; flex: 1; gap: 6px; }
        .ks-card-title {
          font-size: 13px; font-weight: 700; color: #1D1D1F;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          line-height: 1.4;
        }
        .ks-card-trainer { font-size: 11px; color: #6E6E73; }
        .ks-card-progress { margin-top: 4px; }
        .ks-card-progress-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .ks-card-progress-label { font-size: 11px; color: #9CA3AF; }
        .ks-card-progress-pct { font-size: 11px; font-weight: 700; }
        .ks-card-bar { height: 5px; background: #E5E5EA; border-radius: 999px; overflow: hidden; }
        .ks-card-bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s; }
        .ks-card-date { font-size: 10px; color: #C0C0C7; margin-top: auto; }
        .ks-card-cta {
          margin-top: 10px; padding-top: 10px;
          border-top: 1px solid rgba(0,0,0,0.05);
          font-size: 12px; font-weight: 600; color: #0077A8;
        }
        .ks-loading { display: flex; align-items: center; justify-content: center; min-height: 50vh; }
        .ks-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1024px) { .ks-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .ks-grid { grid-template-columns: 1fr; }
          .ks-controls { flex-direction: column; }
          .ks-search-wrap { min-width: 100%; }
        }
      `}</style>
    </div>
  );
}
