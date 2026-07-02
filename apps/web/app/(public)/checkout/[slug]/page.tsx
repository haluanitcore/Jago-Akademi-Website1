"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type CourseInfo = {
  id: string;
  title: string;
  price: number;
  coverUrl?: string;
};

type CouponResult = {
  code: string;
  discountAmount: number;
  finalAmount: number;
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("jg_token");
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=/checkout/${slug}`);
      return;
    }

    fetch(`${getApiBase()}/api/courses/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCourse(data.data);
        else setError("Kursus tidak ditemukan.");
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data kursus.");
        setLoading(false);
      });
  }, [slug, router]);

  async function applyCoupon() {
    if (!couponCode.trim() || !course) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch(`${getApiBase()}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ code: couponCode, subtotal: course.price }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupon(data.data);
      } else {
        setCouponError(data.error?.message ?? "Kupon tidak valid.");
        setCoupon(null);
      }
    } catch {
      setCouponError("Gagal memvalidasi kupon.");
    } finally {
      setValidatingCoupon(false);
    }
  }

  async function handleCheckout() {
    if (!course) return;
    setCheckingOut(true);
    setError("");
    try {
      const res = await fetch(`${getApiBase()}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          itemType: "course",
          itemId: course.id,
          couponCode: coupon?.code,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.paymentUrl;
      } else {
        setError(data.error?.message ?? "Gagal memproses checkout.");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <Link href="/e-course" className="text-blue-600 underline">Kembali ke E-Course</Link>
      </div>
    );
  }

  const finalAmount = coupon ? coupon.finalAmount : (course?.price ?? 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              <div className="flex gap-4">
                <div className="w-20 h-14 bg-blue-50 rounded-lg flex-shrink-0 overflow-hidden">
                  {course?.coverUrl ? (
                    <img src={course.coverUrl} alt={course?.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-300 text-2xl">📚</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{course?.title}</p>
                  <p className="text-sm text-gray-500 mt-1">Akses seumur hidup</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Harga kursus</span>
                  <span>Rp {course?.price.toLocaleString("id-ID")}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon ({coupon.code})</span>
                    <span>-Rp {coupon.discountAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Pembayaran</span>
                  <span className="text-blue-600">Rp {finalAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Kode Kupon</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode kupon"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={applyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl disabled:opacity-50 hover:bg-gray-800 transition-colors"
                >
                  {validatingCoupon ? "..." : "Terapkan"}
                </button>
              </div>
              {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
              {coupon && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Kupon berhasil diterapkan! Hemat Rp {coupon.discountAmount.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>

          {/* Payment Action */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500">Total yang harus dibayar</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  Rp {finalAmount.toLocaleString("id-ID")}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {checkingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Pembayaran diproses dengan aman melalui DOKU
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Dengan melanjutkan, Anda menyetujui{" "}
                  <Link href="/syarat" className="text-blue-600 hover:underline">
                    Syarat & Ketentuan
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
