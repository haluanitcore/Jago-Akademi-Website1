"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getValidToken } from "@/lib/auth/token";

type Review = {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export default function TrainerReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const token = await getValidToken();
      if (!token) { router.replace("/masuk"); return; }
      try {
        const r = await fetch("/api/trainer/reviews", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await r.json();
        if (d.success) setReviews(d.data);
        else setError(d.error?.message ?? "Gagal memuat ulasan.");
      } catch {
        setError("Gagal memuat ulasan.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Memuat ulasan...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-12">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-1">
            <Link href="/trainer-hub" className="text-[#0077A8] hover:underline">Trainer Hub</Link>
            <span className="text-[#6E6E73]">/</span>
            <span className="text-[#1D1D1F] font-medium">Ulasan Siswa</span>
          </div>
          <h1 className="text-xl font-bold text-[#1D1D1F] mt-1">Ulasan Siswa</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden p-6">
          <h2 className="font-semibold text-[#1D1D1F] mb-6">Daftar Feedback & Ulasan Kursus Anda</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-[#6E6E73]">
              <div className="text-4xl mb-3">⭐</div>
              <p>Belum ada ulasan dari siswa untuk kursus Anda.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => {
                const initials = rev.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div key={rev.id} className="border-b border-[#F5F5F7] pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      {rev.user.avatarUrl ? (
                        <img src={rev.user.avatarUrl} alt={rev.user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0077A8] to-[#7C3AED] text-white flex items-center justify-center font-bold text-sm">
                          {initials}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-[#1D1D1F]">{rev.user.name}</p>
                          <span className="text-xs text-[#6E6E73]">
                            {new Date(rev.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 my-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-sm ${i < rev.rating ? "text-amber-400" : "text-gray-200"}`}>
                              ★
                            </span>
                          ))}
                        </div>

                        {rev.content ? (
                          <p className="text-sm text-[#374151] mt-2 whitespace-pre-wrap">{rev.content}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic mt-2">Tidak ada ulasan tertulis.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
