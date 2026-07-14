"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth/token";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string } | null;
  category: { name: string } | null;
  _count?: { comments: number };
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Draft",   cls: "bg-gray-100 text-gray-600" },
  published: { label: "Aktif",   cls: "bg-green-100 text-green-700" },
  archived:  { label: "Arsip",   cls: "bg-gray-100 text-gray-500" },
};


export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  function loadPosts() {
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search ? { search } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });
    setLoading(true);
    fetch(`/api/admin/blog?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) { setPosts(body.data?.posts ?? body.data ?? []); setTotal(body.data?.total ?? 0); }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadPosts(); }, [page, statusFilter]); // eslint-disable-line

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); loadPosts(); }

  async function updateStatus(id: string, status: string) {
    const token = getToken();
    if (!token) return;
    await fetch(`/api/admin/blog/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadPosts();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bl-page">
      <div className="bl-header">
        <div>
          <h1 className="bl-title">Manajemen Blog</h1>
          <p className="bl-sub">{total.toLocaleString("id-ID")} artikel</p>
        </div>
      </div>

      <div className="bl-filters">
        <form onSubmit={handleSearch} className="bl-search-form">
          <input className="bl-input" placeholder="Cari artikel..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="bl-search-btn">🔍 Cari</button>
        </form>
        <div className="bl-tabs">
          {["all", "published", "draft", "archived"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`bl-tab ${statusFilter === s ? "bl-tab-active" : ""}`}>
              {s === "all" ? "Semua" : STATUS_MAP[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="bl-table-wrap">
        {loading ? (
          <div className="bl-loading"><span className="bl-spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="bl-empty"><p>✍️</p><p>Tidak ada artikel ditemukan</p></div>
        ) : (
          <table className="bl-table">
            <thead>
              <tr><th>Judul</th><th>Penulis</th><th>Kategori</th><th>Status</th><th>Dipublikasi</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {posts.map((p) => {
                const s = STATUS_MAP[p.status] ?? STATUS_MAP["draft"]!;
                return (
                  <tr key={p.id}>
                    <td>
                      <p className="bl-post-title">{p.title}</p>
                      {p.excerpt && <p className="bl-excerpt">{p.excerpt.slice(0, 80)}…</p>}
                    </td>
                    <td><span className="bl-author">{p.author?.name ?? "—"}</span></td>
                    <td><span className="bl-cat">{p.category?.name ?? "Umum"}</span></td>
                    <td><span className={`bl-badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      <span className="bl-date">
                        {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="bl-actions">
                        {p.status !== "published" && (
                          <button className="bl-btn bl-btn-publish" onClick={() => updateStatus(p.id, "published")}>Publikasi</button>
                        )}
                        {p.status === "published" && (
                          <button className="bl-btn bl-btn-draft" onClick={() => updateStatus(p.id, "draft")}>Jadikan Draft</button>
                        )}
                        {p.status !== "archived" && (
                          <button className="bl-btn bl-btn-archive" onClick={() => updateStatus(p.id, "archived")}>Arsip</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="bl-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="bl-page-btn">← Prev</button>
          <span className="bl-page-info">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bl-page-btn">Next →</button>
        </div>
      )}

      <style jsx>{`
        .bl-page { display:flex; flex-direction:column; gap:20px; max-width:1100px; }
        .bl-header { display:flex; align-items:center; justify-content:space-between; }
        .bl-title { font-size:20px; font-weight:800; color:#1D1D1F; }
        .bl-sub { font-size:13px; color:#6E6E73; margin-top:3px; }
        .bl-filters { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .bl-search-form { display:flex; gap:8px; flex:1; min-width:240px; }
        .bl-input { flex:1; padding:9px 14px; border-radius:10px; border:1.5px solid #E5E5EA; font-size:13px; outline:none; }
        .bl-input:focus { border-color:#0077A8; box-shadow:0 0 0 3px rgba(0,119,168,0.1); }
        .bl-search-btn { padding:9px 16px; border-radius:10px; background:#0077A8; color:white; border:none; font-size:13px; font-weight:600; cursor:pointer; }
        .bl-tabs { display:flex; gap:6px; }
        .bl-tab { padding:7px 14px; border-radius:999px; font-size:12px; font-weight:600; border:1.5px solid #E5E5EA; background:white; cursor:pointer; color:#6E6E73; transition:all 0.18s; }
        .bl-tab-active { background:#0077A8; color:white; border-color:#0077A8; }
        .bl-table-wrap { background:white; border-radius:18px; overflow:hidden; border:1px solid rgba(0,0,0,0.06); box-shadow:0 1px 4px rgba(0,0,0,0.06); }
        .bl-table { width:100%; border-collapse:collapse; }
        .bl-table thead tr { background:#F9FAFB; border-bottom:1px solid #F0F0F5; }
        .bl-table th { padding:12px 14px; font-size:11px; font-weight:700; color:#6E6E73; text-transform:uppercase; letter-spacing:0.05em; text-align:left; white-space:nowrap; }
        .bl-table td { padding:11px 14px; font-size:13px; border-bottom:1px solid #F5F5F7; vertical-align:middle; }
        .bl-table tr:last-child td { border-bottom:none; }
        .bl-table tr:hover td { background:#FAFAFA; }
        .bl-post-title { font-size:13px; font-weight:600; color:#1D1D1F; max-width:220px; }
        .bl-excerpt { font-size:11px; color:#9CA3AF; margin-top:2px; }
        .bl-author { font-size:13px; }
        .bl-cat { font-size:11px; background:#F5F5F7; padding:3px 8px; border-radius:6px; color:#6E6E73; }
        .bl-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; display:inline-block; }
        .bl-date { font-size:12px; color:#6E6E73; }
        .bl-actions { display:flex; gap:4px; flex-wrap:wrap; }
        .bl-btn { padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; border:none; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
        .bl-btn-publish { background:#DCFCE7; color:#16A34A; }
        .bl-btn-publish:hover { background:#16A34A; color:white; }
        .bl-btn-draft { background:#FEF3C7; color:#D97706; }
        .bl-btn-draft:hover { background:#D97706; color:white; }
        .bl-btn-archive { background:#F3F4F6; color:#6B7280; }
        .bl-btn-archive:hover { background:#6B7280; color:white; }
        .bl-loading { display:flex; justify-content:center; padding:48px; }
        .bl-spinner { width:32px; height:32px; border-radius:50%; border:3px solid #0077A8; border-top-color:transparent; animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .bl-empty { display:flex; flex-direction:column; align-items:center; gap:8px; padding:48px; color:#9CA3AF; font-size:14px; }
        .bl-empty p:first-child { font-size:32px; }
        .bl-pagination { display:flex; align-items:center; justify-content:center; gap:16px; }
        .bl-page-btn { padding:8px 16px; border-radius:10px; border:1.5px solid #E5E5EA; background:white; font-size:13px; font-weight:600; cursor:pointer; }
        .bl-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .bl-page-info { font-size:13px; color:#6E6E73; }
      `}</style>
    </div>
  );
}
