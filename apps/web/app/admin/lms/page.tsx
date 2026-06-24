"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Tenant = {
  id: string;
  slug: string;
  name: string;
  planType: string;
  isActive: boolean;
  seatLimit: number;
  trialEndsAt: string | null;
  createdAt: string;
  _count: { batches: number; courses: number; enrollments: number };
};

const PLAN_COLORS: Record<string, string> = {
  trial: "bg-amber-100 text-amber-700",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-green-100 text-green-700",
};

export default function AdminLmsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", planType: "trial", seatLimit: 50 });
  const [creating, setCreating] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/lms/tenants?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTenants(data.data ?? []);
        setTotal(data.meta?.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/lms/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ slug: "", name: "", planType: "trial", seatLimit: 50 });
        fetchTenants();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">LMS B2B — Manajemen Tenant</h1>
          <p className="text-sm text-[#6E6E73] mt-1">{total} tenant terdaftar</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#0077A8] text-white text-sm font-medium rounded-xl hover:bg-[#005f87] transition-colors"
        >
          + Buat Tenant Baru
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Buat Tenant Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3C3C43] mb-1">Nama Perusahaan</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3C3C43] mb-1">Slug (subdomain)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                  placeholder="perusahaan-abc"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#3C3C43] mb-1">Plan</label>
                  <select
                    value={form.planType}
                    onChange={(e) => setForm({ ...form, planType: e.target.value })}
                    className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                  >
                    <option value="trial">Trial (14 hari)</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3C3C43] mb-1">Limit Seat</label>
                  <input
                    type="number"
                    value={form.seatLimit}
                    onChange={(e) => setForm({ ...form, seatLimit: Number(e.target.value) })}
                    className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                    min={1}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm text-[#6E6E73] border border-[#E5E5EA] rounded-xl hover:bg-[#F5F5F7]">
                  Batal
                </button>
                <button type="submit" disabled={creating} className="flex-1 py-2 text-sm text-white bg-[#0077A8] rounded-xl hover:bg-[#005f87] disabled:opacity-50">
                  {creating ? "Membuat..." : "Buat Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari nama tenant..."
          className="w-full max-w-sm border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6E6E73]">Memuat...</div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-12 text-[#6E6E73]">Belum ada tenant.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F7] text-[#6E6E73]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nama / Slug</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-center font-medium">Batch</th>
                <th className="px-4 py-3 text-center font-medium">Kursus</th>
                <th className="px-4 py-3 text-center font-medium">Enrollment</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7]">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-[#F5F5F7]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#1D1D1F]">{t.name}</div>
                    <div className="text-xs text-[#6E6E73]">{t.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PLAN_COLORS[t.planType] ?? ""}`}>
                      {t.planType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-[#3C3C43]">{t._count.batches}</td>
                  <td className="px-4 py-3 text-center text-[#3C3C43]">{t._count.courses}</td>
                  <td className="px-4 py-3 text-center text-[#3C3C43]">{t._count.enrollments}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {t.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/lms/${t.id}`} className="text-[#0077A8] text-xs hover:underline">
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm border border-[#E5E5EA] rounded-xl disabled:opacity-40">
            Sebelumnya
          </button>
          <span className="px-4 py-2 text-sm text-[#6E6E73]">Hal. {page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total} className="px-4 py-2 text-sm border border-[#E5E5EA] rounded-xl disabled:opacity-40">
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
