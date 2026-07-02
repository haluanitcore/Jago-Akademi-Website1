"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type EventDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  venue: string | null;
  price: string;
  salePrice: string | null;
  quota: number | null;
  totalSold: number;
  coverUrl: string | null;
  speakerName: string | null;
  speakerBio: string | null;
  isFeatured: boolean;
};

type Registration = {
  id: string;
  status: string;
  ticketCode: string;
} | null;

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("jg_token");
}

function formatPrice(price: string, salePrice: string | null) {
  const num = salePrice ? Number(salePrice) : Number(price);
  if (num === 0) return "Gratis";
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_LABEL: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

export default function EventDetailPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [registration, setRegistration] = useState<Registration>(undefined as never);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/api/events/${slug}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setEvent(data.data);
        else setError("Event tidak ditemukan.");
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat event.");
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    const token = getToken();
    if (!token || !event) return;

    fetch(`${API}/api/events/${slug}/registration`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRegistration(data.data);
      })
      .catch(() => {});
  }, [slug, event]);

  async function handleRegister() {
    const token = getToken();
    if (!token) {
      router.push(`/masuk?redirect=/event/${slug}`);
      return;
    }

    if (!event) return;
    const price = event.salePrice ? Number(event.salePrice) : Number(event.price);

    if (price === 0) {
      // Free — call checkout which will register immediately
      setRegisterLoading(true);
      try {
        const res = await fetch(`${API}/api/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ itemType: "event", itemId: event.id }),
        });
        const data = await res.json();
        if (data.success && data.data.free) {
          setMessage("Berhasil mendaftar! Tiket Anda ada di dashboard.");
          setRegistration({ id: "new", status: "confirmed", ticketCode: "" });
        } else {
          setError(data.error ?? "Gagal mendaftar.");
        }
      } catch {
        setError("Terjadi kesalahan.");
      } finally {
        setRegisterLoading(false);
      }
    } else {
      // Paid — go to checkout
      router.push(`/checkout/${event.slug}?type=event&itemId=${event.id}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Memuat event...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error}</p>
        <Link href="/event" className="text-violet-600 hover:underline">← Kembali ke daftar event</Link>
      </div>
    );
  }

  if (!event) return null;

  const displayPrice = event.salePrice ? Number(event.salePrice) : Number(event.price);
  const spotsLeft = event.quota ? event.quota - event.totalSold : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isRegistered = registration != null && registration !== undefined;

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      <div className="aspect-video max-h-72 bg-gradient-to-br from-violet-100 to-purple-200 overflow-hidden">
        {event.coverUrl ? (
          <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🎤</div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium">
                {TYPE_LABEL[event.type] ?? event.type}
              </span>
              {event.isFeatured && (
                <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                  ⭐ Featured
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>📅 {formatDate(event.startDate)}</p>
              {event.endDate && <p>⏰ Selesai: {formatDate(event.endDate)}</p>}
              {event.type !== "online" && event.venue && <p>📍 {event.venue}</p>}
              {event.type !== "online" && event.location && <p>🗺️ {event.location}</p>}
            </div>

            {event.description && (
              <div className="prose prose-sm max-w-none text-gray-700 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Tentang Event</h2>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {event.speakerName && (
              <div className="bg-violet-50 rounded-2xl p-6 mb-6">
                <h2 className="font-semibold text-gray-900 mb-1">Pembicara</h2>
                <p className="font-medium text-violet-700">🎙️ {event.speakerName}</p>
                {event.speakerBio && (
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{event.speakerBio}</p>
                )}
              </div>
            )}
          </div>

          {/* Booking card */}
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                {event.salePrice && (
                  <p className="text-sm text-gray-400 line-through">
                    Rp {Number(event.price).toLocaleString("id-ID")}
                  </p>
                )}
                <p className="text-2xl font-bold text-violet-600">
                  {formatPrice(event.price, event.salePrice)}
                </p>
              </div>

              {spotsLeft !== null && (
                <p className="text-sm text-gray-500 mb-4">
                  {isFull ? "Kapasitas penuh" : `${spotsLeft} tempat tersisa`}
                </p>
              )}

              {message && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              {isRegistered ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-green-600 font-medium mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sudah Terdaftar
                  </div>
                  <Link
                    href="/dashboard/tiket"
                    className="block w-full text-center bg-violet-50 text-violet-700 py-2.5 rounded-xl font-medium hover:bg-violet-100 transition-colors"
                  >
                    Lihat Tiket Saya
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isFull || registerLoading}
                  className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {registerLoading
                    ? "Memproses..."
                    : isFull
                    ? "Kapasitas Penuh"
                    : displayPrice === 0
                    ? "Daftar Gratis"
                    : "Beli Tiket"}
                </button>
              )}

              <Link href="/event" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
                ← Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
