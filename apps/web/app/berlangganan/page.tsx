"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  pricePerMonth?: number;
  savings?: number;
  features: string[];
  badge: string | null;
};

type Subscription = {
  planType: string;
  status: string;
  expiresAt: string;
  isActive: boolean;
  isExpired: boolean;
} | null;

export default function BerlanggananPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<Subscription | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/subscription/plans").then((r) => r.json()),
      fetch("/api/subscription/me").then((r) => r.json()).catch(() => ({ success: true, data: null })),
    ]).then(([plansRes, subRes]) => {
      if (plansRes.success) setPlans(plansRes.data);
      if (subRes.success) setCurrentSub(subRes.data);
    }).finally(() => setLoading(false));
  }, []);

  async function subscribe(planType: string) {
    setSubscribing(planType);
    setMsg("");
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
    });
    const data = await res.json();
    if (data.success) {
      setCurrentSub({ ...data.data, isActive: true, isExpired: false });
      setMsg(`Berlangganan paket ${planType} berhasil!`);
    } else {
      setMsg(data.error?.message ?? "Gagal berlangganan.");
    }
    setSubscribing(null);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Memuat...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/" className="text-[#0077A8] hover:underline">Beranda</Link>
          <span className="text-[#6E6E73]">/</span>
          <span className="text-[#1D1D1F] font-medium">Berlangganan</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-3">Akses Semua Kursus Tanpa Batas</h1>
          <p className="text-[#6E6E73] text-lg">Investasi terbaik untuk karir Anda. Akses 500+ kursus premium.</p>
        </div>

        {currentSub?.isActive && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Anda aktif berlangganan paket <span className="capitalize">{currentSub.planType}</span></p>
              <p className="text-sm text-green-700 mt-0.5">
                Berlaku hingga {new Date(currentSub.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        )}

        {msg && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700 text-center">{msg}</div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-2xl border p-6 relative ${plan.badge ? "border-[#0077A8] shadow-lg" : "border-[#E5E5EA]"}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0077A8] text-white text-xs font-semibold px-4 py-1 rounded-full">{plan.badge}</span>
                </div>
              )}

              <h2 className="text-xl font-bold text-[#1D1D1F] mb-1">Paket {plan.name}</h2>
              <div className="mb-1">
                <span className="text-3xl font-bold text-[#1D1D1F]">Rp {plan.price.toLocaleString("id-ID")}</span>
                <span className="text-[#6E6E73] text-sm ml-2">/{plan.id === "annual" ? "tahun" : "bulan"}</span>
              </div>
              {plan.pricePerMonth && (
                <p className="text-sm text-[#6E6E73] mb-1">≈ Rp {plan.pricePerMonth.toLocaleString("id-ID")}/bulan</p>
              )}
              {plan.savings && (
                <p className="text-sm text-green-600 font-medium mb-3">Hemat Rp {plan.savings.toLocaleString("id-ID")}/tahun</p>
              )}

              <ul className="space-y-2.5 mb-6 mt-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#1D1D1F]">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(plan.id)}
                disabled={!!subscribing || (currentSub?.isActive && currentSub.planType === plan.id)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
                  plan.badge
                    ? "bg-[#0077A8] text-white hover:bg-[#005f87]"
                    : "border-2 border-[#0077A8] text-[#0077A8] hover:bg-[#E8F4F9]"
                }`}
              >
                {subscribing === plan.id ? "Memproses..." :
                  currentSub?.isActive && currentSub.planType === plan.id ? "Paket Aktif" :
                  `Pilih Paket ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#6E6E73] mt-8">
          Dengan berlangganan Anda menyetujui{" "}
          <Link href="/syarat-ketentuan" className="text-[#0077A8] hover:underline">Syarat & Ketentuan</Link>{" "}
          dan{" "}
          <Link href="/kebijakan-privasi" className="text-[#0077A8] hover:underline">Kebijakan Privasi</Link>{" "}
          Jago Akademi.
        </p>
      </div>
    </div>
  );
}
