"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth/token";

type OrderItem = { itemTitle: string | null; itemType: string };
type Order = {
  id: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  paid:    { label: "Lunas",                className: "badge-paid" },
  pending: { label: "Menunggu Pembayaran",  className: "badge-pending" },
  failed:  { label: "Gagal",               className: "badge-failed" },
  expired: { label: "Kedaluwarsa",          className: "badge-expired" },
  cancelled: { label: "Dibatalkan",         className: "badge-expired" },
};

const TYPE_ICON: Record<string, string> = {
  course: "📖",
  ebook: "📚",
  event: "🎫",
  subscription: "⭐",
};


export default function PesananDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const limit = 10;

  async function handleCancelOrder(orderId: string) {
    const token = getToken();
    if (!token) return;
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (body.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
        );
      } else {
        alert(body.error?.message ?? "Gagal membatalkan pesanan.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/masuk"); return; }

    fetch(
      `/api/orders?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.data);
          setTotal(data.meta?.total ?? 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, router]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="po-loading"><span className="po-spinner" /></div>
    );
  }

  return (
    <div className="po-page">
      <div className="po-header">
        <div>
          <h1 className="po-title">Pesanan Saya</h1>
          <p className="po-subtitle">{total} total transaksi</p>
        </div>
        <Link href="/e-course" className="po-shop-btn">+ Beli Kursus</Link>
      </div>

      {orders.length === 0 ? (
        <div className="po-empty">
          <span className="po-empty-emoji">🛒</span>
          <h2 className="po-empty-title">Belum ada pesanan</h2>
          <p className="po-empty-desc">Mulai belajar dengan membeli kursus pertama Anda.</p>
          <Link href="/e-course" className="po-empty-cta">Jelajahi Kursus</Link>
        </div>
      ) : (
        <>
          <div className="po-list">
            {orders.map((order) => {
              const status = STATUS_LABEL[order.status] ?? { label: order.status, className: "badge-expired" };
              const title = order.items[0]?.itemTitle ?? "Produk";
              const itemType = order.items[0]?.itemType ?? "";
              const icon = TYPE_ICON[itemType] ?? "🛍️";

              return (
                <div key={order.id} className="po-card">
                  <div className="po-card-left">
                    <div className="po-type-icon">{icon}</div>
                    <div className="po-card-info">
                      <p className="po-card-title">{title}</p>
                      <p className="po-card-meta">
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(order.createdAt))}
                      </p>
                      <p className="po-card-id">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="po-card-right">
                    <p className="po-card-amount">
                      Rp {Number(order.finalAmount).toLocaleString("id-ID")}
                    </p>
                    <span className={`po-badge ${status.className}`}>{status.label}</span>
                    <div className="po-card-actions" style={{ alignItems: "center" }}>
                      <Link href={`/pesanan/${order.id}`} className="po-detail-link">
                        Lihat Detail →
                      </Link>
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="po-cancel-btn"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: "12px",
                            color: "#DC2626",
                            fontWeight: 600,
                            opacity: cancellingId === order.id ? 0.5 : 1,
                          }}
                        >
                          {cancellingId === order.id ? "Batal..." : "Batalkan"}
                        </button>
                      )}
                      {order.status === "paid" && (
                        <a
                          href={`/api/orders/${order.id}/invoice`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="po-invoice-link"
                        >
                          Invoice
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="po-pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="po-page-btn"
              >
                ← Sebelumnya
              </button>
              <span className="po-page-info">Halaman {page} dari {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="po-page-btn"
              >
                Berikutnya →
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .po-page { display: flex; flex-direction: column; gap: 20px; }
        .po-loading { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
        .po-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .po-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .po-title { font-size: 22px; font-weight: 800; color: #1D1D1F; }
        .po-subtitle { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .po-shop-btn {
          padding: 10px 20px; background: #0077A8; color: white;
          border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; transition: background 0.2s;
        }
        .po-shop-btn:hover { background: #005f87; }

        .po-empty {
          background: white; border-radius: 20px; padding: 64px 32px;
          text-align: center; border: 1px dashed #E5E5EA;
        }
        .po-empty-emoji { font-size: 56px; display: block; margin-bottom: 16px; }
        .po-empty-title { font-size: 18px; font-weight: 700; color: #1D1D1F; margin-bottom: 8px; }
        .po-empty-desc { font-size: 14px; color: #6E6E73; margin-bottom: 24px; }
        .po-empty-cta {
          display: inline-block; padding: 12px 28px;
          background: #0077A8; color: white; border-radius: 12px;
          font-size: 14px; font-weight: 600; text-decoration: none;
          transition: background 0.2s;
        }
        .po-empty-cta:hover { background: #005f87; }

        .po-list { display: flex; flex-direction: column; gap: 10px; }

        .po-card {
          background: white; border-radius: 16px; padding: 18px 20px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s;
          flex-wrap: wrap;
        }
        .po-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

        .po-card-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .po-type-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #F0F4F8; font-size: 22px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .po-card-info { min-width: 0; }
        .po-card-title { font-size: 14px; font-weight: 600; color: #1D1D1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .po-card-meta { font-size: 12px; color: #6E6E73; margin-top: 2px; }
        .po-card-id { font-size: 10px; color: #C0C0C7; font-family: monospace; margin-top: 2px; }

        .po-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
        .po-card-amount { font-size: 15px; font-weight: 700; color: #1D1D1F; }
        .po-badge {
          font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
        }
        .badge-paid    { background: #DCFCE7; color: #16A34A; }
        .badge-pending { background: #FEF9C3; color: #CA8A04; }
        .badge-failed  { background: #FEE2E2; color: #DC2626; }
        .badge-expired { background: #F3F4F6; color: #6B7280; }

        .po-card-actions { display: flex; gap: 10px; }
        .po-detail-link { font-size: 12px; color: #0077A8; text-decoration: none; font-weight: 600; }
        .po-detail-link:hover { text-decoration: underline; }
        .po-invoice-link { font-size: 12px; color: #6E6E73; text-decoration: none; }
        .po-invoice-link:hover { color: #1D1D1F; }

        /* Pagination */
        .po-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding-top: 8px; }
        .po-page-btn {
          padding: 9px 18px; background: white;
          border: 1px solid rgba(0,0,0,0.1); border-radius: 10px;
          font-size: 13px; font-weight: 600; color: #1D1D1F;
          cursor: pointer; transition: all 0.18s;
        }
        .po-page-btn:hover:not(:disabled) { background: #0077A8; color: white; border-color: #0077A8; }
        .po-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .po-page-info { font-size: 13px; color: #6E6E73; }

        @media (max-width: 640px) {
          .po-card { flex-direction: column; align-items: flex-start; }
          .po-card-right { align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
