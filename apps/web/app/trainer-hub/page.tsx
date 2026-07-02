"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type DashboardData = {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  netRevenue: number;
  pendingPayouts: number;
  courses: { id: string; title: string; status: string; price: number; enrollments: number }[];
};

export default function TrainerHubPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/trainer/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        else setError(d.error ?? "Gagal memuat data.");
      })
      .catch(() => setError("Gagal memuat data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Memuat...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!data) return null;

  const stats = [
    { label: "Total Kursus", value: data.totalCourses, sub: `${data.publishedCourses} dipublikasikan` },
    { label: "Total Peserta", value: data.totalEnrollments.toLocaleString("id-ID") },
    { label: "Pendapatan Kotor", value: `Rp ${data.totalRevenue.toLocaleString("id-ID")}` },
    { label: "Pendapatan Bersih (70%)", value: `Rp ${data.netRevenue.toLocaleString("id-ID")}`, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1D1D1F]">Trainer Hub</h1>
            <p className="text-sm text-[#6E6E73] mt-0.5">Kelola kursus, pantau penjualan, tarik saldo</p>
          </div>
          <div className="flex gap-3">
            <Link href="/trainer-hub/profil" className="px-4 py-2 border border-[#E5E5EA] text-[#6E6E73] text-sm rounded-xl hover:bg-[#F5F5F7] transition-colors">
              Edit Profil
            </Link>
            <Link href="/trainer-hub/payout" className="px-4 py-2 border border-[#0077A8] text-[#0077A8] text-sm rounded-xl hover:bg-[#E8F4F9] transition-colors">
              Tarik Saldo
            </Link>
            <Link href="/trainer-hub/kursus" className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87] transition-colors">
              Kelola Kursus
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, sub, highlight }) => (
            <div key={label} className={`rounded-2xl border p-5 ${highlight ? "bg-[#0077A8] border-[#0077A8] text-white" : "bg-white border-[#E5E5EA]"}`}>
              <div className={`text-xs font-medium mb-2 ${highlight ? "text-blue-100" : "text-[#6E6E73]"}`}>{label}</div>
              <div className={`text-2xl font-bold ${highlight ? "text-white" : "text-[#1D1D1F]"}`}>{value}</div>
              {sub && <div className={`text-xs mt-1 ${highlight ? "text-blue-100" : "text-[#6E6E73]"}`}>{sub}</div>}
            </div>
          ))}
        </div>

        {data.pendingPayouts > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-amber-600 text-xl">⏳</span>
              <div>
                <p className="text-sm font-medium text-amber-800">{data.pendingPayouts} permintaan penarikan menunggu konfirmasi</p>
                <p className="text-xs text-amber-600">Biasanya diproses dalam 1–3 hari kerja</p>
              </div>
            </div>
            <Link href="/trainer-hub/payout" className="text-xs text-amber-700 font-medium hover:underline">Lihat →</Link>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA]">
            <h2 className="font-semibold text-[#1D1D1F]">Kursus Saya</h2>
            <Link href="/trainer-hub/kursus" className="text-sm text-[#0077A8] hover:underline">Lihat semua →</Link>
          </div>
          {data.courses.length === 0 ? (
            <div className="text-center py-12 text-[#6E6E73]">
              <div className="text-4xl mb-3">📚</div>
              <p>Belum ada kursus. Mulai buat kursus pertama Anda!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {data.courses.slice(0, 5).map((c) => (
                <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F5F5F7]">
                  <div>
                    <p className="font-medium text-[#1D1D1F] text-sm">{c.title}</p>
                    <p className="text-xs text-[#6E6E73] mt-0.5">{c.enrollments} peserta · Rp {c.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-[#F5F5F7] text-[#6E6E73]"}`}>
                      {c.status === "published" ? "Aktif" : "Draft"}
                    </span>
                    <Link href={`/trainer-hub/kursus/${c.id}`} className="text-xs text-[#0077A8] hover:underline">Analitik →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
