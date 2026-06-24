"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OrderItem = { itemTitle: string | null; itemType: string };
type Order = {
  id: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  paid: { label: "Lunas", className: "bg-green-100 text-green-700" },
  pending: { label: "Menunggu Pembayaran", className: "bg-yellow-100 text-yellow-700" },
  failed: { label: "Gagal", className: "bg-red-100 text-red-700" },
  expired: { label: "Kedaluwarsa", className: "bg-gray-100 text-gray-600" },
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("jg_token");
}

export default function PesananPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login?redirect=/pesanan");
      return;
    }

    fetch(`${getApiBase()}/api/orders?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
          <Link href="/e-course" className="text-sm text-blue-600 hover:underline">
            + Tambah Kursus
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Belum ada pesanan</h2>
            <p className="text-gray-400 mb-6">Mulai belajar dengan membeli kursus pertama Anda.</p>
            <Link href="/e-course" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Jelajahi Kursus
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_LABEL[order.status] ?? { label: order.status, className: "bg-gray-100 text-gray-600" };
              const title = order.items[0]?.itemTitle ?? "Produk";
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{title}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(order.createdAt))}
                      </p>
                      <p className="text-xs font-mono text-gray-300 mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">Rp {Number(order.finalAmount).toLocaleString("id-ID")}</p>
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <Link href={`/pesanan/${order.id}`} className="text-sm text-blue-600 hover:underline">
                      Lihat Detail
                    </Link>
                    {order.status === "paid" && (
                      <a
                        href={`${getApiBase()}/api/orders/${order.id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Unduh Invoice
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Sebelumnya
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
