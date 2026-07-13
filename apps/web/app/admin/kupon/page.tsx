"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minPurchase: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token") || sessionStorage.getItem("jg_token");
}

const EMPTY_FORM = { code: "", type: "percentage", value: 0, minPurchase: 0, maxUses: "", expiresAt: "" };

export default function AdminKuponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadCoupons() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    fetch("/api/admin/coupons?limit=50", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => { if (body.success) setCoupons(body.data?.coupons ?? body.data ?? []); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadCoupons(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError(null);
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minPurchase: Number(form.minPurchase),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    };
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    setSaving(false);
    if (res.success) { setShowForm(false); setForm(EMPTY_FORM); loadCoupons(); }
    else setError(res.error?.message ?? "Gagal membuat kupon.");
  }

  async function toggleActive(id: string, current: boolean) {
    const token = getToken();
    if (!token) return;
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    loadCoupons();
  }

  return (
    <div className="kp-page">
      <div className="kp-header">
        <div>
          <h1 className="kp-title">Manajemen Kupon</h1>
          <p className="kp-sub">{coupons.length} kupon terdaftar</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="kp-create-btn">
          {showForm ? "✕ Batal" : "+ Buat Kupon"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="kp-form-card">
          <h2 className="kp-form-title">Buat Kupon Baru</h2>
          {error && <div className="kp-error">{error}</div>}
          <form onSubmit={handleCreate} className="kp-form">
            <div className="kp-form-row">
              <div className="kp-field">
                <label>Kode Kupon *</label>
                <input required className="kp-input" placeholder="PROMO50" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="kp-field">
                <label>Tipe *</label>
                <select className="kp-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="percentage">Persen (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              <div className="kp-field">
                <label>Nilai *</label>
                <input required type="number" min={0} className="kp-input" placeholder={form.type === "percentage" ? "50" : "50000"} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
              </div>
            </div>
            <div className="kp-form-row">
              <div className="kp-field">
                <label>Minimal Pembelian (Rp)</label>
                <input type="number" min={0} className="kp-input" placeholder="0" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })} />
              </div>
              <div className="kp-field">
                <label>Maks. Penggunaan</label>
                <input type="number" min={1} className="kp-input" placeholder="Tanpa batas" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
              </div>
              <div className="kp-field">
                <label>Kadaluarsa</label>
                <input type="datetime-local" className="kp-input" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="kp-submit-btn">
              {saving ? "Menyimpan…" : "✓ Buat Kupon"}
            </button>
          </form>
        </div>
      )}

      {/* Coupon Cards */}
      {loading ? (
        <div className="kp-loading"><span className="kp-spinner" /></div>
      ) : coupons.length === 0 ? (
        <div className="kp-empty"><p>🏷️</p><p>Belum ada kupon. Buat yang pertama!</p></div>
      ) : (
        <div className="kp-grid">
          {coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const usageRate = c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : null;
            return (
              <div key={c.id} className={`kp-card ${!c.isActive || expired ? "kp-card-inactive" : ""}`}>
                <div className="kp-card-top">
                  <div>
                    <p className="kp-code">{c.code}</p>
                    <p className="kp-type">
                      {c.type === "percentage" ? `${c.value}% off` : `Rp ${Number(c.value).toLocaleString("id-ID")} off`}
                      {c.minPurchase > 0 && ` · min. Rp ${Number(c.minPurchase).toLocaleString("id-ID")}`}
                    </p>
                  </div>
                  <div className="kp-card-badges">
                    <span className={`kp-badge ${c.isActive && !expired ? "kp-badge-active" : "kp-badge-off"}`}>
                      {expired ? "Kadaluarsa" : c.isActive ? "Aktif" : "Non-aktif"}
                    </span>
                  </div>
                </div>
                <div className="kp-card-stats">
                  <span>📊 {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""} digunakan</span>
                  {c.expiresAt && (
                    <span>⏰ {new Date(c.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  )}
                </div>
                {usageRate !== null && (
                  <div className="kp-progress-bar">
                    <div className="kp-progress-fill" style={{ width: `${Math.min(100, usageRate)}%` }} />
                  </div>
                )}
                <button
                  className={`kp-toggle-btn ${c.isActive ? "kp-toggle-off" : "kp-toggle-on"}`}
                  onClick={() => toggleActive(c.id, c.isActive)}
                >
                  {c.isActive ? "Non-aktifkan" : "Aktifkan"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .kp-page { display:flex; flex-direction:column; gap:20px; max-width:1100px; }
        .kp-header { display:flex; align-items:center; justify-content:space-between; }
        .kp-title { font-size:20px; font-weight:800; color:#1D1D1F; }
        .kp-sub { font-size:13px; color:#6E6E73; margin-top:3px; }
        .kp-create-btn { padding:9px 18px; border-radius:10px; background:#0077A8; color:white; border:none; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; }
        .kp-create-btn:hover { background:#005f87; }

        .kp-form-card { background:white; border-radius:18px; padding:24px; border:1px solid rgba(0,0,0,0.06); box-shadow:0 1px 4px rgba(0,0,0,0.06); }
        .kp-form-title { font-size:15px; font-weight:700; color:#1D1D1F; margin-bottom:16px; }
        .kp-error { background:#FEE2E2; color:#DC2626; padding:10px 14px; border-radius:10px; font-size:13px; margin-bottom:12px; }
        .kp-form { display:flex; flex-direction:column; gap:14px; }
        .kp-form-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .kp-field { display:flex; flex-direction:column; gap:5px; }
        .kp-field label { font-size:12px; font-weight:600; color:#374151; }
        .kp-input { padding:9px 12px; border-radius:10px; border:1.5px solid #E5E5EA; font-size:13px; outline:none; }
        .kp-input:focus { border-color:#0077A8; box-shadow:0 0 0 3px rgba(0,119,168,0.1); }
        .kp-submit-btn { align-self:flex-start; padding:10px 24px; border-radius:10px; background:#0077A8; color:white; border:none; font-size:13px; font-weight:700; cursor:pointer; }
        .kp-submit-btn:disabled { opacity:0.6; cursor:not-allowed; }

        .kp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .kp-card { background:white; border-radius:16px; padding:18px; border:1px solid rgba(0,0,0,0.06); box-shadow:0 1px 4px rgba(0,0,0,0.06); transition:all 0.2s; }
        .kp-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.1); transform:translateY(-2px); }
        .kp-card-inactive { opacity:0.65; }
        .kp-card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
        .kp-code { font-size:16px; font-weight:900; font-family:monospace; color:#1D1D1F; letter-spacing:0.08em; }
        .kp-type { font-size:12px; color:#6E6E73; margin-top:3px; }
        .kp-card-badges { display:flex; gap:4px; }
        .kp-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; }
        .kp-badge-active { background:#DCFCE7; color:#16A34A; }
        .kp-badge-off { background:#F3F4F6; color:#6B7280; }
        .kp-card-stats { display:flex; flex-wrap:wrap; gap:10px; font-size:12px; color:#6E6E73; margin-bottom:10px; }
        .kp-progress-bar { height:4px; background:#F3F4F6; border-radius:999px; overflow:hidden; margin-bottom:12px; }
        .kp-progress-fill { height:100%; background:linear-gradient(90deg,#0077A8,#CC0052); border-radius:999px; transition:width 0.5s; }
        .kp-toggle-btn { width:100%; padding:8px; border-radius:10px; font-size:12px; font-weight:700; border:none; cursor:pointer; transition:all 0.18s; }
        .kp-toggle-on { background:#DCFCE7; color:#16A34A; }
        .kp-toggle-on:hover { background:#16A34A; color:white; }
        .kp-toggle-off { background:#FEE2E2; color:#DC2626; }
        .kp-toggle-off:hover { background:#DC2626; color:white; }
        .kp-loading { display:flex; justify-content:center; padding:48px; }
        .kp-spinner { width:32px; height:32px; border-radius:50%; border:3px solid #0077A8; border-top-color:transparent; animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .kp-empty { display:flex; flex-direction:column; align-items:center; gap:8px; padding:48px; color:#9CA3AF; font-size:14px; }
        .kp-empty p:first-child { font-size:32px; }

        @media (max-width:768px) {
          .kp-form-row { grid-template-columns:1fr; }
          .kp-grid { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}
