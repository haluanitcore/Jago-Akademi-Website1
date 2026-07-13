"use client";

import { useState, useEffect } from "react";

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
  pending:  "badge-pending",
  settled:  "badge-settled",
  approved: "badge-approved",
  paid:     "badge-settled",
  rejected: "badge-rejected",
};

export default function AfiliasiPage() {
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [tab, setTab] = useState<"komisi" | "penarikan">("komisi");
  const [form, setForm] = useState({ amount: "", bankName: "", accountNo: "", accountName: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [copied, setCopied] = useState(false);

  const referralLink =
    typeof window !== "undefined" && profile
      ? `${window.location.origin}/?ref=${profile.code}`
      : "";

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
      setProfile((prev) =>
        prev ? { ...prev, balance: String(Number(prev.balance) - parseFloat(form.amount)) } : prev
      );
      setForm({ amount: "", bankName: "", accountNo: "", accountName: "" });
      setMsg("Permintaan penarikan berhasil dikirim.");
      setMsgType("success");
    } else {
      setMsg(data.error?.message ?? "Gagal mengirim permintaan.");
      setMsgType("error");
    }
    setSubmitting(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="af-loading"><span className="af-spinner" /></div>;

  if (!profile) {
    return (
      <div className="af-register-page">
        <div className="af-register-card">
          <div className="af-register-art">🤝</div>
          <h1 className="af-register-title">Bergabung Program Afiliasi</h1>
          <p className="af-register-desc">
            Dapatkan komisi untuk setiap referral yang berhasil bertransaksi di Jago Akademi. 
            Tanpa modal, daftar gratis!
          </p>
          <div className="af-register-benefits">
            {[
              { icon: "💰", text: "Komisi 10% per transaksi" },
              { icon: "⚡", text: "Link unik untuk tracking" },
              { icon: "🏦", text: "Tarik ke rekening bank kapan saja" },
              { icon: "📊", text: "Dashboard statistik real-time" },
            ].map((b) => (
              <div key={b.text} className="af-benefit-item">
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
          <button
            onClick={register}
            disabled={registering}
            className="af-register-btn"
          >
            {registering ? "Mendaftar..." : "🚀 Daftar Sekarang — Gratis"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="af-page">
      {/* Header */}
      <div className="af-header">
        <div>
          <h1 className="af-title">Afiliasi Saya</h1>
          <p className="af-subtitle">Program referral Jago Akademi</p>
        </div>
        <span className={`af-status-badge ${profile.status === "active" ? "af-status-active" : "af-status-inactive"}`}>
          {profile.status === "active" ? "● Aktif" : "● Nonaktif"}
        </span>
      </div>

      {/* Referral link card */}
      <div className="af-link-card">
        <p className="af-link-label">Link Referral Anda</p>
        <div className="af-link-row">
          <input readOnly value={referralLink} className="af-link-input" />
          <button onClick={copyLink} className={`af-copy-btn ${copied ? "af-copy-copied" : ""}`}>
            {copied ? "✓ Tersalin!" : "📋 Salin"}
          </button>
        </div>
        <p className="af-link-meta">
          Kode: <strong>{profile.code}</strong>
          &ensp;·&ensp;
          Komisi: <strong>{parseFloat(profile.commissionRate).toFixed(0)}%</strong>
        </p>
      </div>

      {/* Stats */}
      <div className="af-stats-grid">
        {[
          { label: "Total Klik",     value: profile.totalClicks.toLocaleString("id-ID"),                             color: "#0077A8", icon: "👆" },
          { label: "Konversi",       value: profile.totalConversions.toLocaleString("id-ID"),                        color: "#F59E0B", icon: "🎯" },
          { label: "Total Komisi",   value: `Rp ${parseFloat(profile.totalEarnings).toLocaleString("id-ID")}`,      color: "#22C55E", icon: "💵" },
          { label: "Saldo Tersedia", value: `Rp ${parseFloat(profile.balance).toLocaleString("id-ID")}`,            color: "#CC0052", icon: "🏦", highlight: true },
        ].map(({ label, value, color, icon, highlight }) => (
          <div key={label} className={`af-stat-card ${highlight ? "af-stat-highlight" : ""}`} style={{ "--stat-color": color } as React.CSSProperties}>
            <div className="af-stat-icon">{icon}</div>
            <div className="af-stat-value" style={{ color }}>{value}</div>
            <div className="af-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="af-tabs-section">
        <div className="af-tab-list">
          {(["komisi", "penarikan"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`af-tab-btn ${tab === t ? "af-tab-active" : ""}`}
            >
              {t === "komisi" ? "📋 Riwayat Komisi" : "💳 Penarikan Saldo"}
            </button>
          ))}
        </div>

        {/* Komisi tab */}
        {tab === "komisi" && (
          <div className="af-tab-content">
            {profile.commissions.length === 0 ? (
              <div className="af-empty">
                <span>📭</span>
                <p>Belum ada komisi. Bagikan link referral Anda!</p>
              </div>
            ) : (
              <div className="af-table-wrap">
                <table className="af-table">
                  <thead>
                    <tr>
                      <th>Referral</th>
                      <th>Nilai Order</th>
                      <th>Komisi</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.commissions.map((c) => (
                      <tr key={c.id}>
                        <td className="af-td-name">{c.referredUser.name}</td>
                        <td className="af-td-right">Rp {parseFloat(c.grossAmount).toLocaleString("id-ID")}</td>
                        <td className="af-td-right af-td-komisi">+Rp {parseFloat(c.commissionAmt).toLocaleString("id-ID")}</td>
                        <td className="af-td-center">
                          <span className={`af-badge ${STATUS_BADGE[c.status] ?? "badge-pending"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="af-td-date">{new Date(c.createdAt).toLocaleDateString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Penarikan tab */}
        {tab === "penarikan" && (
          <div className="af-tab-content">
            <div className="af-withdraw-section">
              <div className="af-balance-info">
                <span className="af-balance-label">Saldo Tersedia</span>
                <span className="af-balance-value">
                  Rp {parseFloat(profile.balance).toLocaleString("id-ID")}
                </span>
              </div>

              <form onSubmit={handleWithdraw} className="af-withdraw-form">
                <h3 className="af-form-title">Ajukan Penarikan</h3>
                <div className="af-form-grid">
                  {[
                    { key: "amount",      label: "Jumlah (Rp)", type: "number", placeholder: "Min. Rp 50.000" },
                    { key: "bankName",    label: "Nama Bank",   type: "text",   placeholder: "BCA, BNI, Mandiri..." },
                    { key: "accountNo",   label: "Nomor Rekening", type: "text", placeholder: "" },
                    { key: "accountName", label: "Nama Pemilik",   type: "text", placeholder: "" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="af-field-label">{label}</label>
                      <input
                        type={type} required
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="af-field-input"
                      />
                    </div>
                  ))}
                </div>

                {msg && (
                  <div className={`af-msg ${msgType === "error" ? "af-msg-error" : "af-msg-success"}`}>{msg}</div>
                )}

                <button type="submit" disabled={submitting} className="af-submit-btn">
                  {submitting ? "Mengirim..." : "💳 Ajukan Penarikan"}
                </button>
              </form>

              {withdrawals.length > 0 && (
                <div className="af-wd-history">
                  <h3 className="af-form-title">Riwayat Penarikan</h3>
                  <div className="af-wd-list">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="af-wd-item">
                        <div>
                          <p className="af-wd-amount">Rp {parseFloat(w.amount).toLocaleString("id-ID")}</p>
                          <p className="af-wd-bank">{w.bankName} · {w.accountNo}</p>
                        </div>
                        <div className="af-wd-right">
                          <span className={`af-badge ${STATUS_BADGE[w.status] ?? "badge-pending"}`}>
                            {w.status}
                          </span>
                          <p className="af-wd-date">{new Date(w.requestedAt).toLocaleDateString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .af-page { display: flex; flex-direction: column; gap: 20px; }
        .af-loading { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
        .af-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Register page */
        .af-register-page {
          display: flex; align-items: center; justify-content: center; min-height: 60vh;
        }
        .af-register-card {
          background: white; border-radius: 24px; padding: 40px;
          max-width: 480px; width: 100%; text-align: center;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        }
        .af-register-art { font-size: 56px; margin-bottom: 16px; }
        .af-register-title { font-size: 22px; font-weight: 800; color: #1D1D1F; margin-bottom: 10px; }
        .af-register-desc { font-size: 14px; color: #6E6E73; margin-bottom: 24px; line-height: 1.6; }
        .af-register-benefits { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; text-align: left; }
        .af-benefit-item {
          display: flex; align-items: center; gap: 12px;
          font-size: 13px; color: #374151; background: #F5F5F7;
          padding: 10px 14px; border-radius: 10px;
        }
        .af-register-btn {
          width: 100%; padding: 14px; background: linear-gradient(135deg, #0077A8, #00a8d9);
          color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s;
        }
        .af-register-btn:hover:not(:disabled) { opacity: 0.9; }
        .af-register-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Main page */
        .af-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .af-title { font-size: 22px; font-weight: 800; color: #1D1D1F; }
        .af-subtitle { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .af-status-badge {
          font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 999px;
        }
        .af-status-active  { background: #DCFCE7; color: #16A34A; }
        .af-status-inactive { background: #FEE2E2; color: #DC2626; }

        /* Link card */
        .af-link-card {
          background: white; border-radius: 16px; padding: 20px 22px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .af-link-label { font-size: 12px; font-weight: 600; color: #6E6E73; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
        .af-link-row { display: flex; gap: 8px; }
        .af-link-input {
          flex: 1; border: 1.5px solid #E5E5EA; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; color: #6E6E73;
          background: #F5F5F7; outline: none;
        }
        .af-copy-btn {
          padding: 10px 18px; background: #0077A8; color: white;
          border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .af-copy-copied { background: #22C55E !important; }
        .af-link-meta { font-size: 12px; color: #6E6E73; margin-top: 10px; }

        /* Stats */
        .af-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .af-stat-card {
          background: white; border-radius: 16px; padding: 18px;
          text-align: center; border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06); transition: all 0.2s;
        }
        .af-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .af-stat-highlight { background: linear-gradient(135deg, #0a1628, #0d2b4e); }
        .af-stat-icon { font-size: 22px; margin-bottom: 8px; }
        .af-stat-value { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
        .af-stat-highlight .af-stat-value { color: white !important; }
        .af-stat-label { font-size: 11px; color: #6E6E73; font-weight: 500; }
        .af-stat-highlight .af-stat-label { color: rgba(255,255,255,0.5) !important; }

        /* Tabs */
        .af-tabs-section {
          background: white; border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .af-tab-list { display: flex; border-bottom: 1px solid rgba(0,0,0,0.08); }
        .af-tab-btn {
          flex: 1; padding: 14px 20px; background: none; border: none;
          font-size: 13px; font-weight: 600; color: #6E6E73; cursor: pointer;
          transition: all 0.18s; border-bottom: 2px solid transparent;
        }
        .af-tab-btn:hover { color: #0077A8; background: rgba(0,119,168,0.03); }
        .af-tab-active { color: #0077A8 !important; border-bottom-color: #0077A8 !important; }
        .af-tab-content { padding: 20px 22px; }

        /* Table */
        .af-table-wrap { overflow-x: auto; }
        .af-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .af-table thead tr { background: #F5F5F7; }
        .af-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #6E6E73; text-transform: uppercase; letter-spacing: 0.04em; }
        .af-table tbody tr { border-bottom: 1px solid #F5F5F7; transition: background 0.15s; }
        .af-table tbody tr:hover { background: #FAFAFA; }
        .af-table td { padding: 12px 14px; }
        .af-td-name { font-weight: 600; color: #1D1D1F; }
        .af-td-right { text-align: right; color: #6E6E73; }
        .af-td-komisi { color: #16A34A !important; font-weight: 700; }
        .af-td-center { text-align: center; }
        .af-td-date { font-size: 12px; color: #9CA3AF; }

        /* Badges */
        .af-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
        .badge-pending  { background: #FEF9C3; color: #CA8A04; }
        .badge-settled  { background: #DCFCE7; color: #16A34A; }
        .badge-approved { background: #DBEAFE; color: #1D4ED8; }
        .badge-rejected { background: #FEE2E2; color: #DC2626; }

        /* Empty */
        .af-empty { text-align: center; padding: 40px; color: #6E6E73; display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 14px; }
        .af-empty span { font-size: 36px; }

        /* Withdraw */
        .af-withdraw-section { display: flex; flex-direction: column; gap: 20px; }
        .af-balance-info {
          background: linear-gradient(135deg, #0a1628, #0d2b4e);
          border-radius: 14px; padding: 16px 20px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .af-balance-label { font-size: 12px; color: rgba(255,255,255,0.6); font-weight: 500; }
        .af-balance-value { font-size: 20px; font-weight: 800; color: white; }
        .af-withdraw-form { display: flex; flex-direction: column; gap: 14px; }
        .af-form-title { font-size: 14px; font-weight: 700; color: #1D1D1F; }
        .af-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .af-field-label { display: block; font-size: 11px; font-weight: 600; color: #6E6E73; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
        .af-field-input {
          width: 100%; border: 1.5px solid #E5E5EA; border-radius: 10px;
          padding: 9px 12px; font-size: 13px; outline: none;
          transition: border-color 0.18s;
        }
        .af-field-input:focus { border-color: #0077A8; }
        .af-msg { padding: 12px 16px; border-radius: 10px; font-size: 13px; }
        .af-msg-success { background: #DCFCE7; border: 1px solid #86EFAC; color: #166534; }
        .af-msg-error   { background: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; }
        .af-submit-btn {
          align-self: flex-start; padding: 11px 24px;
          background: #0077A8; color: white; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.2s;
        }
        .af-submit-btn:hover:not(:disabled) { background: #005f87; }
        .af-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .af-wd-history { }
        .af-wd-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
        .af-wd-item {
          display: flex; align-items: center; justify-content: space-between;
          background: #F5F5F7; border-radius: 12px; padding: 12px 14px;
        }
        .af-wd-amount { font-size: 14px; font-weight: 700; color: #1D1D1F; }
        .af-wd-bank { font-size: 11px; color: #6E6E73; margin-top: 2px; }
        .af-wd-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .af-wd-date { font-size: 11px; color: #9CA3AF; }

        @media (max-width: 768px) {
          .af-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .af-form-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .af-stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
