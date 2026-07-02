"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type EventInfo = {
  id: string;
  slug: string;
  title: string;
  type: string;
  startDate: string;
  location: string | null;
  venue: string | null;
  coverUrl: string | null;
};

type Registration = {
  id: string;
  eventId: string;
  ticketCode: string;
  status: string;
  attendedAt: string | null;
  createdAt: string;
  event: EventInfo;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("jg_token");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu", color: "text-yellow-600 bg-yellow-50" },
  confirmed: { label: "Terkonfirmasi", color: "text-green-600 bg-green-50" },
  cancelled: { label: "Dibatalkan", color: "text-red-600 bg-red-50" },
  attended: { label: "Hadir", color: "text-blue-600 bg-blue-50" },
};

const TYPE_LABEL: Record<string, string> = { online: "Online", offline: "Offline", hybrid: "Hybrid" };

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/masuk?redirect=/dashboard/tiket");
      return;
    }

    fetch(`${API}/api/events/my/tickets`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTickets(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tiket Saya</h1>
        <Link href="/event" className="text-sm text-violet-600 hover:underline">
          Jelajahi Event →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-28" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🎫</div>
          <p className="text-lg mb-2">Belum ada tiket</p>
          <p className="text-sm mb-6">Daftar event untuk mendapatkan tiket pertama Anda.</p>
          <Link
            href="/event"
            className="inline-block bg-violet-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            Lihat Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const statusInfo = STATUS_LABEL[ticket.status] ?? { label: ticket.status, color: "text-gray-600 bg-gray-50" };
            return (
              <div key={ticket.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex">
                {/* Color strip */}
                <div className="w-2 bg-violet-600 shrink-0" />

                {/* Cover thumbnail */}
                <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center m-4 rounded-xl overflow-hidden">
                  {ticket.event.coverUrl ? (
                    <img src={ticket.event.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🎤</span>
                  )}
                </div>

                <div className="flex-1 py-4 pr-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/event/${ticket.event.slug}`}
                        className="font-semibold text-gray-900 hover:text-violet-600 transition-colors line-clamp-1"
                      >
                        {ticket.event.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {TYPE_LABEL[ticket.event.type]} · {formatDate(ticket.event.startDate)}
                      </p>
                      {ticket.event.type !== "online" && ticket.event.venue && (
                        <p className="text-xs text-gray-400 mt-0.5">📍 {ticket.event.venue}</p>
                      )}
                    </div>
                    <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="bg-gray-50 rounded-lg px-3 py-1.5 font-mono text-xs text-gray-700 tracking-wider">
                      {ticket.ticketCode.slice(0, 8).toUpperCase()}
                    </div>
                    {ticket.attendedAt && (
                      <span className="text-xs text-blue-600">✓ Hadir {formatDate(ticket.attendedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
