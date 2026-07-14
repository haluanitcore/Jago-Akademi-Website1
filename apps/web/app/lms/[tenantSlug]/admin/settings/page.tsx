"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getValidToken } from "@/lib/auth/token";

type TenantSettings = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  customDomain: string | null;
  seatLimit: number;
  planType: string;
  isActive: boolean;
  trialEndsAt: string | null;
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial (14 hari)",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function LmsAdminSettingsPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    primaryColor: "#0077A8",
    logoUrl: "",
    customDomain: "",
  });

  const fetchData = useCallback(async () => {
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    const authHeaders = { Authorization: `Bearer ${token}` };
    const meRes = await fetch("/api/lms/portal/me", { headers: authHeaders });
    const meData = await meRes.json();
    const myTenant = meData.data?.find((t: { slug: string; id: string }) => t.slug === tenantSlug);
    if (!myTenant) { setLoading(false); return; }
    setTenantId(myTenant.id);

    const res = await fetch(`/api/lms/tenants/${myTenant.id}`, { headers: authHeaders });
    const data = await res.json();
    if (data.success) {
      const t: TenantSettings = data.data;
      setSettings(t);
      setForm({
        name: t.name,
        primaryColor: t.primaryColor ?? "#0077A8",
        logoUrl: t.logoUrl ?? "",
        customDomain: t.customDomain ?? "",
      });
    }
    setLoading(false);
  }, [tenantSlug, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const body: Record<string, string | undefined> = {
      name: form.name,
      primaryColor: form.primaryColor,
      logoUrl: form.logoUrl || undefined,
      customDomain: form.customDomain || undefined,
    };

    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    const res = await fetch(`/api/lms/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok || !data.success) {
      setError(data.message ?? "Gagal menyimpan pengaturan.");
      return;
    }
    setSaved(true);
    await fetchData();
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="p-6 text-center text-[#6E6E73]">Memuat...</div>;
  if (!settings) return <div className="p-6 text-center text-red-500">Tidak ada akses atau tenant tidak ditemukan.</div>;

  const trialExpired = settings.planType === "trial" && settings.trialEndsAt
    ? new Date(settings.trialEndsAt) < new Date()
    : false;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-[#1D1D1F] mb-1">Pengaturan Workspace</h1>
      <p className="text-sm text-[#6E6E73] mb-8">Kelola identitas visual dan konfigurasi LMS Anda.</p>

      {/* Plan info */}
      <div className={`mb-6 p-4 rounded-2xl border ${trialExpired ? "bg-amber-50 border-amber-300" : "bg-[#F5F5F7] border-[#E5E5EA]"}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1">Paket Aktif</div>
            <div className="text-sm font-semibold text-[#1D1D1F]">{PLAN_LABELS[settings.planType] ?? settings.planType}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#6E6E73]">Batas pengguna</div>
            <div className="text-sm font-semibold text-[#1D1D1F]">{settings.seatLimit} karyawan</div>
          </div>
        </div>
        {settings.planType === "trial" && settings.trialEndsAt && (
          <div className={`mt-2 text-xs ${trialExpired ? "text-amber-700 font-semibold" : "text-[#6E6E73]"}`}>
            {trialExpired
              ? "⚠️ Masa trial telah berakhir. Hubungi admin Jago Akademi untuk upgrade."
              : `Trial berakhir: ${new Date(settings.trialEndsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
          </div>
        )}
        {!settings.isActive && (
          <div className="mt-2 text-xs text-red-600 font-semibold">⚠️ Workspace sedang tidak aktif.</div>
        )}
      </div>

      {/* Branding form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1D1D1F]">Identitas & Branding</h2>

          <div>
            <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">Nama Organisasi</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
              required
              placeholder="Nama perusahaan atau institusi"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">URL Logo</label>
            <input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
              placeholder="https://cdn.perusahaan.com/logo.png"
              type="url"
            />
            {form.logoUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={form.logoUrl}
                  alt="Preview logo"
                  className="h-8 w-auto object-contain rounded border border-[#E5E5EA]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <span className="text-xs text-[#6E6E73]">Preview logo</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">Warna Utama</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-[#E5E5EA] cursor-pointer p-0.5"
              />
              <input
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="flex-1 border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                placeholder="#0077A8"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            <div className="mt-2 p-3 rounded-xl text-white text-xs font-medium" style={{ backgroundColor: form.primaryColor }}>
              Preview warna: tombol, link, dan progress bar akan menggunakan warna ini
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-sm font-semibold text-[#1D1D1F] mb-4">Domain Kustom</h2>
          <div>
            <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">Domain</label>
            <input
              value={form.customDomain}
              onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
              className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
              placeholder="lms.perusahaan.com (opsional)"
            />
            <p className="mt-1.5 text-xs text-[#6E6E73]">
              Hubungi tim Jago Akademi untuk mengaktifkan domain kustom setelah diisi.
            </p>
          </div>
          <div className="mt-3 p-3 bg-[#F5F5F7] rounded-xl text-xs text-[#6E6E73]">
            <strong className="text-[#3C3C43]">URL default portal Anda:</strong><br />
            {`${typeof window !== "undefined" ? window.location.origin : "https://jagoakademi.com"}/lms/${settings.slug}`}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            ✅ Pengaturan berhasil disimpan.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-[#0077A8] text-white rounded-xl text-sm font-medium hover:bg-[#005f87] disabled:opacity-50 transition-colors"
        >
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </form>
    </div>
  );
}
