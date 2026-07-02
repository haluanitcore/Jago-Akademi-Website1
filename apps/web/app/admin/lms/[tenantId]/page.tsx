"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type TenantDetail = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  planType: string;
  isActive: boolean;
  seatLimit: number;
  trialEndsAt: string | null;
  createdAt: string;
  _count: { batches: number; courses: number; enrollments: number; invites: number };
};

export default function AdminLmsTenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");
  const [upgradePlan, setUpgradePlan] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");

  useEffect(() => {
    fetch(`/api/lms/tenants/${tenantId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setTenant(d.data); })
      .finally(() => setLoading(false));
  }, [tenantId]);

  async function upgradeTenantPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!upgradePlan) return;
    setUpgrading(true);
    setUpgradeMsg("");
    try {
      const res = await fetch(`/api/lms/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: upgradePlan }),
      });
      const data = await res.json();
      if (data.success) {
        setTenant((prev) => prev ? { ...prev, planType: data.data.planType } : prev);
        setUpgradeMsg(`Plan berhasil diubah ke ${data.data.planType}.`);
        setUpgradePlan("");
      } else {
        setUpgradeMsg(data.error?.message ?? "Gagal mengubah plan.");
      }
    } finally {
      setUpgrading(false);
    }
  }

  async function assignAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminEmail) return;
    setAssigning(true);
    setAdminMsg("");
    try {
      const userRes = await fetch(`/api/users?email=${encodeURIComponent(adminEmail)}`);
      const userData = await userRes.json();
      if (!userData.success || !userData.data?.id) {
        setAdminMsg("User tidak ditemukan.");
        return;
      }
      const res = await fetch(`/api/lms/tenants/${tenantId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.data.id }),
      });
      const data = await res.json();
      setAdminMsg(data.success ? "Admin berhasil ditambahkan." : (data.error?.message ?? "Gagal."));
    } finally {
      setAssigning(false);
    }
  }

  if (loading) return <div className="p-6 text-center text-[#6E6E73]">Memuat...</div>;
  if (!tenant) return <div className="p-6 text-center text-red-500">Tenant tidak ditemukan.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#6E6E73] mb-4">
        <Link href="/admin/lms" className="hover:text-[#0077A8]">LMS</Link>
        <span>/</span>
        <span className="text-[#1D1D1F]">{tenant.name}</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1D1D1F]">{tenant.name}</h1>
            <p className="text-sm text-[#6E6E73] mt-1">slug: <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded">{tenant.slug}</code></p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${tenant.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {tenant.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Batch", value: tenant._count.batches },
            { label: "Kursus", value: tenant._count.courses },
            { label: "Enrollment", value: tenant._count.enrollments },
            { label: "Undangan", value: tenant._count.invites },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F5F5F7] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#1D1D1F]">{value}</div>
              <div className="text-xs text-[#6E6E73] mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <span className="text-[#6E6E73]">Plan: </span>
            <span className="font-medium capitalize text-[#1D1D1F]">{tenant.planType}</span>
          </div>
          <div>
            <span className="text-[#6E6E73]">Seat Limit: </span>
            <span className="font-medium text-[#1D1D1F]">{tenant.seatLimit}</span>
          </div>
          {tenant.trialEndsAt && (
            <div>
              <span className="text-[#6E6E73]">Trial Berakhir: </span>
              <span className="font-medium text-[#1D1D1F]">
                {new Date(tenant.trialEndsAt).toLocaleDateString("id-ID")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Ubah Plan</h2>
        <form onSubmit={upgradeTenantPlan} className="flex gap-3">
          <select
            value={upgradePlan}
            onChange={(e) => setUpgradePlan(e.target.value)}
            className="flex-1 border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
            required
          >
            <option value="">Pilih plan baru...</option>
            {["trial", "starter", "pro", "enterprise"].filter((p) => p !== tenant.planType).map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
          <button type="submit" disabled={upgrading} className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87] disabled:opacity-50">
            {upgrading ? "Mengubah..." : "Ubah Plan"}
          </button>
        </form>
        {upgradeMsg && <p className="text-sm mt-2 text-[#0077A8]">{upgradeMsg}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Tambah Admin LMS</h2>
        <form onSubmit={assignAdmin} className="flex gap-3">
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Email pengguna"
            className="flex-1 border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
          />
          <button type="submit" disabled={assigning} className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87] disabled:opacity-50">
            {assigning ? "Menambah..." : "Tambah Admin"}
          </button>
        </form>
        {adminMsg && <p className="text-sm mt-2 text-[#0077A8]">{adminMsg}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Akses Cepat LMS Admin</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Manajemen Batch", href: `/lms/${tenant.slug}/admin/batches` },
            { label: "Course Builder", href: `/lms/${tenant.slug}/admin/courses` },
            { label: "Laporan Completion", href: `/lms/${tenant.slug}/admin/reports` },
            { label: "Portal Peserta", href: `/lms/${tenant.slug}` },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-4 py-3 border border-[#E5E5EA] rounded-xl text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] hover:border-[#0077A8] transition-all"
            >
              <span>{label}</span>
              <span className="text-[#0077A8]">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
