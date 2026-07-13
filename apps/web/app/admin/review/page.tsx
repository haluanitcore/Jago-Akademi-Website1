"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user: { name: string; email: string };
  course: { title: string } | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token") || sessionStorage.getItem("jg_token");
}

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  function loadReviews() {
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(filter !== "all" ? { approved: String(filter === "approved") } : {}) });
    setLoading(true);
    fetch(`/api/admin/reviews?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) { setReviews(body.data?.reviews ?? body.data ?? []); setTotal(body.data?.total ?? 0); }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadReviews(); }, [page, filter]); // eslint-disable-line

  async function toggleApprove(id: string, current: boolean) {
    const token = getToken();
    if (!token) return;
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !current }),
    });
    loadReviews();
  }

  async function deleteReview(id: string) {
    if (!confirm("Hapus review ini?")) return;
    const token = getToken();
    if (!token) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    loadReviews();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="rv-page">
      <div className="rv-header">
        <div>
          <h1 className="rv-title">Moderasi Review</h1>
          <p className="rv-sub">{total.toLocaleString("id-ID")} review total</p>
        </div>
        <div className="rv-tabs">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`rv-tab ${filter === f ? "rv-tab-active" : ""}`}>
              {f === "all" ? "Semua" : f === "pending" ? "⏳ Menunggu" : "✅ Disetujui"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rv-loading"><span className="rv-spinner" /></div>
      ) : reviews.length === 0 ? (
        <div className="rv-empty"><p>⭐</p><p>Tidak ada review ditemukan</p></div>
      ) : (
        <div className="rv-list">
          {reviews.map((r) => (
            <div key={r.id} className={`rv-card ${!r.isApproved ? "rv-card-pending" : ""}`}>
              <div className="rv-card-top">
                <div className="rv-user">
                  <div className="rv-avatar">{r.user.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <p className="rv-user-name">{r.user.name}</p>
                    <p className="rv-course">{r.course?.title ?? "—"}</p>
                  </div>
                </div>
                <div className="rv-meta">
                  <div className="rv-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  <p className="rv-date">{new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
              {r.comment && <p className="rv-comment">{r.comment}</p>}
              <div className="rv-actions">
                <span className={`rv-badge ${r.isApproved ? "rv-badge-ok" : "rv-badge-pending"}`}>
                  {r.isApproved ? "✓ Disetujui" : "⏳ Menunggu"}
                </span>
                <button className={`rv-btn ${r.isApproved ? "rv-btn-warn" : "rv-btn-ok"}`} onClick={() => toggleApprove(r.id, r.isApproved)}>
                  {r.isApproved ? "Cabut" : "Setujui"}
                </button>
                <button className="rv-btn rv-btn-del" onClick={() => deleteReview(r.id)}>🗑 Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="rv-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rv-page-btn">← Prev</button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rv-page-btn">Next →</button>
        </div>
      )}

      <style jsx>{`
        .rv-page { display:flex; flex-direction:column; gap:20px; max-width:900px; }
        .rv-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
        .rv-title { font-size:20px; font-weight:800; color:#1D1D1F; }
        .rv-sub { font-size:13px; color:#6E6E73; margin-top:3px; }
        .rv-tabs { display:flex; gap:6px; }
        .rv-tab { padding:7px 14px; border-radius:999px; font-size:12px; font-weight:600; border:1.5px solid #E5E5EA; background:white; cursor:pointer; color:#6E6E73; transition:all 0.18s; }
        .rv-tab-active { background:#0077A8; color:white; border-color:#0077A8; }
        .rv-list { display:flex; flex-direction:column; gap:12px; }
        .rv-card { background:white; border-radius:16px; padding:18px; border:1px solid rgba(0,0,0,0.06); box-shadow:0 1px 4px rgba(0,0,0,0.06); }
        .rv-card-pending { border-left:3px solid #F59E0B; }
        .rv-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px; }
        .rv-user { display:flex; align-items:center; gap:10px; }
        .rv-avatar { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#0077A8,#CC0052); color:white; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rv-user-name { font-size:13px; font-weight:700; }
        .rv-course { font-size:11px; color:#6E6E73; }
        .rv-meta { text-align:right; }
        .rv-stars { font-size:14px; color:#FBBF24; }
        .rv-date { font-size:11px; color:#9CA3AF; margin-top:3px; }
        .rv-comment { font-size:13px; color:#374151; line-height:1.5; margin-bottom:12px; padding:10px 12px; background:#F9FAFB; border-radius:8px; }
        .rv-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .rv-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; margin-right:auto; }
        .rv-badge-ok { background:#DCFCE7; color:#16A34A; }
        .rv-badge-pending { background:#FEF3C7; color:#D97706; }
        .rv-btn { padding:6px 12px; border-radius:8px; font-size:11px; font-weight:700; border:none; cursor:pointer; transition:all 0.18s; }
        .rv-btn-ok { background:#DCFCE7; color:#16A34A; }
        .rv-btn-ok:hover { background:#16A34A; color:white; }
        .rv-btn-warn { background:#FEF3C7; color:#D97706; }
        .rv-btn-warn:hover { background:#D97706; color:white; }
        .rv-btn-del { background:#FEE2E2; color:#DC2626; }
        .rv-btn-del:hover { background:#DC2626; color:white; }
        .rv-loading { display:flex; justify-content:center; padding:48px; }
        .rv-spinner { width:32px; height:32px; border-radius:50%; border:3px solid #0077A8; border-top-color:transparent; animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .rv-empty { display:flex; flex-direction:column; align-items:center; gap:8px; padding:48px; color:#9CA3AF; font-size:14px; }
        .rv-empty p:first-child { font-size:32px; }
        .rv-pagination { display:flex; align-items:center; justify-content:center; gap:16px; font-size:13px; color:#6E6E73; }
        .rv-page-btn { padding:8px 16px; border-radius:10px; border:1.5px solid #E5E5EA; background:white; font-size:13px; font-weight:600; cursor:pointer; }
        .rv-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>
    </div>
  );
}
