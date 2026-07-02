"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Payout = {
  id: string;
  amount: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  status: string;
  note: string | null;
  requestedAt: string;
  processedAt: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak", paid: "Dibayar",
};

export default function TrainerPayoutPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ amount: "", bankName: "", accountNo: "", accountName: "" });

  useEffect(() => {
    fetch("/api/trainer/payouts")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPayouts(d.data); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/trainer/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      const data = await res.json();
      if (data.success) {
        setPayouts((prev) => [data.data, ...prev]);
        setForm({ amount: "", bankName: "", accountNo: "", accountName: "" });
        setMsg("Permintaan penarikan berhasil dikirim.");
      } else {
        setMsg(data.error?.message ?? "Gagal mengirim permintaan.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/trainer-hub" className="text-[#0077A8] hover:underline">Trainer Hub</Link>
          <span className="text-[#6E6E73]">/</span>
          <span className="text-[#1D1D1F] font-medium">Penarikan Saldo</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
          <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Ajukan Penarikan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">Jumlah (Rp)</label>
                <input
                  type="number" min="100000" step="1000" required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Minimal Rp 100.000"
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">Nama Bank</label>
                <input
                  type="text" required
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder="Contoh: BCA, BNI, Mandiri"
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">Nomor Rekening</label>
                <input
                  type="text" required
                  value={form.accountNo}
                  onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">Nama Pemilik Rekening</label>
                <input
                  type="text" required
                  value={form.accountName}
                  onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                />
              </div>
            </div>
            <p className="text-xs text-[#6E6E73]">⚠️ Penarikan diproses dalam 1–3 hari kerja. Minimal Rp 100.000.</p>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#0077A8] text-white text-sm font-medium rounded-xl hover:bg-[#005f87] disabled:opacity-50">
                {submitting ? "Mengirim..." : "Ajukan Penarikan"}
              </button>
              {msg && <p className="text-sm text-[#0077A8]">{msg}</p>}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5EA]">
            <h2 className="font-semibold text-[#1D1D1F]">Riwayat Penarikan</h2>
          </div>
          {loading ? (
            <div className="text-center py-8 text-[#6E6E73]">Memuat...</div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-10 text-[#6E6E73]">Belum ada riwayat penarikan.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F7] text-[#6E6E73]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Jumlah</th>
                  <th className="px-4 py-3 text-left font-medium">Bank</th>
                  <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7]">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F5F5F7]">
                    <td className="px-4 py-3 font-semibold text-[#1D1D1F]">Rp {parseFloat(p.amount).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-[#6E6E73]">{p.bankName} · {p.accountNo}</td>
                    <td className="px-4 py-3 text-xs text-[#6E6E73]">{new Date(p.requestedAt).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6E6E73]">{p.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
