"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type AffiliateProfile = {
  id: string;
  code: string;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: string;
  balance: string;
  commissionRate: string;
  status: string;
  commissions: {
    id: string;
    commissionAmt: string;
    grossAmount: string;
    status: string;
    createdAt: string;
    order: { id: string; finalAmount: string };
    referredUser: { name: string };
  }[];
};

type Withdrawal = {
  id: string;
  amount: string;
  bankName: string;
  accountNo: string;
  status: string;
  requestedAt: string;
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  settled: "bg-green-100 text-green-700",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AffiliateDashboardPage() {
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [tab, setTab] = useState<"komisi" | "penarikan">("komisi");
  const [form, setForm] = useState({ amount: "", bankName: "", accountNo: "", accountName: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const referralLink = profile ? `${window.location.origin}/?ref=${profile.code}` : "";

  useEffect(() => {
    Promise.all([
      fetch("/api/affiliate/me").then((r) => r.json()),
      fetch("/api/affiliate/withdrawals").then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([aff, wd]) => {
      if (aff.success && aff.data) setProfile(aff.data);
      if (wd.success) setWithdrawals(wd.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  async function register() {
    setRegistering(true);
    const res = await fetch("/api/affiliate/register", { method: "POST" });
    const data = await res.json();
    if (data.success) setProfile({ ...data.data, commissions: [] });
    setRegistering(false);
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    const res = await fetch("/api/affiliate/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    const data = await res.json();
    if (data.success) {
      setWithdrawals((prev) => [data.data, ...prev]);
      setProfile((prev) => prev ? { ...prev, balance: String(Number(prev.balance) - parseFloat(form.amount)) } : prev);
      setForm({ amount: "", bankName: "", accountNo: "", accountName: "" });
      setMsg("Permintaan penarikan berhasil dikirim.");
    } else {
      setMsg(data.error?.message ?? "Gagal mengirim permintaan.");
    }
    setSubmitting(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Memuat...</div>;

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h2 className="text-xl font-bold text-[#1D1D1F] mb-2">Program Afiliasi Jago Akademi</h2>
          <p className="text-sm text-[#6E6E73] mb-6">Dapatkan komisi 10% untuk setiap transaksi yang berhasil dari referral Anda.</p>
          <button onClick={register} disabled={registering} className="w-full py-3 bg-[#0077A8] text-white font-semibold rounded-xl hover:bg-[#005f87] disabled:opacity-50">
            {registering ? "Mendaftar..." : "Daftar Sekarang — Gratis"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-[#0077A8] hover:underline">Dashboard</Link>
            <span className="text-[#6E6E73]">/</span>
            <span className="text-[#1D1D1F] font-medium">Afiliasi</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${profile.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {profile.status === "active" ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Referral link */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
          <h2 className="font-semibold text-[#1D1D1F] mb-3">Link Referral Anda</h2>
          <div className="flex gap-2">
            <input readOnly value={referralLink} className="flex-1 border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm bg-[#F5F5F7] text-[#6E6E73]" />
            <button onClick={copyLink} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${copied ? "bg-green-500 text-white" : "bg-[#0077A8] text-white hover:bg-[#005f87]"}`}>
              {copied ? "Tersalin!" : "Salin"}
            </button>
          </div>
          <p className="text-xs text-[#6E6E73] mt-2">Kode: <strong>{profile.code}</strong> · Komisi: <strong>{parseFloat(profile.commissionRate).toFixed(0)}%</strong></p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Klik", value: profile.totalClicks.toLocaleString("id-ID") },
            { label: "Konversi", value: profile.totalConversions.toLocaleString("id-ID") },
            { label: "Total Komisi", value: `Rp ${parseFloat(profile.totalEarnings).toLocaleString("id-ID")}` },
            { label: "Saldo Tersedia", value: `Rp ${parseFloat(profile.balance).toLocaleString("id-ID")}`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-2xl border p-5 ${highlight ? "bg-[#0077A8] border-[#0077A8]" : "bg-white border-[#E5E5EA]"}`}>
              <div className={`text-xs font-medium mb-2 ${highlight ? "text-blue-100" : "text-[#6E6E73]"}`}>{label}</div>
              <div className={`text-xl font-bold ${highlight ? "text-white" : "text-[#1D1D1F]"}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="flex border-b border-[#E5E5EA]">
            {(["komisi", "penarikan"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-medium capitalize ${tab === t ? "text-[#0077A8] border-b-2 border-[#0077A8]" : "text-[#6E6E73] hover:text-[#1D1D1F]"}`}>
                {t === "komisi" ? "Riwayat Komisi" : "Penarikan Saldo"}
              </button>
            ))}
          </div>

          {tab === "komisi" && (
            profile.commissions.length === 0 ? (
              <div className="text-center py-10 text-[#6E6E73]">Belum ada komisi.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#F5F5F7] text-[#6E6E73]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Referral</th>
                    <th className="px-4 py-3 text-right font-medium">Order</th>
                    <th className="px-4 py-3 text-right font-medium">Komisi</th>
                    <th className="px-4 py-3 text-center font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F7]">
                  {profile.commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F5F5F7]">
                      <td className="px-4 py-3 text-[#1D1D1F]">{c.referredUser.name}</td>
                      <td className="px-4 py-3 text-right text-[#6E6E73]">Rp {parseFloat(c.grossAmount).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">+Rp {parseFloat(c.commissionAmt).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6E6E73]">{new Date(c.createdAt).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {tab === "penarikan" && (
            <div className="p-6 space-y-6">
              <form onSubmit={handleWithdraw} className="space-y-4">
                <h3 className="font-medium text-[#1D1D1F]">Ajukan Penarikan</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "amount", label: "Jumlah (Rp)", type: "number", placeholder: "Minimal Rp 50.000" },
                    { key: "bankName", label: "Nama Bank", type: "text", placeholder: "BCA, BNI, Mandiri..." },
                    { key: "accountNo", label: "Nomor Rekening", type: "text", placeholder: "" },
                    { key: "accountName", label: "Nama Pemilik", type: "text", placeholder: "" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">{label}</label>
                      <input
                        type={type} required
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#0077A8] text-white text-sm font-medium rounded-xl hover:bg-[#005f87] disabled:opacity-50">
                    {submitting ? "Mengirim..." : "Ajukan Penarikan"}
                  </button>
                  {msg && <p className="text-sm text-[#0077A8]">{msg}</p>}
                </div>
              </form>

              {withdrawals.length > 0 && (
                <div>
                  <h3 className="font-medium text-[#1D1D1F] mb-3">Riwayat Penarikan</h3>
                  <div className="space-y-2">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="flex items-center justify-between py-2.5 px-3 bg-[#F5F5F7] rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-[#1D1D1F]">Rp {parseFloat(w.amount).toLocaleString("id-ID")}</p>
                          <p className="text-xs text-[#6E6E73]">{w.bankName} · {w.accountNo}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[w.status] ?? "bg-gray-100 text-gray-600"}`}>{w.status}</span>
                          <p className="text-xs text-[#6E6E73] mt-1">{new Date(w.requestedAt).toLocaleDateString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
