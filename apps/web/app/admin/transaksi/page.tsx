"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Transaction = {
  id: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  paidAt: string | null;
  user: { name: string; email: string };
  items: { itemTitle: string | null; itemType: string }[];
};

type Revenue = {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  conversionRate: number;
};

type Refund = {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  amount: string;
  adminNote: string | null;
  requestedAt: string;
  processedAt: string | null;
  user: { name: string; email: string };
};

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("jg_token");
}

const REFUND_STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

export default function AdminTransaksiPage() {
  const [activeTab, setActiveTab] = useState<"transaksi" | "refund">("transaksi");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 20;

  // Refund state
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundTotal, setRefundTotal] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    Promise.all([
      fetch(`${getApiBase()}/api/admin/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${getApiBase()}/api/admin/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([txData, revData]) => {
        if (txData.success) {
          setTransactions(txData.data);
          setTotal(txData.meta?.total ?? 0);
        }
        if (revData.success) setRevenue(revData.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, statusFilter, search]);

  useEffect(() => {
    if (activeTab !== "refund") return;
    const token = getToken();
    if (!token) return;
    setRefundLoading(true);
    fetch(`${getApiBase()}/api/orders/admin/refunds?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) { setRefunds(data.data); setRefundTotal(data.meta?.total ?? 0); }
        setRefundLoading(false);
      })
      .catch(() => setRefundLoading(false));
  }, [activeTab]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function processRefund(refundId: string, status: "approved" | "rejected", adminNote?: string) {
    const token = getToken();
    if (!token) return;
    setProcessingId(refundId);
    try {
      const res = await fetch(`${getApiBase()}/api/orders/admin/refunds/${refundId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, adminNote }),
      });
      const data = await res.json();
      if (data.success) {
        setRefunds((prev) => prev.map((r) => (r.id === refundId ? { ...r, status: data.data.status, processedAt: data.data.processedAt } : r)));
      }
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transaksi & Refund</h1>
        <div className="flex border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setActiveTab("transaksi")}
            className={`px-5 py-2 text-sm font-medium transition-colors ${activeTab === "transaksi" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Transaksi
          </button>
          <button
            onClick={() => setActiveTab("refund")}
            className={`px-5 py-2 text-sm font-medium transition-colors ${activeTab === "refund" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Refund {refundTotal > 0 && <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">{refundTotal}</span>}
          </button>
        </div>
      </div>

      {/* Revenue summary (transaksi only) */}
      {activeTab === "transaksi" && revenue && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Pendapatan", value: `Rp ${revenue.totalRevenue.toLocaleString("id-ID")}`, color: "text-blue-600" },
            { label: "Total Order", value: revenue.totalOrders.toLocaleString(), color: "text-gray-900" },
            { label: "Order Lunas", value: revenue.paidOrders.toLocaleString(), color: "text-green-600" },
            { label: "Conversion Rate", value: `${revenue.conversionRate}%`, color: "text-purple-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters (transaksi only) */}
      {activeTab === "transaksi" && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama / email / ID..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Cari
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
          >
            <option value="">Semua Status</option>
            <option value="paid">Lunas</option>
            <option value="pending">Menunggu</option>
            <option value="failed">Gagal</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
        </div>
      )}

      {/* Table (transaksi only) */}
      {activeTab === "transaksi" && <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Tidak ada transaksi.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Pengguna</th>
                <th className="text-left px-4 py-3">Item</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">#{tx.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{tx.user.name}</p>
                    <p className="text-xs text-gray-400">{tx.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                    {tx.items[0]?.itemTitle ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(tx.createdAt))}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    Rp {Number(tx.finalAmount).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[tx.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/transaksi/${tx.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>}

      {/* Pagination */}
      {activeTab === "transaksi" && total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ←
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Refund tab */}
      {activeTab === "refund" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {refundLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Tidak ada permintaan refund.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Pengguna</th>
                  <th className="text-left px-4 py-3">Order ID</th>
                  <th className="text-left px-4 py-3">Alasan</th>
                  <th className="text-right px-4 py-3">Jumlah</th>
                  <th className="text-left px-4 py-3">Tanggal</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {refunds.map((rf) => (
                  <tr key={rf.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{rf.user.name}</p>
                      <p className="text-xs text-gray-400">{rf.user.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      #{rf.orderId.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <p className="line-clamp-2 text-xs">{rf.reason}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      Rp {Number(rf.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(rf.requestedAt))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${REFUND_STATUS_BADGE[rf.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {rf.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rf.status === "pending" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => processRefund(rf.id, "approved")}
                            disabled={processingId === rf.id}
                            className="text-xs text-green-600 hover:underline disabled:opacity-50"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => processRefund(rf.id, "rejected", "Tidak memenuhi syarat refund")}
                            disabled={processingId === rf.id}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {rf.processedAt
                            ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(rf.processedAt))
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
