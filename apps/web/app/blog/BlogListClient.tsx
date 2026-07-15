"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";

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

const CATEGORIES = ["Bisnis", "Marketing", "Teknologi", "Desain", "Keuangan", "Karir"];

export default function BlogListClient() {
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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
      active
        ? "border-[var(--brand-cyan-strong)] bg-[var(--brand-cyan-strong)] text-white"
        : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-cyan-strong)] hover:text-[var(--brand-cyan-strong)]",
    );

  return (
    <div className="min-h-screen bg-[var(--surface-page)] pt-16">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] bg-white">
        <div className="container-pad py-12">
          <p className="eyebrow mb-3">Blog</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
            Insight & <span className="text-accent">panduan</span> karier
          </h1>
          <p className="mt-2 max-w-xl text-[var(--text-secondary)]">
            Tips dan wawasan pengembangan skill dan karier dari para praktisi.
          </p>

          <div className="mt-6 max-w-md">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari artikel…"
              className="input-dark"
              aria-label="Cari artikel"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => { setCategory(""); setPage(1); }} className={chip(!category)}>
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => { setCategory(cat); setPage(1); }} className={chip(category === cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-pad py-10">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden !p-0">
                <div className="skeleton aspect-video !rounded-none" />
                <div className="flex flex-col gap-2.5 p-5">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Belum ada artikel"
            description="Artikel dan panduan sedang disiapkan. Cek lagi nanti — konten baru akan tayang di sini."
          />
        ) : (
          <>
            <p className="mb-6 text-sm text-[var(--text-muted)]">{total} artikel ditemukan</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="card group flex flex-col overflow-hidden !p-0">
                  <div className="relative aspect-video w-full overflow-hidden border-b border-[var(--border-subtle)]">
                    {post.coverUrl ? (
                      <Image
                        src={post.coverUrl}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <MediaPlaceholder type="foto" ratio="16:9" showRatio={false} className="!rounded-none !border-0" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {post.category && (
                      <span className="badge badge-cyan self-start">{post.category}</span>
                    )}
                    <h2 className="mt-2 font-display text-base font-bold leading-snug text-[var(--text-primary)] line-clamp-2 transition-colors group-hover:text-[var(--brand-cyan-strong)]">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-cyan-strong)] text-xs font-bold text-white">
                        {post.author.name.charAt(0)}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">{post.author.name}</span>
                      {post.publishedAt && (
                        <>
                          <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
                          <span className="text-xs text-[var(--text-muted)]">
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
              <div className="mt-10 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-ghost btn-sm disabled:opacity-40"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Sebelumnya
                </button>
                <span className="px-4 py-2 text-sm text-[var(--text-muted)]">Halaman {page}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 12 >= total}
                  className="btn btn-ghost btn-sm disabled:opacity-40"
                >
                  Berikutnya
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
