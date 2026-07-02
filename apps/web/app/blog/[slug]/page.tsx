"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  category: string | null;
  tags: string[];
  publishedAt: string | null;
  author: { id: string; name: string; avatarUrl: string | null };
};

type Review = {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { name: string; avatarUrl: string | null };
};

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPost(d.data);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    fetch(`/api/reviews?itemType=blog_post&itemId=${post.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setReviews(d.data);
          setAvgRating(d.meta?.avgRating ?? 0);
        }
      });
  }, [post]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!post) return;
    setSubmitting(true);
    setReviewMsg("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType: "blog_post", itemId: post.id, ...reviewForm }),
    });
    const data = await res.json();
    if (data.success) {
      setReviews((prev) => [data.data, ...prev]);
      setReviewMsg("Ulasan berhasil dikirim.");
    } else {
      setReviewMsg(data.error ?? "Gagal mengirim ulasan.");
    }
    setSubmitting(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Memuat...</div>;
  if (notFound || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-[#6E6E73]">Artikel tidak ditemukan.</p>
      <Link href="/blog" className="text-[#0077A8] hover:underline">← Kembali ke Blog</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/blog" className="text-[#0077A8] hover:underline">Blog</Link>
          <span className="text-[#6E6E73]">/</span>
          <span className="text-[#1D1D1F] truncate max-w-xs">{post.title}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <article className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden mb-8">
          {post.coverUrl && (
            <img src={post.coverUrl} alt={post.title} className="w-full aspect-video object-cover" />
          )}
          <div className="p-8">
            {post.category && (
              <span className="text-xs font-medium text-[#0077A8] bg-blue-50 px-2.5 py-1 rounded-full">{post.category}</span>
            )}
            <h1 className="text-2xl font-bold text-[#1D1D1F] mt-3 mb-4">{post.title}</h1>

            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E5E5EA]">
              <div className="w-8 h-8 rounded-full bg-[#0077A8] flex items-center justify-center text-white text-sm font-bold">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">{post.author.name}</p>
                {post.publishedAt && (
                  <p className="text-xs text-[#6E6E73]">
                    {new Date(post.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
              {avgRating > 0 && (
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-amber-400">⭐</span>
                  <span className="text-sm font-medium text-[#1D1D1F]">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-[#6E6E73]">({reviews.length} ulasan)</span>
                </div>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-[#1D1D1F] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[#E5E5EA]">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-[#F5F5F7] text-[#6E6E73] rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Review section */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 mb-6">
          <h2 className="font-semibold text-[#1D1D1F] mb-4">Berikan Ulasan</h2>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                    className={`text-2xl transition-transform hover:scale-110 ${r <= reviewForm.rating ? "text-amber-400" : "text-[#E5E5EA]"}`}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewForm.content}
              onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
              placeholder="Bagikan pendapat Anda tentang artikel ini..."
              rows={3}
              className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
            />
            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87] disabled:opacity-50">
                {submitting ? "Mengirim..." : "Kirim Ulasan"}
              </button>
              {reviewMsg && <p className="text-sm text-[#0077A8]">{reviewMsg}</p>}
            </div>
          </form>
        </div>

        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
            <h2 className="font-semibold text-[#1D1D1F] mb-4">Ulasan ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-[#F5F5F7] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#0077A8] flex items-center justify-center text-white text-xs font-bold">
                      {r.user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-[#1D1D1F]">{r.user.name}</span>
                    <span className="text-amber-400 text-sm">{"⭐".repeat(r.rating)}</span>
                    <span className="text-xs text-[#6E6E73] ml-auto">{new Date(r.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                  {r.content && <p className="text-sm text-[#6E6E73]">{r.content}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
