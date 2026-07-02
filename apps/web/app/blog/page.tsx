"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  category: string | null;
  tags: string[];
  publishedAt: string | null;
  author: { name: string; avatarUrl: string | null };
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const res = await fetch(`/api/blog?${params}`);
    const data = await res.json();
    if (data.success) {
      setPosts(data.data);
      setTotal(data.meta?.total ?? 0);
    }
    setLoading(false);
  }, [page, search, category]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const CATEGORIES = ["Bisnis", "Marketing", "Teknologi", "Desain", "Keuangan", "Karir"];

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">Blog Jago Akademi</h1>
          <p className="text-[#6E6E73]">Tips, insight, dan panduan pengembangan karir dari para expert.</p>
          <div className="flex gap-3 mt-6">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari artikel..."
              className="flex-1 border border-[#E5E5EA] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
            />
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => { setCategory(""); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!category ? "bg-[#0077A8] text-white border-[#0077A8]" : "text-[#6E6E73] border-[#E5E5EA] hover:border-[#0077A8] hover:text-[#0077A8]"}`}
            >
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${category === cat ? "bg-[#0077A8] text-white border-[#0077A8]" : "text-[#6E6E73] border-[#E5E5EA] hover:border-[#0077A8] hover:text-[#0077A8]"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-[#6E6E73]">Memuat artikel...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-[#6E6E73]">
            <div className="text-4xl mb-3">📝</div>
            <p>Belum ada artikel yang dipublikasikan.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#6E6E73] mb-6">{total} artikel ditemukan</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden hover:shadow-md transition-shadow group">
                  {post.coverUrl ? (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-[#0077A8] to-[#005f87] flex items-center justify-center text-white text-3xl">📝</div>
                  )}
                  <div className="p-5">
                    {post.category && (
                      <span className="text-xs font-medium text-[#0077A8] bg-blue-50 px-2 py-0.5 rounded-full">{post.category}</span>
                    )}
                    <h2 className="font-semibold text-[#1D1D1F] mt-2 mb-2 line-clamp-2 group-hover:text-[#0077A8] transition-colors">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-[#6E6E73] line-clamp-2">{post.excerpt}</p>}
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-6 h-6 rounded-full bg-[#0077A8] flex items-center justify-center text-white text-xs font-bold">
                        {post.author.name.charAt(0)}
                      </div>
                      <span className="text-xs text-[#6E6E73]">{post.author.name}</span>
                      {post.publishedAt && (
                        <>
                          <span className="text-[#E5E5EA]">·</span>
                          <span className="text-xs text-[#6E6E73]">
                            {new Date(post.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {total > 12 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm border border-[#E5E5EA] rounded-xl disabled:opacity-40 hover:border-[#0077A8] hover:text-[#0077A8]">
                  ← Sebelumnya
                </button>
                <span className="px-4 py-2 text-sm text-[#6E6E73]">Halaman {page}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page * 12 >= total} className="px-4 py-2 text-sm border border-[#E5E5EA] rounded-xl disabled:opacity-40 hover:border-[#0077A8] hover:text-[#0077A8]">
                  Berikutnya →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
