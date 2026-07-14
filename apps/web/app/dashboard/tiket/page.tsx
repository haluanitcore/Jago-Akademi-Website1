"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth/token";

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

const API = ""; // Relative path → Next.js proxy → backend


function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_INFO: Record<string, { label: string; class: string; icon: string }> = {
  pending:   { label: "Menunggu",       class: "tk-status-pending",   icon: "⏳" },
  confirmed: { label: "Terkonfirmasi",  class: "tk-status-confirmed", icon: "✅" },
  cancelled: { label: "Dibatalkan",     class: "tk-status-cancelled", icon: "❌" },
  attended:  { label: "Hadir",          class: "tk-status-attended",  icon: "🎉" },
};

const TYPE_LABEL: Record<string, string> = { online: "🌐 Online", offline: "📍 Offline", hybrid: "🔀 Hybrid" };

export default function TiketPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/masuk?redirect=/dashboard/tiket"); return; }

    fetch(`${API}/api/events/my/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTickets(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="tk-loading"><span className="tk-spinner" /></div>;
  }

  return (
    <div className="tk-page">
      <div className="tk-header">
        <div>
          <h1 className="tk-title">Tiket Event Saya</h1>
          <p className="tk-subtitle">{tickets.length} tiket terdaftar</p>
        </div>
        <Link href="/event" className="tk-browse-btn">🗓 Jelajahi Event</Link>
      </div>

      {tickets.length === 0 ? (
        <div className="tk-empty">
          <div className="tk-empty-art">🎫</div>
          <h2 className="tk-empty-title">Belum ada tiket</h2>
          <p className="tk-empty-desc">Daftar event untuk mendapatkan tiket pertama Anda.</p>
          <Link href="/event" className="tk-empty-cta">Lihat Event Tersedia</Link>
        </div>
      ) : (
        <div className="tk-list">
          {tickets.map((ticket) => {
            const statusInfo = STATUS_INFO[ticket.status] ?? { label: ticket.status, class: "tk-status-pending", icon: "ℹ️" };
            const isOnline = ticket.event.type === "online";

            return (
              <div key={ticket.id} className="tk-card">
                {/* Left accent */}
                <div className={`tk-accent ${ticket.status === "confirmed" || ticket.status === "attended" ? "tk-accent-green" : "tk-accent-blue"}`} />

                {/* Cover */}
                <div className="tk-cover">
                  {ticket.event.coverUrl ? (
                    <img src={ticket.event.coverUrl} alt="" className="tk-cover-img" />
                  ) : (
                    <div className="tk-cover-placeholder">
                      <span>{isOnline ? "🌐" : "📍"}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="tk-info">
                  <div className="tk-info-top">
                    <div>
                      <Link href={`/event/${ticket.event.slug}`} className="tk-event-title">
                        {ticket.event.title}
                      </Link>
                      <p className="tk-event-meta">
                        {TYPE_LABEL[ticket.event.type]} · {formatDate(ticket.event.startDate)}
                      </p>
                      {!isOnline && ticket.event.venue && (
                        <p className="tk-event-venue">📍 {ticket.event.venue}</p>
                      )}
                    </div>
                    <span className={`tk-status-badge ${statusInfo.class}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>

                  <div className="tk-info-bottom">
                    <div className="tk-ticket-code">
                      <span className="tk-code-label">Kode Tiket</span>
                      <code className="tk-code-val">{ticket.ticketCode.slice(0, 8).toUpperCase()}</code>
                    </div>
                    {ticket.attendedAt && (
                      <span className="tk-attended">✓ Hadir: {formatDate(ticket.attendedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .tk-page { display: flex; flex-direction: column; gap: 20px; }
        .tk-loading { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
        .tk-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .tk-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .tk-title { font-size: 22px; font-weight: 800; color: #1D1D1F; }
        .tk-subtitle { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .tk-browse-btn {
          padding: 10px 20px; background: linear-gradient(135deg, #7C3AED, #a855f7);
          color: white; border-radius: 10px; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: opacity 0.2s;
        }
        .tk-browse-btn:hover { opacity: 0.85; }

        .tk-empty {
          background: white; border-radius: 20px; padding: 64px 32px;
          text-align: center; border: 1px dashed #E5E5EA;
        }
        .tk-empty-art { font-size: 64px; margin-bottom: 20px; }
        .tk-empty-title { font-size: 18px; font-weight: 700; color: #1D1D1F; margin-bottom: 10px; }
        .tk-empty-desc { font-size: 14px; color: #6E6E73; margin-bottom: 24px; }
        .tk-empty-cta {
          display: inline-block; padding: 12px 28px;
          background: linear-gradient(135deg, #7C3AED, #a855f7);
          color: white; border-radius: 12px;
          font-size: 14px; font-weight: 600; text-decoration: none;
        }

        .tk-list { display: flex; flex-direction: column; gap: 12px; }

        .tk-card {
          background: white; border-radius: 16px; overflow: hidden;
          display: flex; align-items: stretch;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.22s;
        }
        .tk-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

        .tk-accent { width: 5px; flex-shrink: 0; }
        .tk-accent-green { background: linear-gradient(180deg, #22C55E, #16A34A); }
        .tk-accent-blue  { background: linear-gradient(180deg, #0077A8, #00a8d9); }

        .tk-cover {
          width: 80px; height: 80px; flex-shrink: 0;
          margin: 14px; border-radius: 12px; overflow: hidden;
          background: linear-gradient(135deg, #7C3AED20, #a855f720);
          display: flex; align-items: center; justify-content: center;
        }
        .tk-cover-img { width: 100%; height: 100%; object-fit: cover; }
        .tk-cover-placeholder { font-size: 28px; }

        .tk-info { flex: 1; padding: 14px 18px 14px 0; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
        .tk-info-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }

        .tk-event-title {
          font-size: 14px; font-weight: 700; color: #1D1D1F;
          text-decoration: none; display: block; margin-bottom: 4px;
          transition: color 0.15s;
        }
        .tk-event-title:hover { color: #0077A8; }
        .tk-event-meta { font-size: 12px; color: #6E6E73; }
        .tk-event-venue { font-size: 11px; color: #9CA3AF; margin-top: 2px; }

        .tk-status-badge {
          font-size: 11px; font-weight: 700; padding: 4px 12px;
          border-radius: 999px; white-space: nowrap; flex-shrink: 0;
        }
        .tk-status-pending   { background: #FEF9C3; color: #CA8A04; }
        .tk-status-confirmed { background: #DCFCE7; color: #16A34A; }
        .tk-status-cancelled { background: #FEE2E2; color: #DC2626; }
        .tk-status-attended  { background: #DBEAFE; color: #1D4ED8; }

        .tk-info-bottom { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .tk-ticket-code {
          background: #F5F5F7; border-radius: 8px;
          padding: 6px 12px; display: flex; flex-direction: column; gap: 1px;
        }
        .tk-code-label { font-size: 9px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .tk-code-val { font-size: 13px; font-weight: 800; color: #1D1D1F; font-family: monospace; letter-spacing: 0.05em; }
        .tk-attended { font-size: 11px; color: #1D4ED8; font-weight: 600; }

        @media (max-width: 640px) {
          .tk-cover { display: none; }
          .tk-info { padding-left: 14px; }
        }
      `}</style>
    </div>
  );
}
