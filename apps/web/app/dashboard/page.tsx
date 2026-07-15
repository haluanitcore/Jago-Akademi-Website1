"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDashboard, type DashboardData } from "../../lib/api/enrollment";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { getValidToken } from "@/lib/auth/token";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Pengguna");

  useEffect(() => {
    // Finding #1: read token via getValidToken so a session persisted only in
    // localStorage (new tab / restore) is honored instead of bouncing to /masuk.
    (async () => {
      const token = await getValidToken();
      if (!token) { router.replace("/masuk"); return; }

      // Fetch user name
      fetch(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((b) => { if (b.success) setUserName(b.data.name.split(" ")[0]); })
        .catch(() => {});

      getDashboard(token)
        .then(setData)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="db-loading">
        <span className="db-spinner" aria-label="Memuat…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="db-error">
        <p className="db-error-title">Gagal memuat dashboard</p>
        <p className="db-error-msg">{error}</p>
        <button onClick={() => router.refresh()} className="db-retry-btn">
          Coba Lagi
        </button>
      </div>
    );
  }

  const { stats, enrollments, recentCertificates } = data;
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div className="db-page">
      {/* ── Greeting Banner ── */}
      <div className="db-greeting-banner">
        <div className="db-greeting-text">
          <p className="db-greeting-sub">{greeting} 👋</p>
          <h1 className="db-greeting-name">Halo, {userName}!</h1>
          <p className="db-greeting-desc">Selamat datang kembali di Jago Akademi. Yuk, lanjutkan belajarnya!</p>
        </div>
        <div className="db-greeting-art" aria-hidden="true">
          <span className="db-art-emoji">🎓</span>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="db-stats-grid">
        {[
          { label: "Terdaftar", value: stats.totalEnrolled, color: "#0077A8", bg: "rgba(0,119,168,0.08)", emoji: "📚" },
          { label: "Sedang Belajar", value: stats.totalInProgress, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", emoji: "▶️" },
          { label: "Selesai", value: stats.totalCompleted, color: "#22C55E", bg: "rgba(34,197,94,0.08)", emoji: "✅" },
          { label: "Sertifikat", value: stats.totalCertificates, color: "#CC0052", bg: "rgba(204,0,82,0.08)", emoji: "🏆" },
        ].map((s) => (
          <div key={s.label} className="db-stat-card" style={{ "--stat-color": s.color, "--stat-bg": s.bg } as React.CSSProperties}>
            <div className="db-stat-emoji">{s.emoji}</div>
            <p className="db-stat-value">{s.value}</p>
            <p className="db-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Access ── */}
      <section className="db-section">
        <h2 className="db-section-title">Akses Cepat</h2>
        <div className="db-quick-grid">
          {[
            { label: "Kursus Saya", href: "/dashboard/kursus", emoji: "📖", desc: "Lanjut belajar" },
            { label: "Sertifikat", href: "/dashboard/sertifikat", emoji: "🏅", desc: "Lihat pencapaian" },
            { label: "E-Book", href: "/dashboard/ebook", emoji: "📥", desc: "Unduh materi" },
            { label: "Tiket Event", href: "/dashboard/tiket", emoji: "🎫", desc: "Event saya" },
            { label: "Pesanan", href: "/dashboard/pesanan", emoji: "🧾", desc: "Riwayat transaksi" },
            { label: "Afiliasi", href: "/dashboard/afiliasi", emoji: "🤝", desc: "Dapatkan komisi" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="db-quick-card">
              <div className="db-quick-emoji">{item.emoji}</div>
              <p className="db-quick-label">{item.label}</p>
              <p className="db-quick-desc">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Enrolled Courses ── */}
      <section className="db-section">
        <div className="db-section-header">
          <h2 className="db-section-title">Kursus Saya</h2>
          <Link href="/dashboard/kursus" className="db-see-all">Lihat Semua →</Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="db-empty-state">
            <span className="db-empty-emoji">📚</span>
            <p className="db-empty-title">Belum ada kursus</p>
            <p className="db-empty-desc">Mulai belajar dengan mendaftar kursus pertama Anda.</p>
            <Link href="/e-course" className="db-empty-cta">Jelajahi Kursus</Link>
          </div>
        ) : (
          <div className="db-course-grid">
            {enrollments.slice(0, 3).map((e) => {
              const pct = Number(e.progressPct);
              return (
                <Link key={e.id} href={`/belajar/${e.course.slug}`} className="db-course-card">
                  <div className="db-course-thumb">
                    {e.course.thumbnailUrl ? (
                      <Image src={e.course.thumbnailUrl} alt={e.course.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="db-course-thumb-img" />
                    ) : (
                      <MediaPlaceholder type="foto" ratio="16:9" showRatio={false} className="db-course-thumb-placeholder" />
                    )}
                    {e.isCompleted && (
                      <span className="db-course-badge-done">✓ Selesai</span>
                    )}
                  </div>
                  <div className="db-course-body">
                    <p className="db-course-title">{e.course.title}</p>
                    {e.course.trainer && (
                      <p className="db-course-trainer">{e.course.trainer.name}</p>
                    )}
                    <div className="db-progress-row">
                      <span className="db-progress-pct">{pct}%</span>
                    </div>
                    <div className="db-progress-bar">
                      <div className="db-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Recent Certificates ── */}
      {recentCertificates.length > 0 && (
        <section className="db-section">
          <div className="db-section-header">
            <h2 className="db-section-title">Sertifikat Terbaru</h2>
            <Link href="/dashboard/sertifikat" className="db-see-all">Lihat Semua →</Link>
          </div>
          <div className="db-cert-list">
            {recentCertificates.slice(0, 3).map((cert) => (
              <div key={cert.id} className="db-cert-card">
                <div className="db-cert-icon">🏅</div>
                <div className="db-cert-info">
                  <p className="db-cert-title">{cert.course.title}</p>
                  <p className="db-cert-date">
                    {new Date(cert.issuedAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="db-cert-actions">
                  <Link href={`/verify/${cert.code}`} className="db-cert-verify">
                    Verifikasi
                  </Link>
                  <a
                    href={`/api/certificates/${cert.code}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="db-cert-download"
                  >
                    Unduh PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        .db-page { display: flex; flex-direction: column; gap: 28px; }

        /* Loading / Error */
        .db-loading { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
        .db-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .db-error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 12px; text-align: center; }
        .db-error-title { font-size: 18px; font-weight: 700; color: #1D1D1F; }
        .db-error-msg { font-size: 14px; color: #6E6E73; }
        .db-retry-btn {
          padding: 10px 24px; background: #0077A8; color: white;
          border: none; border-radius: 10px; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
        }
        .db-retry-btn:hover { background: #005f87; }

        /* Greeting */
        .db-greeting-banner {
          background: linear-gradient(135deg, #0a1628 0%, #0d2b4e 50%, #1a1040 100%);
          border-radius: 20px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .db-greeting-banner::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 80% 50%, rgba(0,119,168,0.25) 0%, transparent 60%);
          pointer-events: none;
        }
        .db-greeting-text { position: relative; }
        .db-greeting-sub { color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 6px; }
        .db-greeting-name { color: white; font-size: 26px; font-weight: 800; margin-bottom: 8px; }
        .db-greeting-desc { color: rgba(255,255,255,0.55); font-size: 14px; max-width: 380px; }
        .db-greeting-art { font-size: 64px; opacity: 0.8; }

        /* Stats */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .db-stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .db-stat-emoji { font-size: 22px; margin-bottom: 10px; }
        .db-stat-value { font-size: 28px; font-weight: 800; color: var(--stat-color); }
        .db-stat-label { font-size: 12px; color: #6E6E73; margin-top: 4px; font-weight: 500; }

        /* Section */
        .db-section { display: flex; flex-direction: column; gap: 14px; }
        .db-section-header { display: flex; align-items: center; justify-content: space-between; }
        .db-section-title { font-size: 17px; font-weight: 700; color: #1D1D1F; }
        .db-see-all { font-size: 13px; color: #0077A8; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
        .db-see-all:hover { opacity: 0.7; }

        /* Quick Access */
        .db-quick-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }
        .db-quick-card {
          background: white;
          border-radius: 16px;
          padding: 16px 12px;
          text-align: center;
          text-decoration: none;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .db-quick-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); border-color: #0077A8; }
        .db-quick-emoji { font-size: 26px; margin-bottom: 8px; }
        .db-quick-label { font-size: 12px; font-weight: 700; color: #1D1D1F; margin-bottom: 3px; }
        .db-quick-desc { font-size: 10px; color: #6E6E73; }

        /* Courses */
        .db-course-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .db-course-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: all 0.2s;
        }
        .db-course-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .db-course-thumb { position: relative; height: 140px; overflow: hidden; background: #e8edf2; }
        .db-course-thumb-img { width: 100%; height: 100%; object-fit: cover; }
        .db-course-thumb-placeholder { height: 140px !important; border-radius: 0 !important; }
        .db-course-badge-done {
          position: absolute; top: 8px; right: 8px;
          background: #22C55E; color: white;
          font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 999px;
        }
        .db-course-body { padding: 14px 16px; }
        .db-course-title { font-size: 13px; font-weight: 600; color: #1D1D1F; line-height: 1.4; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .db-course-trainer { font-size: 11px; color: #6E6E73; margin-bottom: 10px; }
        .db-progress-row { display: flex; justify-content: flex-end; margin-bottom: 4px; }
        .db-progress-pct { font-size: 11px; color: #0077A8; font-weight: 600; }
        .db-progress-bar { height: 5px; background: #E5E5EA; border-radius: 999px; overflow: hidden; }
        .db-progress-fill { height: 100%; background: linear-gradient(90deg, #0077A8, #00a8d9); border-radius: 999px; transition: width 0.5s; }

        /* Empty state */
        .db-empty-state {
          background: white; border-radius: 16px; padding: 48px 24px;
          text-align: center; border: 1px dashed #E5E5EA;
        }
        .db-empty-emoji { font-size: 48px; display: block; margin-bottom: 16px; }
        .db-empty-title { font-size: 16px; font-weight: 700; color: #1D1D1F; margin-bottom: 8px; }
        .db-empty-desc { font-size: 13px; color: #6E6E73; margin-bottom: 20px; }
        .db-empty-cta {
          display: inline-block; padding: 10px 24px;
          background: #0077A8; color: white; border-radius: 10px;
          font-size: 13px; font-weight: 600; text-decoration: none;
          transition: background 0.2s;
        }
        .db-empty-cta:hover { background: #005f87; }

        /* Certificates */
        .db-cert-list { display: flex; flex-direction: column; gap: 10px; }
        .db-cert-card {
          background: white; border-radius: 14px;
          padding: 16px 20px; display: flex; align-items: center; gap: 14px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: box-shadow 0.2s;
        }
        .db-cert-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .db-cert-icon { font-size: 28px; flex-shrink: 0; }
        .db-cert-info { flex: 1; min-width: 0; }
        .db-cert-title { font-size: 13px; font-weight: 600; color: #1D1D1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-cert-date { font-size: 11px; color: #6E6E73; margin-top: 3px; }
        .db-cert-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .db-cert-verify { font-size: 12px; color: #0077A8; text-decoration: none; font-weight: 600; padding: 6px 12px; border: 1px solid #0077A8; border-radius: 8px; transition: all 0.2s; }
        .db-cert-verify:hover { background: #0077A8; color: white; }
        .db-cert-download {
          font-size: 12px; background: #0077A8; color: white; padding: 6px 12px;
          border-radius: 8px; text-decoration: none; font-weight: 600; transition: background 0.2s;
        }
        .db-cert-download:hover { background: #005f87; }

        /* Responsive */
        @media (max-width: 1024px) {
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .db-quick-grid { grid-template-columns: repeat(3, 1fr); }
          .db-course-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .db-greeting-banner { padding: 20px; }
          .db-greeting-name { font-size: 20px; }
          .db-greeting-art { display: none; }
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .db-quick-grid { grid-template-columns: repeat(2, 1fr); }
          .db-course-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
