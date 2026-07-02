"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Review = {
  id: string;
  itemType: string;
  itemId: string;
  rating: number;
  content: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [moderating, setModerating] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: "1", limit: "30" });
    if (statusFilter) params.set("status", statusFilter);
    if (itemTypeFilter) params.set("itemType", itemTypeFilter);
    const res = await fetch(`/api/reviews/admin?${params}`);
    const data = await res.json();
    if (data.success) { setReviews(data.data); setTotal(data.meta?.total ?? 0); }
    setLoading(false);
  }, [statusFilter, itemTypeFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function moderate(reviewId: string, newStatus: string) {
    setModerating(reviewId);
    const res = await fetch(`/api/reviews/${reviewId}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, status: newStatus } : r));
    }
    setModerating(null);
  }

  const ITEM_TYPE_LABEL: Record<string, string> = {
    course: "Kursus", event: "Event", ebook: "E-Book", blog_post: "Blog",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#6E6E73] mb-4">
        <Link href="/admin" className="hover:text-[#0077A8]">Admin</Link>
        <span>/</span>
        <span className="text-[#1D1D1F]">Moderasi Ulasan</span>
      </div>
      <h1 className="text-xl font-bold text-[#1D1D1F] mb-6">Moderasi Ulasan</h1>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5E5EA]">
          <p className="text-sm text-[#6E6E73] flex-1">{total} ulasan</p>
          <select value={itemTypeFilter} onChange={(e) => setItemTypeFilter(e.target.value)} className="text-sm border border-[#E5E5EA] rounded-lg px-2 py-1.5">
            <option value="">Semua Tipe</option>
            <option value="course">Kursus</option>
            <option value="event">Event</option>
            <option value="ebook">E-Book</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-[#E5E5EA] rounded-lg px-2 py-1.5">
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[#6E6E73]">Memuat...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-[#6E6E73]">Belum ada ulasan.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F7] text-[#6E6E73]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Pengguna</th>
                <th className="px-4 py-3 text-left font-medium">Tipe</th>
                <th className="px-4 py-3 text-center font-medium">Rating</th>
                <th className="px-4 py-3 text-left font-medium">Ulasan</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                <th className="px-4 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7]">
              {reviews.map((r) => (
                <tr key={r.id} className={`hover:bg-[#F5F5F7] ${r.status === "hidden" ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1D1D1F]">{r.user.name}</p>
                    <p className="text-xs text-[#6E6E73]">{r.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#6E6E73]">{ITEM_TYPE_LABEL[r.itemType] ?? r.itemType}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-amber-400">{"⭐".repeat(r.rating)}</span>
                    <span className="text-[#6E6E73] text-xs ml-1">({r.rating}/5)</span>
                  </td>
                  <td className="px-4 py-3 text-[#6E6E73] max-w-xs">
                    <p className="line-clamp-2">{r.content ?? <em>Tidak ada teks</em>}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === "published" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {r.status === "published" ? "Aktif" : "Disembunyikan"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6E6E73]">
                    {new Date(r.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => moderate(r.id, r.status === "published" ? "hidden" : "published")}
                      disabled={moderating === r.id}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                        r.status === "published"
                          ? "border-red-200 text-red-500 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {moderating === r.id ? "..." : r.status === "published" ? "Sembunyikan" : "Tampilkan"}
                    </button>
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
