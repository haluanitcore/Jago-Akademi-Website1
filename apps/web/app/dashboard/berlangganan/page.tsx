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

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token") || sessionStorage.getItem("jg_token");
}

export default function BerlanggananDashboardPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<Subscription | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  useEffect(() => {
    Promise.all([
      fetch("/api/subscription/plans").then((r) => r.json()),
      fetch("/api/subscription/me", {
        headers: { Authorization: `Bearer ${getToken()}` },
      }).then((r) => r.json()).catch(() => ({ success: true, data: null })),
    ]).then(([plansRes, subRes]) => {
      if (plansRes.success) setPlans(plansRes.data);
      if (subRes.success) setCurrentSub(subRes.data);
    }).finally(() => setLoading(false));
  }, []);

  async function subscribe(planType: string) {
    const token = getToken();
    setSubscribing(planType);
    setMsg("");
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planType }),
    });
    const data = await res.json();
    if (data.success) {
      setCurrentSub({ ...data.data, isActive: true, isExpired: false });
      setMsg(`Berlangganan paket ${planType} berhasil diaktifkan!`);
      setMsgType("success");
    } else {
      setMsg(data.error?.message ?? "Gagal berlangganan. Silakan coba lagi.");
      setMsgType("error");
    }
    setSubscribing(null);
  }

  if (loading) {
    return <div className="bs-loading"><span className="bs-spinner" /></div>;
  }

  return (
    <div className="bs-page">
      {/* Header */}
      <div className="bs-header">
        <div>
          <h1 className="bs-title">Paket Berlangganan</h1>
          <p className="bs-subtitle">Akses semua kursus premium tanpa batas</p>
        </div>
      </div>

      {/* Current subscription status */}
      {currentSub?.isActive && (
        <div className="bs-active-banner">
          <div className="bs-active-icon">✅</div>
          <div className="bs-active-info">
            <p className="bs-active-title">
              Paket <span className="bs-active-plan">{currentSub.planType}</span> Aktif
            </p>
            <p className="bs-active-exp">
              Berlaku hingga{" "}
              <strong>
                {new Date(currentSub.expiresAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </strong>
            </p>
          </div>
          <div className="bs-active-badge">Aktif</div>
        </div>
      )}

      {currentSub?.isExpired && (
        <div className="bs-expired-banner">
          <span>⚠️</span>
          <p>Langganan Anda telah berakhir. Perpanjang sekarang untuk melanjutkan akses.</p>
        </div>
      )}

      {/* Message */}
      {msg && (
        <div className={`bs-msg ${msgType === "error" ? "bs-msg-error" : "bs-msg-success"}`}>
          {msg}
        </div>
      )}

      {/* Plans */}
      <div className="bs-plans-grid">
        {plans.map((plan) => {
          const isActive = currentSub?.isActive && currentSub.planType === plan.id;
          const isPopular = !!plan.badge;

          return (
            <div key={plan.id} className={`bs-plan-card ${isPopular ? "bs-plan-popular" : ""}`}>
              {isPopular && (
                <div className="bs-popular-ribbon">{plan.badge}</div>
              )}

              <div className="bs-plan-header">
                <h2 className="bs-plan-name">Paket {plan.name}</h2>
                <div className="bs-plan-price-wrap">
                  <span className="bs-plan-price">
                    Rp {plan.price.toLocaleString("id-ID")}
                  </span>
                  <span className="bs-plan-period">
                    /{plan.durationDays >= 365 ? "tahun" : "bulan"}
                  </span>
                </div>
                {plan.pricePerMonth && (
                  <p className="bs-plan-per-month">
                    ≈ Rp {plan.pricePerMonth.toLocaleString("id-ID")}/bulan
                  </p>
                )}
                {plan.savings && (
                  <p className="bs-plan-savings">
                    💰 Hemat Rp {plan.savings.toLocaleString("id-ID")}/tahun
                  </p>
                )}
              </div>

              <ul className="bs-plan-features">
                {plan.features.map((f) => (
                  <li key={f} className="bs-feature-item">
                    <span className="bs-feature-check">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(plan.id)}
                disabled={!!subscribing || isActive}
                className={`bs-plan-btn ${isPopular ? "bs-plan-btn-primary" : "bs-plan-btn-outline"} ${isActive ? "bs-plan-btn-active" : ""}`}
              >
                {subscribing === plan.id ? "Memproses..." : isActive ? "✓ Paket Aktif" : `Pilih Paket ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ / Guarantee */}
      <div className="bs-guarantee">
        <div className="bs-guarantee-item">
          <span className="bs-guarantee-icon">🔒</span>
          <div>
            <p className="bs-guarantee-title">Garansi Refund 7 Hari</p>
            <p className="bs-guarantee-desc">Tidak puas? Kami kembalikan uang Anda tanpa pertanyaan dalam 7 hari pertama.</p>
          </div>
        </div>
        <div className="bs-guarantee-item">
          <span className="bs-guarantee-icon">♾️</span>
          <div>
            <p className="bs-guarantee-title">Akses Tidak Terbatas</p>
            <p className="bs-guarantee-desc">Pelajari semua kursus premium tanpa batasan selama masa berlangganan.</p>
          </div>
        </div>
        <div className="bs-guarantee-item">
          <span className="bs-guarantee-icon">📜</span>
          <div>
            <p className="bs-guarantee-title">Sertifikat Resmi</p>
            <p className="bs-guarantee-desc">Dapatkan sertifikat kelulusan yang dapat diverifikasi untuk setiap kursus.</p>
          </div>
        </div>
      </div>

      <p className="bs-legal">
        Dengan berlangganan Anda menyetujui{" "}
        <Link href="/syarat-ketentuan" className="bs-legal-link">Syarat & Ketentuan</Link>
        {" "}dan{" "}
        <Link href="/kebijakan-privasi" className="bs-legal-link">Kebijakan Privasi</Link>
        {" "}Jago Akademi.
      </p>

      <style jsx>{`
        .bs-page { display: flex; flex-direction: column; gap: 24px; }
        .bs-loading { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
        .bs-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .bs-header { }
        .bs-title { font-size: 22px; font-weight: 800; color: #1D1D1F; }
        .bs-subtitle { font-size: 13px; color: #6E6E73; margin-top: 3px; }

        /* Active banner */
        .bs-active-banner {
          background: linear-gradient(135deg, #DCFCE7, #F0FFF4);
          border: 1px solid #86EFAC; border-radius: 16px;
          padding: 16px 20px; display: flex; align-items: center; gap: 14px;
        }
        .bs-active-icon { font-size: 28px; flex-shrink: 0; }
        .bs-active-info { flex: 1; }
        .bs-active-title { font-size: 14px; font-weight: 600; color: #166534; }
        .bs-active-plan { text-transform: capitalize; font-weight: 800; }
        .bs-active-exp { font-size: 12px; color: #16A34A; margin-top: 3px; }
        .bs-active-badge {
          background: #22C55E; color: white; font-size: 11px; font-weight: 700;
          padding: 4px 12px; border-radius: 999px; flex-shrink: 0;
        }

        .bs-expired-banner {
          background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 14px;
          padding: 14px 18px; display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #92400E;
        }

        .bs-msg { padding: 14px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; }
        .bs-msg-success { background: #DCFCE7; border: 1px solid #86EFAC; color: #166534; }
        .bs-msg-error   { background: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; }

        /* Plans grid */
        .bs-plans-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

        .bs-plan-card {
          background: white; border-radius: 20px; padding: 28px 24px;
          border: 1.5px solid rgba(0,0,0,0.08);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex; flex-direction: column; gap: 16px;
          position: relative; overflow: hidden;
          transition: all 0.22s;
        }
        .bs-plan-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }
        .bs-plan-popular { border-color: #0077A8 !important; box-shadow: 0 4px 20px rgba(0,119,168,0.15) !important; }

        .bs-popular-ribbon {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          background: linear-gradient(135deg, #0077A8, #00a8d9);
          color: white; font-size: 11px; font-weight: 700;
          padding: 5px 20px; border-radius: 0 0 12px 12px;
        }

        .bs-plan-header { padding-top: 8px; }
        .bs-plan-name { font-size: 18px; font-weight: 700; color: #1D1D1F; margin-bottom: 10px; }
        .bs-plan-price-wrap { display: flex; align-items: baseline; gap: 4px; }
        .bs-plan-price { font-size: 28px; font-weight: 800; color: #1D1D1F; }
        .bs-plan-period { font-size: 14px; color: #6E6E73; }
        .bs-plan-per-month { font-size: 12px; color: #6E6E73; margin-top: 4px; }
        .bs-plan-savings { font-size: 12px; color: #16A34A; font-weight: 600; margin-top: 4px; }

        .bs-plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; flex: 1; }
        .bs-feature-item { display: flex; align-items: flex-start; gap: 9px; font-size: 13px; color: #374151; }
        .bs-feature-check { color: #22C55E; font-weight: 700; flex-shrink: 0; }

        .bs-plan-btn {
          width: 100%; padding: 13px; border-radius: 12px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; border: 2px solid transparent;
        }
        .bs-plan-btn-primary { background: #0077A8; color: white; }
        .bs-plan-btn-primary:hover:not(:disabled) { background: #005f87; }
        .bs-plan-btn-outline { background: white; color: #0077A8; border-color: #0077A8; }
        .bs-plan-btn-outline:hover:not(:disabled) { background: #0077A8; color: white; }
        .bs-plan-btn-active { background: #22C55E !important; color: white !important; border-color: #22C55E !important; cursor: default; }
        .bs-plan-btn:disabled { opacity: 0.65; }

        /* Guarantee */
        .bs-guarantee {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
        }
        .bs-guarantee-item {
          background: white; border-radius: 14px; padding: 16px;
          display: flex; align-items: flex-start; gap: 12px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .bs-guarantee-icon { font-size: 22px; flex-shrink: 0; }
        .bs-guarantee-title { font-size: 13px; font-weight: 700; color: #1D1D1F; margin-bottom: 4px; }
        .bs-guarantee-desc { font-size: 11px; color: #6E6E73; line-height: 1.5; }

        .bs-legal { text-align: center; font-size: 12px; color: #9CA3AF; }
        .bs-legal-link { color: #0077A8; text-decoration: none; }
        .bs-legal-link:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .bs-plans-grid { grid-template-columns: 1fr; }
          .bs-guarantee { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
