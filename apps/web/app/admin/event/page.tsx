"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Event = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  startDate: string;
  price: string;
  totalSold: number;
  quota: number | null;
  _count: { registrations: number };
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("jg_token");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  draft: "text-gray-600 bg-gray-100",
  published: "text-green-700 bg-green-100",
  cancelled: "text-red-600 bg-red-100",
};

const TYPE_LABEL: Record<string, string> = { online: "Online", offline: "Offline", hybrid: "Hybrid" };

type CheckInResult = { status: string; user: { name: string; email: string }; event: { title: string } };

export default function AdminEventPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketCode, setTicketCode] = useState("");
  const [checkinResult, setCheckinResult] = useState<CheckInResult | null>(null);
  const [checkinError, setCheckinError] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({
    slug: "", title: "", type: "online", status: "draft",
    startDate: "", price: "0", quota: "", speakerName: "", description: "",
  });

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/masuk"); return; }
    loadEvents(token);
  }, [router]);

  function loadEvents(token: string) {
    fetch(`${API}/api/events/admin/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (data.success) setEvents(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    const token = getToken();
    if (!token) return;
    setCheckinLoading(true);
    setCheckinError("");
    setCheckinResult(null);

    try {
      const res = await fetch(`${API}/api/events/admin/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticketCode: ticketCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckinResult(data.data);
        setTicketCode("");
      } else {
        setCheckinError(data.error ?? "Gagal check-in.");
      }
    } catch {
      setCheckinError("Terjadi kesalahan.");
    } finally {
      setCheckinLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setCreateLoading(true);
    setCreateError("");

    try {
      const res = await fetch(`${API}/api/events/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          quota: form.quota ? Number(form.quota) : undefined,
          startDate: new Date(form.startDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateOpen(false);
        setForm({ slug: "", title: "", type: "online", status: "draft", startDate: "", price: "0", quota: "", speakerName: "", description: "" });
        loadEvents(token);
      } else {
        setCreateError(data.error ?? "Gagal membuat event.");
      }
    } catch {
      setCreateError("Terjadi kesalahan.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus event ini?")) return;
    const token = getToken();
    if (!token) return;
    await fetch(`${API}/api/events/admin/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    loadEvents(token);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Event</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-violet-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-violet-700 transition-colors"
        >
          + Tambah Event
        </button>
      </div>

      {/* Quick Check-in */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">Quick Check-in (Scan QR / Input Kode)</h2>
        <form onSubmit={handleCheckin} className="flex gap-3">
          <input
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            placeholder="Kode tiket (mis. ABC12345)"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={checkinLoading}
            className="bg-violet-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {checkinLoading ? "..." : "Check-in"}
          </button>
        </form>
        {checkinError && <p className="mt-2 text-sm text-red-600">{checkinError}</p>}
        {checkinResult && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            ✅ <strong>{checkinResult.user.name}</strong> ({checkinResult.user.email}) berhasil check-in ke{" "}
            <strong>{checkinResult.event.title}</strong>
          </div>
        )}
      </div>

      {/* Events table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Belum ada event. Tambah event baru.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Judul</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipe</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Peserta</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{ev.title}</div>
                    <div className="text-xs text-gray-400">{ev.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABEL[ev.type]}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(ev.startDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[ev.status] ?? "text-gray-600 bg-gray-100"}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ev._count.registrations}{ev.quota ? ` / ${ev.quota}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/event/${ev.slug}`}
                        target="_blank"
                        className="text-xs text-violet-600 hover:underline"
                      >
                        Lihat
                      </Link>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Event Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-6">Tambah Event Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kuota</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quota}
                    onChange={(e) => setForm({ ...form, quota: e.target.value })}
                    placeholder="Opsional"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pembicara</label>
                <input
                  value={form.speakerName}
                  onChange={(e) => setForm({ ...form, speakerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {createError && <p className="text-sm text-red-600">{createError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 bg-violet-600 text-white py-2.5 rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {createLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
