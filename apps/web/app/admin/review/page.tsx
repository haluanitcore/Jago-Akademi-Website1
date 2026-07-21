"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth/token";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user: { name: string; email: string };
  course: { title: string } | null;
};

// Defensive typing: backend fields may lag behind (category/outcome ship in parallel).
type Testimonial = {
  id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  quote?: string | null;
  rating?: number | null;
  status?: string;
  featured?: boolean;
  category?: string | null;
  outcome?: string | null;
  createdAt?: string;
};

type ModerationDraft = { category: string; outcome: string };


export default function AdminReviewPage() {
  const [mode, setMode] = useState<"review" | "testimoni">("review");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  // Testimonial moderation state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tLoading, setTLoading] = useState(false);
  const [tFilter, setTFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [drafts, setDrafts] = useState<Record<string, ModerationDraft>>({});

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

  function loadTestimonials() {
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams(tFilter !== "all" ? { status: tFilter } : {});
    setTLoading(true);
    fetch(`/api/testimonials/admin?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          const items: Testimonial[] = Array.isArray(body.data) ? body.data : [];
          setTestimonials(items);
          // Seed per-row moderation drafts from server values (keep unsaved edits).
          setDrafts((prev) => {
            const next = { ...prev };
            for (const t of items) {
              if (!next[t.id]) {
                next[t.id] = { category: t.category ?? "general", outcome: t.outcome ?? "" };
              }
            }
            return next;
          });
        }
      })
      .finally(() => setTLoading(false));
  }

  useEffect(() => {
    if (mode === "testimoni") loadTestimonials();
  }, [mode, tFilter]); // eslint-disable-line

  function setDraft(id: string, patch: Partial<ModerationDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { category: "general", outcome: "", ...prev[id], ...patch },
    }));
  }

  async function moderateTestimonial(id: string, status: "approved" | "rejected" | "pending") {
    const draft = drafts[id] ?? { category: "general", outcome: "" };
    if (draft.outcome.trim().length > 300) {
      alert("Outcome maksimal 300 karakter.");
      return;
    }
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/testimonials/${id}/moderate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          category: draft.category,
          outcome: draft.outcome.trim() || null,
        }),
      });
      const body = await res.json();
      if (!body.success) {
        alert(body.error?.message ?? "Gagal memoderasi testimoni.");
        return;
      }
      loadTestimonials();
    } catch {
      alert("Gagal menghubungi server.");
    }
  }

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
          <h1 className="rv-title">{mode === "review" ? "Moderasi Review" : "Moderasi Testimoni"}</h1>
          <p className="rv-sub">
            {mode === "review"
              ? `${total.toLocaleString("id-ID")} review total`
              : `${testimonials.length.toLocaleString("id-ID")} testimoni ditampilkan`}
          </p>
        </div>
        <div className="rv-mode-tabs">
          {(["review", "testimoni"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rv-tab ${mode === m ? "rv-tab-active" : ""}`}>
              {m === "review" ? "⭐ Review Kursus" : "💬 Testimoni"}
            </button>
          ))}
        </div>
        {mode === "review" ? (
          <div className="rv-tabs">
            {(["all", "pending", "approved"] as const).map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`rv-tab ${filter === f ? "rv-tab-active" : ""}`}>
                {f === "all" ? "Semua" : f === "pending" ? "⏳ Menunggu" : "✅ Disetujui"}
              </button>
            ))}
          </div>
        ) : (
          <div className="rv-tabs">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button key={f} onClick={() => setTFilter(f)} className={`rv-tab ${tFilter === f ? "rv-tab-active" : ""}`}>
                {f === "all" ? "Semua" : f === "pending" ? "⏳ Menunggu" : f === "approved" ? "✅ Disetujui" : "🚫 Ditolak"}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === "testimoni" ? (
        tLoading ? (
          <div className="rv-loading"><span className="rv-spinner" /></div>
        ) : testimonials.length === 0 ? (
          <div className="rv-empty"><p>💬</p><p>Tidak ada testimoni ditemukan</p></div>
        ) : (
          <div className="rv-list">
            {testimonials.map((t) => {
              const draft = drafts[t.id] ?? { category: t.category ?? "general", outcome: t.outcome ?? "" };
              return (
                <div key={t.id} className={`rv-card ${t.status === "pending" ? "rv-card-pending" : ""}`}>
                  <div className="rv-card-top">
                    <div className="rv-user">
                      <div className="rv-avatar">{(t.name ?? "?").slice(0, 2).toUpperCase()}</div>
                      <div>
                        <p className="rv-user-name">{t.name}</p>
                        <p className="rv-course">{[t.role, t.company].filter(Boolean).join(" · ") || "—"}</p>
                      </div>
                    </div>
                    <div className="rv-meta">
                      {typeof t.rating === "number" && (
                        <div className="rv-stars">{"★".repeat(t.rating)}{"☆".repeat(Math.max(0, 5 - t.rating))}</div>
                      )}
                      {t.createdAt && <p className="rv-date">{new Date(t.createdAt).toLocaleDateString("id-ID")}</p>}
                    </div>
                  </div>
                  {t.quote && <p className="rv-comment">{t.quote}</p>}
                  <div className="rv-mod-fields">
                    <div className="rv-mod-field">
                      <label className="rv-mod-label">Kategori</label>
                      <select
                        className="rv-mod-input"
                        value={draft.category}
                        onChange={(e) => setDraft(t.id, { category: e.target.value })}
                      >
                        <option value="general">Umum</option>
                        <option value="alumni">Alumni</option>
                      </select>
                    </div>
                    <div className="rv-mod-field rv-mod-field-grow">
                      <label className="rv-mod-label">Outcome (opsional, maks 300)</label>
                      <input
                        type="text"
                        maxLength={300}
                        className="rv-mod-input"
                        placeholder="Kini bekerja sebagai ... di ..."
                        value={draft.outcome}
                        onChange={(e) => setDraft(t.id, { outcome: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="rv-actions">
                    <span className={`rv-badge ${t.status === "approved" ? "rv-badge-ok" : t.status === "rejected" ? "rv-badge-no" : "rv-badge-pending"}`}>
                      {t.status === "approved" ? "✓ Disetujui" : t.status === "rejected" ? "🚫 Ditolak" : "⏳ Menunggu"}
                    </span>
                    {t.featured && <span className="rv-badge rv-badge-star">★ Featured</span>}
                    {t.status !== "approved" && (
                      <button className="rv-btn rv-btn-ok" onClick={() => moderateTestimonial(t.id, "approved")}>Setujui</button>
                    )}
                    {t.status === "approved" && (
                      <button className="rv-btn rv-btn-ok" onClick={() => moderateTestimonial(t.id, "approved")}>Simpan</button>
                    )}
                    {t.status !== "rejected" && (
                      <button className="rv-btn rv-btn-del" onClick={() => moderateTestimonial(t.id, "rejected")}>Tolak</button>
                    )}
                    {t.status !== "pending" && (
                      <button className="rv-btn rv-btn-warn" onClick={() => moderateTestimonial(t.id, "pending")}>Kembalikan ke Menunggu</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : loading ? (
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

      {mode === "review" && totalPages > 1 && (
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
        .rv-tabs { display:flex; gap:6px; flex-wrap:wrap; }
        .rv-mode-tabs { display:flex; gap:6px; }
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
        .rv-badge-no { background:#FEE2E2; color:#DC2626; }
        .rv-badge-star { background:#FEF3C7; color:#B45309; margin-right:0; }
        .rv-mod-fields { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
        .rv-mod-field { display:flex; flex-direction:column; gap:4px; min-width:140px; }
        .rv-mod-field-grow { flex:1; min-width:220px; }
        .rv-mod-label { font-size:10px; font-weight:700; color:#6E6E73; text-transform:uppercase; letter-spacing:0.05em; }
        .rv-mod-input { padding:7px 10px; border-radius:8px; border:1.5px solid #E5E5EA; font-size:12.5px; outline:none; background:white; }
        .rv-mod-input:focus { border-color:#0077A8; }
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
