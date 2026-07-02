"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  status: string;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string };
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", coverUrl: "", category: "", tags: "", status: "draft" });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: "1", limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/blog/admin/posts?${params}`);
    const data = await res.json();
    if (data.success) { setPosts(data.data); setTotal(data.meta?.total ?? 0); }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function openEditForm(post: BlogPost) {
    setEditingPost(post);
    setShowForm(true);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: "",
      content: "",
      coverUrl: "",
      category: post.category ?? "",
      tags: "",
      status: post.status,
    });
    setMsg("");
  }

  function openNewForm() {
    setEditingPost(null);
    setShowForm(true);
    setForm({ title: "", slug: "", excerpt: "", content: "", coverUrl: "", category: "", tags: "", status: "draft" });
    setMsg("");
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    const body = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverUrl: form.coverUrl || undefined,
      excerpt: form.excerpt || undefined,
      category: form.category || undefined,
    };

    if (editingPost) {
      const res = await fetch(`/api/blog/admin/posts/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Artikel berhasil diperbarui.");
        setShowForm(false);
        setEditingPost(null);
        fetchPosts();
      } else {
        setMsg(data.error?.message ?? "Gagal memperbarui artikel.");
      }
    } else {
      const res = await fetch("/api/blog/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Artikel berhasil dibuat.");
        setShowForm(false);
        setForm({ title: "", slug: "", excerpt: "", content: "", coverUrl: "", category: "", tags: "", status: "draft" });
        fetchPosts();
      } else {
        setMsg(data.error?.message ?? "Gagal membuat artikel.");
      }
    }
    setSubmitting(false);
  }

  async function toggleStatus(post: BlogPost) {
    const newStatus = post.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/blog/admin/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) fetchPosts();
  }

  async function deletePost(post: BlogPost) {
    if (!confirm(`Hapus artikel "${post.title}"?`)) return;
    const res = await fetch(`/api/blog/admin/posts/${post.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchPosts();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#6E6E73] mb-1">
            <Link href="/admin" className="hover:text-[#0077A8]">Admin</Link>
            <span>/</span>
            <span className="text-[#1D1D1F]">Blog CMS</span>
          </div>
          <h1 className="text-xl font-bold text-[#1D1D1F]">Blog CMS</h1>
        </div>
        <div className="flex gap-2">
          {showForm && (
            <button onClick={() => { setShowForm(false); setEditingPost(null); }} className="px-4 py-2 border border-[#E5E5EA] text-[#6E6E73] text-sm rounded-xl hover:bg-[#F5F5F7]">
              Batal
            </button>
          )}
          {!showForm && (
            <button onClick={openNewForm} className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87]">
              + Artikel Baru
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 mb-6">
          <h2 className="font-semibold text-[#1D1D1F] mb-4">{editingPost ? `Edit: ${editingPost.title}` : "Buat Artikel Baru"}</h2>
          <form onSubmit={createPost} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "title", label: "Judul", placeholder: "Judul artikel" },
                { key: "slug", label: "Slug", placeholder: "judul-artikel-saya" },
                { key: "category", label: "Kategori", placeholder: "Bisnis, Marketing..." },
                { key: "coverUrl", label: "URL Cover", placeholder: "https://..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                    required={key === "title" || key === "slug"}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">Ringkasan</label>
              <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Ringkasan singkat artikel..." className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">Konten</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required placeholder="Isi artikel..." className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">Tags (pisah dengan koma)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="digital, marketing, tips" className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]">
                  <option value="draft">Draft</option>
                  <option value="published">Publikasikan</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#0077A8] text-white text-sm font-medium rounded-xl hover:bg-[#005f87] disabled:opacity-50">
                {submitting ? "Menyimpan..." : editingPost ? "Perbarui Artikel" : "Simpan Artikel"}
              </button>
              {msg && <p className="text-sm text-[#0077A8]">{msg}</p>}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA]">
          <p className="text-sm text-[#6E6E73]">{total} artikel</p>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-[#E5E5EA] rounded-lg px-2 py-1.5">
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-8 text-[#6E6E73]">Memuat...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-[#6E6E73]">Belum ada artikel.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F7] text-[#6E6E73]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Judul</th>
                <th className="px-4 py-3 text-left font-medium">Kategori</th>
                <th className="px-4 py-3 text-left font-medium">Penulis</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                <th className="px-4 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7]">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F5F5F7]">
                  <td className="px-4 py-3">
                    <Link href={`/blog/${p.slug}`} target="_blank" className="font-medium text-[#1D1D1F] hover:text-[#0077A8] line-clamp-1">{p.title}</Link>
                    <p className="text-xs text-[#6E6E73]">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[#6E6E73]">{p.category ?? "—"}</td>
                  <td className="px-4 py-3 text-[#6E6E73]">{p.author.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-[#F5F5F7] text-[#6E6E73]"}`}>
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6E6E73]">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("id-ID") : new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => openEditForm(p)} className="text-xs px-2.5 py-1 rounded-lg border border-[#0077A8] text-[#0077A8] hover:bg-[#E8F4F9]">
                        Edit
                      </button>
                      <button onClick={() => toggleStatus(p)} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${p.status === "published" ? "border-amber-300 text-amber-600 hover:bg-amber-50" : "border-green-300 text-green-600 hover:bg-green-50"}`}>
                        {p.status === "published" ? "Draft" : "Publish"}
                      </button>
                      <button onClick={() => deletePost(p)} className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
