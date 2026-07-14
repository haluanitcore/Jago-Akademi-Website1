"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth/token";

type Order = {
  id: string;
  finalAmount: number;
  originalAmount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  user: { name: string; email: string };
  items: { itemTitle: string | null; itemType: string; amount: number }[];
};

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
  refunded: "bg-purple-100 text-purple-700",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Lunas", pending: "Menunggu", failed: "Gagal", expired: "Kadaluarsa", refunded: "Refund",
};


export default function AdminTransaksiPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalRevenue: 0, paidCount: 0, pendingCount: 0 });
  const limit = 15;

  function loadOrders() {
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search ? { search } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });
    setLoading(true);
    fetch(`/api/admin/orders?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          const list: Order[] = body.data?.orders ?? body.data ?? [];
          setOrders(list);
          setTotal(body.data?.total ?? list.length);
          // compute summary from current page (approximate)
          const paid = list.filter((o) => o.status === "paid");
          setSummary({
            totalRevenue: paid.reduce((s, o) => s + Number(o.finalAmount), 0),
            paidCount: paid.length,
            pendingCount: list.filter((o) => o.status === "pending").length,
          });
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadOrders(); }, [page, statusFilter]); // eslint-disable-line

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); loadOrders(); }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="tr-page">
      <div className="tr-header">
        <div>
          <h1 className="tr-title">Laporan Transaksi</h1>
          <p className="tr-sub">{total.toLocaleString("id-ID")} transaksi total</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="tr-summary-grid">
        {[
          { label: "Pendapatan (halaman ini)", value: `Rp ${summary.totalRevenue.toLocaleString("id-ID")}`, icon: "💰", cls: "text-green-600" },
          { label: "Transaksi Lunas", value: summary.paidCount, icon: "✅", cls: "text-blue-600" },
          { label: "Menunggu Pembayaran", value: summary.pendingCount, icon: "⏳", cls: "text-yellow-600" },
        ].map(({ label, value, icon, cls }) => (
          <div key={label} className="tr-summary-card">
            <span className="tr-summary-icon">{icon}</span>
            <div>
              <p className={`tr-summary-value ${cls}`}>{value}</p>
              <p className="tr-summary-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="tr-filters">
        <form onSubmit={handleSearch} className="tr-search-form">
          <input className="tr-input" placeholder="Cari nama pelanggan atau email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="tr-search-btn">🔍 Cari</button>
        </form>
        <div className="tr-status-tabs">
          {["all", "paid", "pending", "failed", "expired", "refunded"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`tr-tab ${statusFilter === s ? "tr-tab-active" : ""}`}>
              {s === "all" ? "Semua" : STATUS_LABEL[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="tr-table-wrap">
        {loading ? (
          <div className="tr-loading"><span className="tr-spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="tr-empty"><p>💳</p><p>Tidak ada transaksi ditemukan</p></div>
        ) : (
          <table className="tr-table">
            <thead>
              <tr>
                <th>ID</th><th>Pelanggan</th><th>Produk</th><th>Metode</th>
                <th>Status</th><th>Jumlah</th><th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const badge = STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-500";
                const title = order.items[0]?.itemTitle ?? "—";
                return (
                  <tr key={order.id}>
                    <td><code className="tr-id">{order.id.slice(0, 8)}…</code></td>
                    <td>
                      <p className="tr-user-name">{order.user.name}</p>
                      <p className="tr-user-email">{order.user.email}</p>
                    </td>
                    <td>
                      <p className="tr-product">{title}</p>
                      {order.items.length > 1 && <p className="tr-more">+{order.items.length - 1} item</p>}
                    </td>
                    <td><span className="tr-method">{order.paymentMethod ?? "—"}</span></td>
                    <td><span className={`tr-badge ${badge}`}>{STATUS_LABEL[order.status] ?? order.status}</span></td>
                    <td>
                      <p className="tr-amount">Rp {Number(order.finalAmount).toLocaleString("id-ID")}</p>
                      {Number(order.originalAmount) !== Number(order.finalAmount) && (
                        <p className="tr-orig">Rp {Number(order.originalAmount).toLocaleString("id-ID")}</p>
                      )}
                    </td>
                    <td>
                      <span className="tr-date">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="tr-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="tr-page-btn">← Prev</button>
          <span className="tr-page-info">Halaman {page} dari {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="tr-page-btn">Next →</button>
        </div>
      )}

      <style jsx>{`
        .tr-page { display:flex; flex-direction:column; gap:20px; max-width:1200px; }
        .tr-header { display:flex; align-items:center; justify-content:space-between; }
        .tr-title { font-size:20px; font-weight:800; color:#1D1D1F; }
        .tr-sub { font-size:13px; color:#6E6E73; margin-top:3px; }

        .tr-summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .tr-summary-card { background:white; border-radius:16px; padding:18px 20px; display:flex; align-items:center; gap:14px; border:1px solid rgba(0,0,0,0.06); box-shadow:0 1px 4px rgba(0,0,0,0.06); }
        .tr-summary-icon { font-size:28px; }
        .tr-summary-value { font-size:18px; font-weight:800; }
        .tr-summary-label { font-size:11px; color:#6E6E73; margin-top:2px; }

        .tr-filters { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .tr-search-form { display:flex; gap:8px; flex:1; min-width:240px; }
        .tr-input { flex:1; padding:9px 14px; border-radius:10px; border:1.5px solid #E5E5EA; font-size:13px; outline:none; }
        .tr-input:focus { border-color:#0077A8; box-shadow:0 0 0 3px rgba(0,119,168,0.1); }
        .tr-search-btn { padding:9px 16px; border-radius:10px; background:#0077A8; color:white; border:none; font-size:13px; font-weight:600; cursor:pointer; }
        .tr-status-tabs { display:flex; gap:6px; flex-wrap:wrap; }
        .tr-tab { padding:7px 14px; border-radius:999px; font-size:12px; font-weight:600; border:1.5px solid #E5E5EA; background:white; cursor:pointer; color:#6E6E73; transition:all 0.18s; }
        .tr-tab-active { background:#0077A8; color:white; border-color:#0077A8; }

        .tr-table-wrap { background:white; border-radius:18px; overflow:hidden; border:1px solid rgba(0,0,0,0.06); box-shadow:0 1px 4px rgba(0,0,0,0.06); overflow-x:auto; }
        .tr-table { width:100%; border-collapse:collapse; min-width:800px; }
        .tr-table thead tr { background:#F9FAFB; border-bottom:1px solid #F0F0F5; }
        .tr-table th { padding:12px 14px; font-size:11px; font-weight:700; color:#6E6E73; text-transform:uppercase; letter-spacing:0.05em; text-align:left; white-space:nowrap; }
        .tr-table td { padding:11px 14px; font-size:13px; border-bottom:1px solid #F5F5F7; vertical-align:middle; }
        .tr-table tr:last-child td { border-bottom:none; }
        .tr-table tr:hover td { background:#FAFAFA; }

        .tr-id { font-size:11px; font-family:monospace; background:#F3F4F6; padding:2px 6px; border-radius:5px; color:#6B7280; }
        .tr-user-name { font-size:13px; font-weight:600; }
        .tr-user-email { font-size:11px; color:#9CA3AF; }
        .tr-product { font-size:13px; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .tr-more { font-size:10px; color:#9CA3AF; }
        .tr-method { font-size:11px; background:#F5F5F7; padding:3px 8px; border-radius:6px; color:#6E6E73; text-transform:uppercase; }
        .tr-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; display:inline-block; }
        .tr-amount { font-size:13px; font-weight:700; color:#1D1D1F; }
        .tr-orig { font-size:10px; color:#9CA3AF; text-decoration:line-through; }
        .tr-date { font-size:12px; color:#6E6E73; }

        .tr-loading { display:flex; justify-content:center; padding:48px; }
        .tr-spinner { width:32px; height:32px; border-radius:50%; border:3px solid #0077A8; border-top-color:transparent; animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .tr-empty { display:flex; flex-direction:column; align-items:center; gap:8px; padding:48px; color:#9CA3AF; font-size:14px; }
        .tr-empty p:first-child { font-size:32px; }

        .tr-pagination { display:flex; align-items:center; justify-content:center; gap:16px; }
        .tr-page-btn { padding:8px 16px; border-radius:10px; border:1.5px solid #E5E5EA; background:white; font-size:13px; font-weight:600; cursor:pointer; color:#1D1D1F; transition:all 0.18s; }
        .tr-page-btn:hover:not(:disabled) { border-color:#0077A8; color:#0077A8; }
        .tr-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .tr-page-info { font-size:13px; color:#6E6E73; }
      `}</style>
    </div>
  );
}
