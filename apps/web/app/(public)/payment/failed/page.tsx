import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Gagal</h1>
        <p className="text-gray-500 mb-8">
          Pembayaran Anda tidak dapat diproses. Silakan coba lagi atau gunakan metode pembayaran lain.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/e-course" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Coba Lagi
          </Link>
          <Link href="/pesanan" className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Lihat Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}
