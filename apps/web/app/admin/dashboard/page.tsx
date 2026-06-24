"use client";

import { useEffect, useState } from "react";

type AdminStats = {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  pendingCourses: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) setStats(body.data);
        else setError(body.error ?? "Gagal memuat statistik.");
      })
      .catch(() => setError("Terjadi kesalahan jaringan."))
      .finally(() => setLoading(false));
  }, [API]);

  const statCards = stats
    ? [
        { label: "Total Pengguna", value: stats.totalUsers.toLocaleString("id-ID"), color: "text-[#0077A8]" },
        { label: "Total Kursus", value: stats.totalCourses.toLocaleString("id-ID"), color: "text-[#CC0052]" },
        { label: "Total Pendaftaran", value: stats.totalEnrollments.toLocaleString("id-ID"), color: "text-[#0077A8]" },
        {
          label: "Total Pendapatan",
          value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
          color: "text-[#34C759]",
        },
        { label: "Kursus Menunggu", value: stats.pendingCourses.toLocaleString("id-ID"), color: "text-[#FF9500]" },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Dashboard Admin</h1>
        <p className="text-[#6E6E73] text-sm mt-1">Ringkasan sistem Jago Akademi</p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 rounded-full border-2 border-[#0077A8] border-t-transparent animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
              <p className="text-xs font-medium text-[#6E6E73] uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
