"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getValidToken } from "@/lib/auth/token";

type Analytics = {
  courseId: string;
  title: string;
  totalLessons: number;
  totalEnrollments: number;
  completedCount: number;
  completionRate: number;
  grossRevenue: number;
  netRevenue: number;
  avgRating: number;
  reviewCount: number;
};

export default function CourseAnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const token = await getValidToken();
      if (!token) { router.replace("/masuk"); return; }
      try {
        const r = await fetch(`/api/trainer/courses/${courseId}/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await r.json();
        if (d.success) setData(d.data);
        else setError(d.error?.message ?? "Gagal memuat data.");
      } catch {
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Memuat...</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Data tidak ditemukan."}</div>;

  const metrics = [
    { label: "Total Pelajaran", value: data.totalLessons },
    { label: "Total Peserta", value: data.totalEnrollments.toLocaleString("id-ID") },
    { label: "Completion Rate", value: `${data.completionRate}%` },
    { label: "Rating Rata-rata", value: data.avgRating > 0 ? `⭐ ${data.avgRating.toFixed(1)} (${data.reviewCount})` : "Belum ada" },
    { label: "Pendapatan Kotor", value: `Rp ${data.grossRevenue.toLocaleString("id-ID")}` },
    { label: "Pendapatan Bersih (70%)", value: `Rp ${data.netRevenue.toLocaleString("id-ID")}`, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-1">
            <Link href="/trainer-hub" className="text-[#0077A8] hover:underline">Trainer Hub</Link>
            <span className="text-[#6E6E73]">/</span>
            <Link href="/trainer-hub/kursus" className="text-[#0077A8] hover:underline">Kursus</Link>
            <span className="text-[#6E6E73]">/</span>
            <span className="text-[#1D1D1F] font-medium">Analitik</span>
          </div>
          <h1 className="text-xl font-bold text-[#1D1D1F] mt-1">{data.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {metrics.map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-2xl border p-5 ${highlight ? "bg-[#0077A8] border-[#0077A8]" : "bg-white border-[#E5E5EA]"}`}>
              <div className={`text-xs font-medium mb-2 ${highlight ? "text-blue-100" : "text-[#6E6E73]"}`}>{label}</div>
              <div className={`text-xl font-bold ${highlight ? "text-white" : "text-[#1D1D1F]"}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
          <h2 className="font-semibold text-[#1D1D1F] mb-4">Progress Completion</h2>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[#6E6E73]">{data.completedCount} dari {data.totalEnrollments} peserta menyelesaikan kursus</span>
            <span className="font-semibold text-[#1D1D1F]">{data.completionRate}%</span>
          </div>
          <div className="bg-[#E5E5EA] rounded-full h-3 overflow-hidden">
            <div className="bg-[#0077A8] h-3 rounded-full transition-all" style={{ width: `${data.completionRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
