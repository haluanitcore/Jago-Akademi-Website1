"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth/token";

type Course = {
  id: string;
  title: string;
  slug: string;
  status: string;
  level: string | null;
  price: string;
  salePrice: string | null;
  totalEnrolled: number;
  avgRating: string;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  trainer: { id: string; name: string; email: string };
  category: { name: string } | null;
  _count?: { lessons: number };
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-600" },
  pending:   { label: "Review",    cls: "bg-yellow-100 text-yellow-700" },
  published: { label: "Aktif",     cls: "bg-green-100 text-green-700" },
  rejected:  { label: "Ditolak",   cls: "bg-red-100 text-red-700" },
  archived:  { label: "Arsip",     cls: "bg-gray-100 text-gray-500" },
};

const LEVEL_LABEL: Record<string, string> = {
  beginner:     "🟢 Pemula",
  intermediate: "🟡 Menengah",
  advanced:     "🔴 Mahir",
};


export default function AdminKursusPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 10;

  function loadCourses() {
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search ? { search } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });
    setLoading(true);
    fetch(`/api/admin/courses?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setCourses(body.data?.courses ?? body.data ?? []);
          setTotal(body.data?.total ?? body.data?.length ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadCourses(); }, [page, statusFilter]); // eslint-disable-line

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); loadCourses(); }

  async function updateStatus(courseId: string, newStatus: string) {
    const token = getToken();
    if (!token) return;
    setActionLoading(courseId + newStatus);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setActionLoading(null);
    loadCourses();
  }

  async function toggleFeatured(courseId: string, current: boolean) {
    const token = getToken();
    if (!token) return;
    setActionLoading(courseId + "feat");
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !current }),
    });
    setActionLoading(null);
    loadCourses();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="ak-page">
      {/* Header */}
      <div className="ak-header">
        <div>
          <h1 className="ak-title">Manajemen Kursus</h1>
          <p className="ak-sub">{total.toLocaleString("id-ID")} kursus total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="ak-filters">
        <form onSubmit={handleSearch} className="ak-search-form">
          <input className="ak-search-input" placeholder="Cari judul kursus atau trainer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="ak-search-btn">🔍 Cari</button>
        </form>
        <div className="ak-status-tabs">
          {["all", "pending", "published", "draft", "rejected", "archived"].map((s) => {
            const info = STATUS_MAP[s];
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`ak-status-tab ${statusFilter === s ? "ak-tab-active" : ""}`}>
                {s === "all" ? "Semua" : info?.label ?? s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="ak-table-wrap">
        {loading ? (
          <div className="ak-loading"><span className="ak-spinner" /></div>
        ) : courses.length === 0 ? (
          <div className="ak-empty"><p>📖</p><p>Tidak ada kursus ditemukan</p></div>
        ) : (
          <table className="ak-table">
            <thead>
              <tr>
                <th>Kursus</th>
                <th>Trainer</th>
                <th>Status</th>
                <th>Level</th>
                <th>Harga</th>
                <th>Pendaftar</th>
                <th>Rating</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const status = STATUS_MAP[c.status] ?? STATUS_MAP["draft"]!;
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="ak-course-cell">
                        <div>
                          <p className="ak-course-title">
                            {c.title}
                            {c.isFeatured && <span className="ak-featured-badge">⭐ Unggulan</span>}
                          </p>
                          <p className="ak-course-cat">{c.category?.name ?? "Umum"} · {c._count?.lessons ?? 0} pelajaran</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="ak-trainer-name">{c.trainer.name}</p>
                      <p className="ak-trainer-email">{c.trainer.email}</p>
                    </td>
                    <td>
                      <span className={`ak-badge ${status.cls}`}>{status.label}</span>
                    </td>
                    <td>
                      <span className="ak-level">{LEVEL_LABEL[c.level ?? ""] ?? "—"}</span>
                    </td>
                    <td>
                      <div>
                        {c.salePrice && Number(c.salePrice) < Number(c.price) ? (
                          <>
                            <p className="ak-sale-price">Rp {Number(c.salePrice).toLocaleString("id-ID")}</p>
                            <p className="ak-orig-price">Rp {Number(c.price).toLocaleString("id-ID")}</p>
                          </>
                        ) : (
                          <p className="ak-price">
                            {Number(c.price) === 0 ? "Gratis" : `Rp ${Number(c.price).toLocaleString("id-ID")}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td><span className="ak-enrolled">🎓 {c.totalEnrolled}</span></td>
                    <td><span className="ak-rating">⭐ {parseFloat(c.avgRating).toFixed(1)}</span></td>
                    <td>
                      <div className="ak-actions">
                        {c.status === "pending" && (
                          <>
                            <button
                              className="ak-btn ak-btn-approve"
                              onClick={() => updateStatus(c.id, "published")}
                              disabled={actionLoading !== null}
                            >✓ Approve</button>
                            <button
                              className="ak-btn ak-btn-reject"
                              onClick={() => updateStatus(c.id, "rejected")}
                              disabled={actionLoading !== null}
                            >✕ Tolak</button>
                          </>
                        )}
                        {c.status === "published" && (
                          <button
                            className="ak-btn ak-btn-archive"
                            onClick={() => updateStatus(c.id, "archived")}
                            disabled={actionLoading !== null}
                          >Arsip</button>
                        )}
                        {(c.status === "rejected" || c.status === "archived") && (
                          <button
                            className="ak-btn ak-btn-approve"
                            onClick={() => updateStatus(c.id, "published")}
                            disabled={actionLoading !== null}
                          >Aktifkan</button>
                        )}
                        <button
                          className={`ak-btn ${c.isFeatured ? "ak-btn-unfeat" : "ak-btn-feat"}`}
                          onClick={() => toggleFeatured(c.id, c.isFeatured)}
                          disabled={actionLoading !== null}
                          title={c.isFeatured ? "Hapus dari unggulan" : "Jadikan unggulan"}
                        >
                          {c.isFeatured ? "☆" : "⭐"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ak-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="ak-page-btn">← Prev</button>
          <span className="ak-page-info">Halaman {page} dari {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ak-page-btn">Next →</button>
        </div>
      )}

      <style jsx>{`
        .ak-page { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; }
        .ak-header { display: flex; align-items: center; justify-content: space-between; }
        .ak-title { font-size: 20px; font-weight: 800; color: #1D1D1F; }
        .ak-sub { font-size: 13px; color: #6E6E73; margin-top: 3px; }

        .ak-filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ak-search-form { display: flex; gap: 8px; flex: 1; min-width: 240px; }
        .ak-search-input { flex: 1; padding: 9px 14px; border-radius: 10px; border: 1.5px solid #E5E5EA; font-size: 13px; outline: none; }
        .ak-search-input:focus { border-color: #0077A8; box-shadow: 0 0 0 3px rgba(0,119,168,0.1); }
        .ak-search-btn { padding: 9px 16px; border-radius: 10px; background: #0077A8; color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer; }
        .ak-search-btn:hover { background: #005f87; }

        .ak-status-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .ak-status-tab { padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1.5px solid #E5E5EA; background: white; cursor: pointer; color: #6E6E73; transition: all 0.18s; }
        .ak-tab-active { background: #0077A8; color: white; border-color: #0077A8; }

        .ak-table-wrap { background: white; border-radius: 18px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow-x: auto; }
        .ak-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .ak-table thead tr { background: #F9FAFB; border-bottom: 1px solid #F0F0F5; }
        .ak-table th { padding: 12px 14px; font-size: 11px; font-weight: 700; color: #6E6E73; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap; }
        .ak-table td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #F5F5F7; vertical-align: middle; }
        .ak-table tr:last-child td { border-bottom: none; }
        .ak-table tr:hover td { background: #FAFAFA; }

        .ak-course-cell { display: flex; align-items: flex-start; gap: 10px; }
        .ak-course-title { font-size: 13px; font-weight: 600; color: #1D1D1F; max-width: 200px; line-height: 1.3; }
        .ak-featured-badge { font-size: 9px; background: #FEF3C7; color: #D97706; padding: 2px 6px; border-radius: 999px; margin-left: 4px; font-weight: 700; }
        .ak-course-cat { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
        .ak-trainer-name { font-size: 13px; font-weight: 500; }
        .ak-trainer-email { font-size: 11px; color: #9CA3AF; }
        .ak-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; display: inline-block; }
        .ak-level { font-size: 12px; }
        .ak-price { font-size: 13px; font-weight: 600; color: #1D1D1F; }
        .ak-sale-price { font-size: 13px; font-weight: 700; color: #0077A8; }
        .ak-orig-price { font-size: 10px; color: #9CA3AF; text-decoration: line-through; }
        .ak-enrolled { font-size: 12px; font-weight: 600; color: #059669; }
        .ak-rating { font-size: 12px; font-weight: 600; color: #D97706; }

        .ak-actions { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
        .ak-btn { padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
        .ak-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ak-btn-approve { background: #DCFCE7; color: #16A34A; }
        .ak-btn-approve:hover:not(:disabled) { background: #16A34A; color: white; }
        .ak-btn-reject { background: #FEE2E2; color: #DC2626; }
        .ak-btn-reject:hover:not(:disabled) { background: #DC2626; color: white; }
        .ak-btn-archive { background: #F3F4F6; color: #6B7280; }
        .ak-btn-archive:hover:not(:disabled) { background: #6B7280; color: white; }
        .ak-btn-feat { background: #FEF3C7; color: #D97706; font-size: 14px; padding: 4px 8px; }
        .ak-btn-unfeat { background: #F3F4F6; color: #9CA3AF; font-size: 14px; padding: 4px 8px; }

        .ak-loading { display: flex; justify-content: center; padding: 48px; }
        .ak-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #0077A8; border-top-color: transparent; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ak-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: #9CA3AF; font-size: 14px; }
        .ak-empty p:first-child { font-size: 32px; }

        .ak-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .ak-page-btn { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E5E5EA; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #1D1D1F; transition: all 0.18s; }
        .ak-page-btn:hover:not(:disabled) { border-color: #0077A8; color: #0077A8; }
        .ak-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ak-page-info { font-size: 13px; color: #6E6E73; }
      `}</style>
    </div>
  );
}
