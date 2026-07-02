"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  maxDiscount: number | null;
  minPurchase: number;
  usageCount: number;
  usageLimit: number | null;
  endDate: string | null;
  isActive: boolean;
  description: string | null;
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("jg_token");
}

const EMPTY_FORM = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  maxDiscount: "",
  minPurchase: "0",
  usageLimit: "",
  endDate: "",
  description: "",
  isActive: true,
};

export default function AdminKuponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function fetchCoupons() {
    const token = getToken();
    if (!token) return;
    fetch(`${getApiBase()}/api/coupons?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCoupons(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchCoupons(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = getToken();
      const payload: Record<string, unknown> = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minPurchase: Number(form.minPurchase),
        isActive: form.isActive,
      };
      if (form.maxDiscount) payload.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit) payload.usageLimit = Number(form.usageLimit);
      if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();
      if (form.description) payload.description = form.description;

      const res = await fetch(`${getApiBase()}/api/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm(EMPTY_FORM);
        fetchCoupons();
      } else {
        setError(data.error?.message ?? "Gagal menyimpan kupon.");
      }
    } catch {
      setError("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const token = getToken();
    await fetch(`${getApiBase()}/api/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchCoupons();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kupon</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Buat Kupon
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Kupon Baru</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Kode Kupon *</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="DISKON10"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tipe *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percentage" | "fixed" }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal Tetap (Rp)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Nilai * {form.type === "percentage" ? "(%)" : "(Rp)"}
              </label>
              <input
                type="number"
                required
                min={0}
                max={form.type === "percentage" ? 100 : undefined}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {form.type === "percentage" && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Maks Diskon (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={form.maxDiscount}
                  onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Min. Pembelian (Rp)</label>
              <input
                type="number"
                min={0}
                value={form.minPurchase}
                onChange={(e) => setForm((f) => ({ ...f, minPurchase: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Maks Penggunaan</label>
              <input
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                placeholder="Kosongkan = tidak terbatas"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Berlaku Hingga</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Deskripsi</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Deskripsi kupon (opsional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 hover:bg-blue-700"
              >
                {saving ? "Menyimpan..." : "Simpan Kupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Belum ada kupon. Buat kupon pertama Anda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Kode</th>
                <th className="text-left px-4 py-3">Tipe</th>
                <th className="text-left px-4 py-3">Nilai</th>
                <th className="text-left px-4 py-3">Penggunaan</th>
                <th className="text-left px-4 py-3">Berlaku Hingga</th>
                <th className="text-center px-4 py-3">Aktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-gray-900">{c.code}</span>
                    {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{c.type === "percentage" ? "Persentase" : "Nominal"}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {c.type === "percentage" ? `${Number(c.value)}%` : `Rp ${Number(c.value).toLocaleString("id-ID")}`}
                    {c.maxDiscount && <span className="text-xs text-gray-400 ml-1">(maks Rp {Number(c.maxDiscount).toLocaleString("id-ID")})</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.endDate
                      ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(c.endDate))
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(c.id, c.isActive)}
                      className={`w-10 h-5 rounded-full transition-colors ${c.isActive ? "bg-green-500" : "bg-gray-300"} relative`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${c.isActive ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
