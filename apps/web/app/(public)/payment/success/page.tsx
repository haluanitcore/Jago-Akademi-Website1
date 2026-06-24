"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const isMock = params.get("mock") === "1";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
        <p className="text-gray-500 mb-2">
          {isMock
            ? "Mode dev: pembayaran dikonfirmasi secara otomatis."
            : "Terima kasih! Pembayaran Anda telah berhasil dikonfirmasi."}
        </p>
        {orderId && (
          <p className="text-sm text-gray-400 mb-8">
            Order ID: <span className="font-mono font-medium text-gray-600">{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}

        <div className="bg-blue-50 rounded-2xl p-4 mb-8 text-left">
          <p className="text-sm text-blue-800 font-medium mb-2">Apa selanjutnya?</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ Akses kursus sudah aktif</li>
            <li>✓ Invoice dikirim ke email Anda</li>
            <li>✓ Mulai belajar kapan saja</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/belajar"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Mulai Belajar
          </Link>
          {orderId && (
            <Link
              href={`/pesanan/${orderId}`}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Lihat Pesanan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
