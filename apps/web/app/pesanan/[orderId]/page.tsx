"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth/token";

type OrderDetail = {
  id: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string | null;
  createdAt: string;
  paidAt: string | null;
  coupon: { code: string } | null;
  items: { id: string; itemTitle: string | null; itemType: string; quantity: number; unitPrice: number; totalPrice: number }[];
  transactions: { gateway: string; status: string; createdAt: string }[];
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  paid: { label: "Lunas", color: "text-green-600 bg-green-50" },
  pending: { label: "Menunggu Pembayaran", color: "text-yellow-600 bg-yellow-50" },
  failed: { label: "Gagal", color: "text-red-600 bg-red-50" },
  expired: { label: "Kedaluwarsa", color: "text-gray-500 bg-gray-50" },
  refunded: { label: "Direfund", color: "text-purple-600 bg-purple-50" },
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}


export default function OrderDetailPage() {
  const { orderId } = useParams() as { orderId: string };
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundMessage, setRefundMessage] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push(`/masuk?redirect=/pesanan/${orderId}`);
      return;
    }

    fetch(`${getApiBase()}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrder(data.data);
        else setError(data.error?.message ?? "Pesanan tidak ditemukan.");
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data pesanan.");
        setLoading(false);
      });
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <Link href="/pesanan" className="text-blue-600 underline">Kembali ke Pesanan</Link>
      </div>
    );
  }

  const status = STATUS_LABEL[order.status] ?? { label: order.status, color: "text-gray-500 bg-gray-50" };

  async function submitRefund(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setRefundLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: refundReason }),
      });
      const data = await res.json();
      if (data.success) {
        setRefundMessage("Permintaan refund berhasil dikirim. Tim kami akan meninjau dalam 2–3 hari kerja.");
        setRefundOpen(false);
        setRefundReason("");
      } else {
        setRefundMessage(data.error?.message ?? "Gagal mengirim permintaan refund.");
      }
    } catch {
      setRefundMessage("Terjadi kesalahan.");
    } finally {
      setRefundLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/pesanan" className="text-gray-400 hover:text-gray-600">← Pesanan</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Detail Pesanan</h1>
              <p className="text-sm text-gray-400 mt-1">
                {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(order.createdAt))}
              </p>
            </div>
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Items */}
          <div className="border-t border-gray-50 pt-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Item</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.itemTitle ?? "Item"}</span>
                  <span className="text-gray-900 font-medium">Rp {Number(item.totalPrice).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>Rp {Number(order.totalAmount).toLocaleString("id-ID")}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                <span>-Rp {Number(order.discountAmount).toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-blue-600">Rp {Number(order.finalAmount).toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Payment info */}
          {order.paidAt && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dibayar pada</span>
                <span className="text-gray-700">
                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(order.paidAt))}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Metode</span>
                  <span className="text-gray-700 uppercase">{order.paymentMethod}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            {refundMessage && (
              <p className={`text-sm rounded-xl p-3 text-center ${refundMessage.includes("berhasil") ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
                {refundMessage}
              </p>
            )}
            <div className="flex gap-3">
              {order.status === "paid" && (
                <>
                  <a
                    href={`${getApiBase()}/api/orders/${order.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Unduh Invoice
                  </a>
                  <Link
                    href="/dashboard/kursus"
                    className="flex-1 text-center px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Mulai Belajar
                  </Link>
                </>
              )}
              {order.status === "pending" && (
                <p className="text-sm text-yellow-600 bg-yellow-50 rounded-xl p-3 w-full text-center">
                  Menunggu konfirmasi pembayaran dari DOKU...
                </p>
              )}
            </div>
            {order.status === "paid" && (
              <button
                onClick={() => setRefundOpen(true)}
                className="text-sm text-gray-400 hover:text-red-500 text-center transition-colors"
              >
                Ajukan Refund
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {refundOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-2">Ajukan Refund</h2>
            <p className="text-sm text-gray-500 mb-6">
              Jelaskan alasan Anda mengajukan refund. Proses peninjauan membutuhkan 2–3 hari kerja.
            </p>
            <form onSubmit={submitRefund} className="space-y-4">
              <textarea
                required
                rows={4}
                minLength={10}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Alasan refund (minimal 10 karakter)..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRefundOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {refundLoading ? "Mengirim..." : "Kirim Permohonan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
