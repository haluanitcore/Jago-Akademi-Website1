"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth/token";

type Event = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string | null;
  price: string;
  maxAttendees: number | null;
  registeredCount: number;
  createdAt: string;
  organizer: { name: string } | null;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Draft",        cls: "bg-gray-100 text-gray-600" },
  published: { label: "Aktif",        cls: "bg-green-100 text-green-700" },
  ongoing:   { label: "Berlangsung",  cls: "bg-blue-100 text-blue-700" },
  ended:     { label: "Selesai",      cls: "bg-purple-100 text-purple-700" },
  cancelled: { label: "Dibatalkan",   cls: "bg-red-100 text-red-700" },
};

const TYPE_LABEL: Record<string, string> = {
  seminar: "🎤 Seminar", webinar: "💻 Webinar", workshop: "🔧 Workshop", bootcamp: "⚡ Bootcamp",
};


export default function AdminEventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  function loadEvents() {
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search ? { search } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });
    setLoading(true);
    fetch(`/api/admin/events?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) { setEvents(body.data?.events ?? body.data ?? []); setTotal(body.data?.total ?? 0); }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadEvents(); }, [page, statusFilter]); // eslint-disable-line
  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); loadEvents(); }

  async function updateStatus(id: string, status: string) {
    const token = getToken();
    if (!token) return;
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadEvents();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="ev-page">
      <div className="ev-header">
        <div>
          <h1 className="ev-title">Manajemen Event</h1>
          <p className="ev-sub">{total.toLocaleString("id-ID")} event total</p>
        </div>
      </div>

      <div className="ev-filters">
        <form onSubmit={handleSearch} className="ev-search-form">
          <input className="ev-input" placeholder="Cari event..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="ev-search-btn">🔍 Cari</button>
        </form>
        <div className="ev-tabs">
          {["all", "published", "ongoing", "ended", "draft", "cancelled"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`ev-tab ${statusFilter === s ? "ev-tab-active" : ""}`}>
              {s === "all" ? "Semua" : STATUS_MAP[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ev-loading"><span className="ev-spinner" /></div>
      ) : events.length === 0 ? (
        <div className="ev-empty"><p>🎫</p><p>Tidak ada event ditemukan</p></div>
      ) : (
        <div className="ev-grid">
          {events.map((ev) => {
            const s = STATUS_MAP[ev.status] ?? STATUS_MAP["draft"]!;
            const regRate = ev.maxAttendees ? Math.round((ev.registeredCount / ev.maxAttendees) * 100) : null;
            return (
              <div key={ev.id} className="ev-card">
                <div className="ev-card-top">
                  <div>
                    <p className="ev-type">{TYPE_LABEL[ev.type] ?? ev.type}</p>
                    <p className="ev-title-text">{ev.title}</p>
                    {ev.organizer && <p className="ev-organizer">oleh {ev.organizer.name}</p>}
                  </div>
                  <span className={`ev-badge ${s.cls}`}>{s.label}</span>
                </div>

                <div className="ev-details">
                  <span>📅 {new Date(ev.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {ev.location && <span>📍 {ev.location}</span>}
                  <span>💰 {Number(ev.price) === 0 ? "Gratis" : `Rp ${Number(ev.price).toLocaleString("id-ID")}`}</span>
                </div>

                <div className="ev-reg-row">
                  <span className="ev-reg-text">
                    👥 {ev.registeredCount}{ev.maxAttendees ? `/${ev.maxAttendees}` : ""} peserta
                  </span>
                  {regRate !== null && (
                    <span className={`ev-reg-pct ${regRate >= 90 ? "ev-pct-full" : ""}`}>{regRate}%</span>
                  )}
                </div>
                {regRate !== null && (
                  <div className="ev-progress">
                    <div className="ev-progress-fill" style={{ width: `${Math.min(100, regRate)}%` }} />
                  </div>
                )}

                <div className="ev-actions">
                  {ev.status === "draft" && (
                    <button className="ev-btn ev-btn-ok" onClick={() => updateStatus(ev.id, "published")}>Publikasi</button>
                  )}
                  {ev.status === "published" && (
                    <>
                      <button className="ev-btn ev-btn-blue" onClick={() => updateStatus(ev.id, "ongoing")}>Mulai</button>
                      <button className="ev-btn ev-btn-warn" onClick={() => updateStatus(ev.id, "cancelled")}>Batalkan</button>
                    </>
                  )}
                  {ev.status === "ongoing" && (
                    <button className="ev-btn ev-btn-purple" onClick={() => updateStatus(ev.id, "ended")}>Selesai</button>
                  )}
                  {ev.status === "cancelled" && (
                    <button className="ev-btn ev-btn-ok" onClick={() => updateStatus(ev.id, "published")}>Aktifkan Lagi</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="ev-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="ev-page-btn">← Prev</button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ev-page-btn">Next →</button>
        </div>
      )}

      <style jsx>{`
        .ev-page { display:flex; flex-direction:column; gap:20px; max-width:1200px; }
        .ev-header { display:flex; align-items:center; justify-content:space-between; }
        .ev-title { font-size:20px; font-weight:800; color:#1D1D1F; }
        .ev-sub { font-size:13px; color:#6E6E73; margin-top:3px; }
        .ev-filters { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .ev-search-form { display:flex; gap:8px; flex:1; min-width:240px; }
        .ev-input { flex:1; padding:9px 14px; border-radius:10px; border:1.5px solid #E5E5EA; font-size:13px; outline:none; }
        .ev-input:focus { border-color:#0077A8; box-shadow:0 0 0 3px rgba(0,119,168,0.1); }
        .ev-search-btn { padding:9px 16px; border-radius:10px; background:#0077A8; color:white; border:none; font-size:13px; font-weight:600; cursor:pointer; }
        .ev-tabs { display:flex; gap:6px; flex-wrap:wrap; }
        .ev-tab { padding:7px 14px; border-radius:999px; font-size:12px; font-weight:600; border:1.5px solid #E5E5EA; background:white; cursor:pointer; color:#6E6E73; transition:all 0.18s; }
        .ev-tab-active { background:#0077A8; color:white; border-color:#0077A8; }
        .ev-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .ev-card { background:white; border-radius:18px; padding:20px; border:1px solid rgba(0,0,0,0.06); box-shadow:0 1px 4px rgba(0,0,0,0.06); transition:all 0.22s; }
        .ev-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.1); transform:translateY(-2px); }
        .ev-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
        .ev-type { font-size:11px; color:#0077A8; font-weight:700; margin-bottom:4px; }
        .ev-title-text { font-size:14px; font-weight:700; color:#1D1D1F; line-height:1.3; }
        .ev-organizer { font-size:11px; color:#9CA3AF; margin-top:3px; }
        .ev-badge { font-size:10px; font-weight:700; padding:3px 10px; border-radius:999px; flex-shrink:0; }
        .ev-details { display:flex; flex-wrap:wrap; gap:10px; font-size:12px; color:#6E6E73; margin-bottom:12px; }
        .ev-reg-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .ev-reg-text { font-size:12px; color:#6E6E73; }
        .ev-reg-pct { font-size:11px; font-weight:700; color:#0077A8; }
        .ev-pct-full { color:#DC2626; }
        .ev-progress { height:4px; background:#F3F4F6; border-radius:999px; overflow:hidden; margin-bottom:14px; }
        .ev-progress-fill { height:100%; background:linear-gradient(90deg,#0077A8,#CC0052); border-radius:999px; }
        .ev-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .ev-btn { padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; border:none; cursor:pointer; transition:all 0.18s; }
        .ev-btn-ok { background:#DCFCE7; color:#16A34A; }
        .ev-btn-ok:hover { background:#16A34A; color:white; }
        .ev-btn-blue { background:#DBEAFE; color:#1D4ED8; }
        .ev-btn-blue:hover { background:#1D4ED8; color:white; }
        .ev-btn-purple { background:#EDE9FE; color:#7C3AED; }
        .ev-btn-purple:hover { background:#7C3AED; color:white; }
        .ev-btn-warn { background:#FEE2E2; color:#DC2626; }
        .ev-btn-warn:hover { background:#DC2626; color:white; }
        .ev-loading { display:flex; justify-content:center; padding:48px; }
        .ev-spinner { width:32px; height:32px; border-radius:50%; border:3px solid #0077A8; border-top-color:transparent; animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .ev-empty { display:flex; flex-direction:column; align-items:center; gap:8px; padding:48px; color:#9CA3AF; font-size:14px; }
        .ev-empty p:first-child { font-size:32px; }
        .ev-pagination { display:flex; align-items:center; justify-content:center; gap:16px; font-size:13px; color:#6E6E73; }
        .ev-page-btn { padding:8px 16px; border-radius:10px; border:1.5px solid #E5E5EA; background:white; font-size:13px; font-weight:600; cursor:pointer; }
        .ev-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
        @media (max-width:768px) { .ev-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
