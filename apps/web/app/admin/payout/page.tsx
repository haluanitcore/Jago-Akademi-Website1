"use client";

import { useEffect, useState } from "react";
import { getValidToken } from "@/lib/auth/token";

type TrainerPayout = {
  id: string;
  amount: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  status: string;
  note: string | null;
  requestedAt: string;
  processedAt: string | null;
  trainer: { id: string; name: string; email: string };
};

type AffiliateWithdrawal = {
  id: string;
  amount: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  status: string;
  note: string | null;
  requestedAt: string;
  processedAt: string | null;
  affiliate: { id: string; code: string; user: { id: string; name: string; email: string } };
};

type Stats = {
  trainer: { pending: number; approved: number; paid: number; pendingAmount: number };
  affiliate: { pending: number; approved: number; paid: number; pendingAmount: number };
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Menunggu",  cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Disetujui", cls: "bg-blue-100 text-blue-700" },
  rejected: { label: "Ditolak",   cls: "bg-red-100 text-red-700" },
  paid:     { label: "Dibayar",   cls: "bg-green-100 text-green-700" },
};

export default function AdminPayoutPage() {
  const [tab, setTab] = useState<"trainer" | "affiliate">("trainer");
  const [stats, setStats] = useState<Stats | null>(null);

  // Trainer state
  const [trainerPayouts, setTrainerPayouts] = useState<TrainerPayout[]>([]);
  const [trainerTotal, setTrainerTotal] = useState(0);
  const [trainerPage, setTrainerPage] = useState(1);
  const [trainerLoading, setTrainerLoading] = useState(true);

  // Affiliate state
  const [affWithdrawals, setAffWithdrawals] = useState<AffiliateWithdrawal[]>([]);
  const [affTotal, setAffTotal] = useState(0);
  const [affPage, setAffPage] = useState(1);
  const [affLoading, setAffLoading] = useState(true);

  // Common
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const limit = 15;

  // Modal
  const [modalItem, setModalItem] = useState<TrainerPayout | AffiliateWithdrawal | null>(null);
  const [modalTab, setModalTab] = useState<"trainer" | "affiliate">("trainer");
  const [modalAction, setModalAction] = useState<"approved" | "rejected" | "paid" | null>(null);
  const [modalNote, setModalNote] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  // ─── Load Stats ────────────────────────────────────────────────────────────
  async function loadStats() {
    const token = await getValidToken();
    if (!token) return;
    try {
      const r = await fetch("/api/admin/payouts/stats", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.success) setStats(d.data);
    } catch { /* ignore */ }
  }

  // ─── Load Trainer Payouts ──────────────────────────────────────────────────
  async function loadTrainer() {
    const token = await getValidToken();
    if (!token) return;
    setTrainerLoading(true);
    const params = new URLSearchParams({
      page: String(trainerPage), limit: String(limit),
      ...(search ? { search } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });
    try {
      const r = await fetch(`/api/admin/payouts/trainer?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.success) {
        setTrainerPayouts(d.data?.payouts ?? []);
        setTrainerTotal(d.data?.total ?? 0);
      }
    } finally { setTrainerLoading(false); }
  }

  // ─── Load Affiliate Withdrawals ────────────────────────────────────────────
  async function loadAffiliate() {
    const token = await getValidToken();
    if (!token) return;
    setAffLoading(true);
    const params = new URLSearchParams({
      page: String(affPage), limit: String(limit),
      ...(search ? { search } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });
    try {
      const r = await fetch(`/api/admin/payouts/affiliate?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.success) {
        setAffWithdrawals(d.data?.withdrawals ?? []);
        setAffTotal(d.data?.total ?? 0);
      }
    } finally { setAffLoading(false); }
  }

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === "trainer") loadTrainer(); }, [trainerPage, statusFilter, tab]); // eslint-disable-line
  useEffect(() => { if (tab === "affiliate") loadAffiliate(); }, [affPage, statusFilter, tab]); // eslint-disable-line

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "trainer") { setTrainerPage(1); loadTrainer(); }
    else { setAffPage(1); loadAffiliate(); }
  }

  function handleSwitchTab(t: "trainer" | "affiliate") {
    setTab(t);
    setStatusFilter("all");
    setSearch("");
  }

  // ─── Modal ─────────────────────────────────────────────────────────────────
  function openModal(item: TrainerPayout | AffiliateWithdrawal, type: "trainer" | "affiliate") {
    setModalItem(item);
    setModalTab(type);
    setModalAction(null);
    setModalNote("");
  }

  async function handleModalSubmit() {
    if (!modalItem || !modalAction) return;
    if (modalAction === "rejected" && !modalNote.trim()) {
      alert("Silakan masukkan alasan penolakan.");
      return;
    }
    setModalSaving(true);
    const token = await getValidToken();
    if (!token) return;
    try {
      const endpoint = modalTab === "trainer"
        ? `/api/admin/payouts/trainer/${modalItem.id}`
        : `/api/admin/payouts/affiliate/${modalItem.id}`;
      const r = await fetch(endpoint, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: modalAction, note: modalNote || undefined }),
      });
      const d = await r.json();
      if (d.success) {
        setModalItem(null);
        loadStats();
        if (modalTab === "trainer") loadTrainer();
        else loadAffiliate();
      } else {
        alert(d.error?.message ?? "Gagal memperbarui status.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setModalSaving(false);
    }
  }

  const trainerPages = Math.ceil(trainerTotal / limit);
  const affPages = Math.ceil(affTotal / limit);

  const kpiCards = stats ? [
    { label: "Trainer Pending", value: stats.trainer.pending, color: "#F59E0B" },
    { label: "Afiliator Pending", value: stats.affiliate.pending, color: "#F59E0B" },
    { label: "Total Sudah Dibayar", value: stats.trainer.paid + stats.affiliate.paid, color: "#10B981" },
    { label: "Nominal Pending", value: `Rp ${(stats.trainer.pendingAmount + stats.affiliate.pendingAmount).toLocaleString("id-ID")}`, color: "#0077A8" },
  ] : [];

  return (
    <div className="po-page">
      {/* Header */}
      <div className="po-header">
        <div>
          <h1 className="po-title">Pencatatan Payout</h1>
          <p className="po-sub">Kelola penarikan saldo Trainer & Afiliator</p>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="po-kpi-grid">
          {kpiCards.map((k) => (
            <div key={k.label} className="po-kpi-card">
              <span className="po-kpi-label">{k.label}</span>
              <span className="po-kpi-val" style={{ color: k.color }}>{k.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="po-tabs-row">
        <div className="po-tab-btns">
          <button type="button" data-testid="tab-trainer" className={`po-tab-btn ${tab === "trainer" ? "po-tab-active" : ""}`} onClick={() => handleSwitchTab("trainer")}>
            👨‍🏫 Trainer
          </button>
          <button type="button" data-testid="tab-affiliate" className={`po-tab-btn ${tab === "affiliate" ? "po-tab-active" : ""}`} onClick={() => handleSwitchTab("affiliate")}>
            🤝 Afiliator
          </button>
        </div>

        <div className="po-filters">
          <form onSubmit={handleSearch} className="po-search-form">
            <input className="po-search-input" placeholder="Cari nama..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="po-search-btn">🔍</button>
          </form>
          <div className="po-status-tabs">
            {["all", "pending", "approved", "rejected", "paid"].map((s) => (
              <button key={s} className={`po-status-tab ${statusFilter === s ? "po-st-active" : ""}`} onClick={() => { setStatusFilter(s); if (tab === "trainer") setTrainerPage(1); else setAffPage(1); }}>
                {s === "all" ? "Semua" : STATUS_MAP[s]?.label ?? s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="po-table-wrap">
        {tab === "trainer" ? (
          trainerLoading ? (
            <div className="po-loading"><span className="po-spinner" /></div>
          ) : trainerPayouts.length === 0 ? (
            <div className="po-empty"><p>📭</p><p>Tidak ada data payout trainer.</p></div>
          ) : (
            <table className="po-table">
              <thead>
                <tr>
                  <th>TRAINER</th>
                  <th>BANK / REKENING</th>
                  <th>JUMLAH</th>
                  <th>TANGGAL</th>
                  <th>STATUS</th>
                  <th>CATATAN</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {trainerPayouts.map((p) => {
                  const st = STATUS_MAP[p.status] ?? STATUS_MAP["pending"]!;
                  return (
                    <tr key={p.id}>
                      <td>
                        <p className="po-name">{p.trainer.name}</p>
                        <p className="po-email">{p.trainer.email}</p>
                      </td>
                      <td>
                        <p className="po-bank">{p.bankName}</p>
                        <p className="po-acct">{p.accountNo} · {p.accountName}</p>
                      </td>
                      <td><span className="po-amount">Rp {parseFloat(p.amount).toLocaleString("id-ID")}</span></td>
                      <td>
                        <p className="po-date">{new Date(p.requestedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
                        {p.processedAt && <p className="po-date-sub">Diproses: {new Date(p.processedAt).toLocaleDateString("id-ID")}</p>}
                      </td>
                      <td><span className={`po-badge ${st.cls}`}>{st.label}</span></td>
                      <td><span className="po-note">{p.note ?? "—"}</span></td>
                      <td>
                        {p.status === "pending" || p.status === "approved" ? (
                          <button className="po-btn po-btn-action" onClick={() => openModal(p, "trainer")}>⚙️ Kelola</button>
                        ) : (
                          <span className="po-done">✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          affLoading ? (
            <div className="po-loading"><span className="po-spinner" /></div>
          ) : affWithdrawals.length === 0 ? (
            <div className="po-empty"><p>📭</p><p>Tidak ada data withdrawal afiliator.</p></div>
          ) : (
            <table className="po-table">
              <thead>
                <tr>
                  <th>AFILIATOR</th>
                  <th>BANK / REKENING</th>
                  <th>JUMLAH</th>
                  <th>TANGGAL</th>
                  <th>STATUS</th>
                  <th>CATATAN</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {affWithdrawals.map((w) => {
                  const st = STATUS_MAP[w.status] ?? STATUS_MAP["pending"]!;
                  return (
                    <tr key={w.id}>
                      <td>
                        <p className="po-name">{w.affiliate.user.name}</p>
                        <p className="po-email">{w.affiliate.user.email}</p>
                        <p className="po-code">Kode: {w.affiliate.code}</p>
                      </td>
                      <td>
                        <p className="po-bank">{w.bankName}</p>
                        <p className="po-acct">{w.accountNo} · {w.accountName}</p>
                      </td>
                      <td><span className="po-amount">Rp {parseFloat(w.amount).toLocaleString("id-ID")}</span></td>
                      <td>
                        <p className="po-date">{new Date(w.requestedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
                        {w.processedAt && <p className="po-date-sub">Diproses: {new Date(w.processedAt).toLocaleDateString("id-ID")}</p>}
                      </td>
                      <td><span className={`po-badge ${st.cls}`}>{st.label}</span></td>
                      <td><span className="po-note">{w.note ?? "—"}</span></td>
                      <td>
                        {w.status === "pending" || w.status === "approved" ? (
                          <button className="po-btn po-btn-action" onClick={() => openModal(w, "affiliate")}>⚙️ Kelola</button>
                        ) : (
                          <span className="po-done">✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Pagination */}
      {tab === "trainer" && trainerPages > 1 && (
        <div className="po-pagination">
          <button onClick={() => setTrainerPage((p) => Math.max(1, p - 1))} disabled={trainerPage === 1} className="po-page-btn">← Prev</button>
          <span className="po-page-info">Halaman {trainerPage} dari {trainerPages}</span>
          <button onClick={() => setTrainerPage((p) => Math.min(trainerPages, p + 1))} disabled={trainerPage === trainerPages} className="po-page-btn">Next →</button>
        </div>
      )}
      {tab === "affiliate" && affPages > 1 && (
        <div className="po-pagination">
          <button onClick={() => setAffPage((p) => Math.max(1, p - 1))} disabled={affPage === 1} className="po-page-btn">← Prev</button>
          <span className="po-page-info">Halaman {affPage} dari {affPages}</span>
          <button onClick={() => setAffPage((p) => Math.min(affPages, p + 1))} disabled={affPage === affPages} className="po-page-btn">Next →</button>
        </div>
      )}

      {/* Modal */}
      {modalItem && (
        <div className="po-modal-overlay" onClick={() => setModalItem(null)}>
          <div className="po-modal" onClick={(e) => e.stopPropagation()}>
            <div className="po-modal-header">
              <h2 className="po-modal-title">Kelola Payout</h2>
              <button className="po-modal-close" onClick={() => setModalItem(null)}>✕</button>
            </div>
            <div className="po-modal-body">
              {/* Summary */}
              <div className="po-modal-summary">
                <div className="po-modal-field">
                  <span className="po-field-label">Nama</span>
                  <span className="po-field-val">
                    {modalTab === "trainer"
                      ? (modalItem as TrainerPayout).trainer.name
                      : (modalItem as AffiliateWithdrawal).affiliate.user.name}
                  </span>
                </div>
                <div className="po-modal-field">
                  <span className="po-field-label">Jumlah</span>
                  <span className="po-field-val po-amount">Rp {parseFloat(modalItem.amount).toLocaleString("id-ID")}</span>
                </div>
                <div className="po-modal-field">
                  <span className="po-field-label">Bank</span>
                  <span className="po-field-val">{modalItem.bankName} — {modalItem.accountNo} ({modalItem.accountName})</span>
                </div>
                <div className="po-modal-field">
                  <span className="po-field-label">Status Saat Ini</span>
                  <span className={`po-badge ${STATUS_MAP[modalItem.status]?.cls ?? ""}`}>
                    {STATUS_MAP[modalItem.status]?.label ?? modalItem.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="po-modal-actions-grid">
                <h3 className="po-section-title">Pilih Tindakan</h3>
                <div className="po-action-btns">
                  {modalItem.status === "pending" && (
                    <button
                      className={`po-action-btn po-act-approve ${modalAction === "approved" ? "po-act-selected" : ""}`}
                      onClick={() => { setModalAction("approved"); setModalNote(""); }}
                    >
                      ✓ Setujui
                    </button>
                  )}
                  {modalItem.status === "pending" && (
                    <button
                      className={`po-action-btn po-act-reject ${modalAction === "rejected" ? "po-act-selected" : ""}`}
                      onClick={() => { setModalAction("rejected"); setModalNote(""); }}
                    >
                      ✕ Tolak
                    </button>
                  )}
                  {(modalItem.status === "pending" || modalItem.status === "approved") && (
                    <button
                      className={`po-action-btn po-act-paid ${modalAction === "paid" ? "po-act-selected" : ""}`}
                      onClick={() => { setModalAction("paid"); setModalNote(""); }}
                    >
                      💰 Tandai Dibayar
                    </button>
                  )}
                </div>
              </div>

              {/* Note input */}
              {modalAction && (
                <div className="po-note-section">
                  <label className="po-note-label">
                    {modalAction === "rejected" ? "Alasan Penolakan (Wajib)" : modalAction === "paid" ? "Referensi Transfer (Opsional)" : "Catatan (Opsional)"}
                  </label>
                  <textarea
                    className="po-note-input"
                    rows={3}
                    placeholder={
                      modalAction === "rejected" ? "Contoh: Nomor rekening tidak valid..."
                      : modalAction === "paid" ? "Contoh: Transfer BCA #12345 tanggal 17 Jul 2026"
                      : "Catatan tambahan..."
                    }
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="po-modal-footer">
              <button className="po-btn po-btn-cancel" onClick={() => setModalItem(null)} disabled={modalSaving}>Batal</button>
              {modalAction && (
                <button
                  className={`po-btn ${
                    modalAction === "approved" ? "po-btn-approve-final" :
                    modalAction === "rejected" ? "po-btn-reject-final" :
                    "po-btn-paid-final"
                  }`}
                  onClick={handleModalSubmit}
                  disabled={modalSaving}
                >
                  {modalSaving ? "Memproses..." :
                    modalAction === "approved" ? "✓ Konfirmasi Setujui" :
                    modalAction === "rejected" ? "✕ Konfirmasi Tolak" :
                    "💰 Konfirmasi Dibayar"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .po-page { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; }
        .po-header { display: flex; align-items: center; justify-content: space-between; }
        .po-title { font-size: 20px; font-weight: 800; color: #1D1D1F; }
        .po-sub { font-size: 13px; color: #6E6E73; margin-top: 3px; }

        .po-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .po-kpi-card { background: white; border-radius: 16px; padding: 16px 20px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 6px; }
        .po-kpi-label { font-size: 11px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.03em; }
        .po-kpi-val { font-size: 22px; font-weight: 800; }

        .po-tabs-row { display: flex; flex-direction: column; gap: 12px; }
        .po-tab-btns { display: flex; gap: 6px; }
        .po-tab-btn { padding: 9px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; border: 1.5px solid #E5E5EA; background: white; cursor: pointer; color: #6E6E73; transition: all 0.18s; }
        .po-tab-active { background: #0077A8; color: white; border-color: #0077A8; }

        .po-filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .po-search-form { display: flex; gap: 6px; }
        .po-search-input { padding: 8px 14px; border-radius: 10px; border: 1.5px solid #E5E5EA; font-size: 13px; outline: none; min-width: 200px; }
        .po-search-input:focus { border-color: #0077A8; box-shadow: 0 0 0 3px rgba(0,119,168,0.1); }
        .po-search-btn { padding: 8px 14px; border-radius: 10px; background: #0077A8; color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer; }
        .po-status-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
        .po-status-tab { padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; border: 1.5px solid #E5E5EA; background: white; cursor: pointer; color: #6E6E73; transition: all 0.18s; }
        .po-st-active { background: #0077A8; color: white; border-color: #0077A8; }

        .po-table-wrap { background: white; border-radius: 18px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow-x: auto; }
        .po-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .po-table thead tr { background: #F9FAFB; border-bottom: 1px solid #F0F0F5; }
        .po-table th { padding: 12px 14px; font-size: 11px; font-weight: 700; color: #6E6E73; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap; }
        .po-table td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #F5F5F7; vertical-align: middle; }
        .po-table tr:last-child td { border-bottom: none; }
        .po-table tr:hover td { background: #FAFAFA; }

        .po-name { font-size: 13px; font-weight: 600; color: #1D1D1F; }
        .po-email { font-size: 11px; color: #9CA3AF; }
        .po-code { font-size: 10px; color: #0077A8; font-weight: 600; margin-top: 2px; }
        .po-bank { font-size: 13px; font-weight: 500; color: #1D1D1F; }
        .po-acct { font-size: 11px; color: #9CA3AF; }
        .po-amount { font-size: 13px; font-weight: 700; color: #1D1D1F; }
        .po-date { font-size: 12px; color: #6E6E73; }
        .po-date-sub { font-size: 10px; color: #9CA3AF; }
        .po-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; display: inline-block; }
        .po-note { font-size: 11px; color: #6E6E73; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
        .po-done { font-size: 14px; color: #10B981; font-weight: 700; }

        .po-btn { padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
        .po-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .po-btn-action { background: #E5F3FF; color: #0077A8; }
        .po-btn-action:hover { background: #0077A8; color: white; }

        .po-loading { display: flex; justify-content: center; padding: 48px; }
        .po-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #0077A8; border-top-color: transparent; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .po-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: #9CA3AF; font-size: 14px; }
        .po-empty p:first-child { font-size: 32px; }

        .po-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .po-page-btn { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E5E5EA; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #1D1D1F; transition: all 0.18s; }
        .po-page-btn:hover:not(:disabled) { border-color: #0077A8; color: #0077A8; }
        .po-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .po-page-info { font-size: 13px; color: #6E6E73; }

        /* Modal */
        .po-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .po-modal { background: white; border-radius: 20px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.15); animation: scaleUp 0.2s ease-out; }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .po-modal-header { padding: 18px 24px; border-bottom: 1px solid #F0F0F5; display: flex; justify-content: space-between; align-items: center; }
        .po-modal-title { font-size: 16px; font-weight: 700; color: #1D1D1F; }
        .po-modal-close { background: none; border: none; font-size: 18px; color: #6E6E73; cursor: pointer; }
        .po-modal-close:hover { color: #1D1D1F; }

        .po-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .po-modal-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .po-modal-field { background: #F9FAFB; border-radius: 12px; padding: 12px 16px; border: 1px solid #F0F0F5; display: flex; flex-direction: column; gap: 4px; }
        .po-field-label { font-size: 10px; font-weight: 700; color: #8E8E93; text-transform: uppercase; }
        .po-field-val { font-size: 13px; font-weight: 600; color: #1D1D1F; }

        .po-modal-actions-grid { display: flex; flex-direction: column; gap: 10px; }
        .po-section-title { font-size: 12px; font-weight: 700; color: #1D1D1F; text-transform: uppercase; letter-spacing: 0.03em; }
        .po-action-btns { display: flex; gap: 8px; }
        .po-action-btn { padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; border: 2px solid transparent; cursor: pointer; transition: all 0.18s; }
        .po-act-approve { background: #DCFCE7; color: #16A34A; }
        .po-act-approve:hover, .po-act-approve.po-act-selected { background: #16A34A; color: white; border-color: #15803D; }
        .po-act-reject { background: #FEE2E2; color: #DC2626; }
        .po-act-reject:hover, .po-act-reject.po-act-selected { background: #DC2626; color: white; border-color: #B91C1C; }
        .po-act-paid { background: #E5F3FF; color: #0077A8; }
        .po-act-paid:hover, .po-act-paid.po-act-selected { background: #0077A8; color: white; border-color: #005f87; }

        .po-note-section { display: flex; flex-direction: column; gap: 6px; }
        .po-note-label { font-size: 12px; font-weight: 600; color: #6E6E73; }
        .po-note-input { width: 100%; border: 1.5px solid #E5E5EA; border-radius: 12px; padding: 12px; font-size: 13px; outline: none; font-family: inherit; resize: vertical; }
        .po-note-input:focus { border-color: #0077A8; box-shadow: 0 0 0 3px rgba(0,119,168,0.1); }

        .po-modal-footer { border-top: 1px solid #F0F0F5; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
        .po-btn-cancel { background: #F2F2F7; color: #1D1D1F; }
        .po-btn-cancel:hover { background: #E5E5EA; }
        .po-btn-approve-final { background: #16A34A; color: white; }
        .po-btn-approve-final:hover { background: #15803D; }
        .po-btn-reject-final { background: #DC2626; color: white; }
        .po-btn-reject-final:hover { background: #B91C1C; }
        .po-btn-paid-final { background: #0077A8; color: white; }
        .po-btn-paid-final:hover { background: #005f87; }
      `}</style>
    </div>
  );
}
