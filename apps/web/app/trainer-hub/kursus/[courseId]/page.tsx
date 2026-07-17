"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getValidToken } from "@/lib/auth/token";

type LessonStat = {
  lessonId: string;
  title: string;
  sectionTitle: string;
  avgWatchPct: number;
  completedCount: number;
  dropOffRate: number;
};

type Analytics = {
  courseId: string;
  title: string;
  totalLessons: number;
  totalEnrollments: number;
  completedCount: number;
  completionRate: number;
  grossRevenue: number;
  netRevenue: number;
  avgRating: number;
  reviewCount: number;
  adminFeedback: string | null;
  liveZoomLink: string | null;
  liveSchedule: string | null;
  status: string;
  lessons: LessonStat[];
};

export default function CourseAnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Live session states
  const [zoomLink, setZoomLink] = useState("");
  const [schedule, setSchedule] = useState("");
  const [savingLive, setSavingLive] = useState(false);

  // Status archiving states
  const [status, setStatus] = useState("draft");
  const [savingStatus, setSavingStatus] = useState(false);

  async function loadData() {
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    try {
      const r = await fetch(`/api/trainer/courses/${courseId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) {
        setData(d.data);
        setZoomLink(d.data.liveZoomLink ?? "");
        setSchedule(d.data.liveSchedule ? d.data.liveSchedule.slice(0, 16) : "");
        setStatus(d.data.status);
      } else {
        setError(d.error?.message ?? "Gagal memuat data.");
      }
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [courseId, router]);

  async function handleSaveLive() {
    const token = await getValidToken();
    if (!token) return;
    setSavingLive(true);
    try {
      const res = await fetch(`/api/trainer/courses/${courseId}/live`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          liveZoomLink: zoomLink || null,
          liveSchedule: schedule || null,
        }),
      });
      const body = await res.json();
      if (body.success) {
        alert("Jadwal sesi live berhasil diperbarui.");
        loadData();
      } else {
        alert(body.error?.message ?? "Gagal menyimpan.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setSavingLive(false);
    }
  }

  async function handleToggleArchive() {
    const token = await getValidToken();
    if (!token) return;
    const nextStatus = status === "archived" ? "published" : "archived";
    if (!confirm(`Apakah Anda yakin ingin mengubah status kursus ini menjadi ${nextStatus === "archived" ? "Archived (Nonaktif Penjualan)" : "Aktif Penjualan"}?`)) return;

    setSavingStatus(true);
    try {
      const res = await fetch(`/api/trainer/courses/${courseId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = await res.json();
      if (body.success) {
        setStatus(nextStatus);
        alert(`Kursus berhasil ${nextStatus === "archived" ? "dinonaktifkan (diarsipkan)" : "diaktifkan kembali"}.`);
        loadData();
      } else {
        alert(body.error?.message ?? "Gagal mengubah status.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setSavingStatus(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Memuat...</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Data tidak ditemukan."}</div>;

  const metrics = [
    { label: "Total Pelajaran", value: data.totalLessons },
    { label: "Total Peserta", value: data.totalEnrollments.toLocaleString("id-ID") },
    { label: "Completion Rate", value: `${data.completionRate}%` },
    { label: "Rating Rata-rata", value: data.avgRating > 0 ? `⭐ ${data.avgRating.toFixed(1)} (${data.reviewCount})` : "Belum ada" },
    { label: "Pendapatan Kotor", value: `Rp ${data.grossRevenue.toLocaleString("id-ID")}` },
    { label: "Pendapatan Bersih (70%)", value: `Rp ${data.netRevenue.toLocaleString("id-ID")}`, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-12">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <Link href="/trainer-hub" className="text-[#0077A8] hover:underline">Trainer Hub</Link>
              <span className="text-[#6E6E73]">/</span>
              <Link href="/trainer-hub/kursus" className="text-[#0077A8] hover:underline">Kursus</Link>
              <span className="text-[#6E6E73]">/</span>
              <span className="text-[#1D1D1F] font-medium">Analitik</span>
            </div>
            <h1 className="text-xl font-bold text-[#1D1D1F] mt-1">{data.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              status === "published" ? "bg-green-100 text-green-700" : 
              status === "archived" ? "bg-red-100 text-red-700" : 
              status === "pending" ? "bg-yellow-100 text-yellow-700" : 
              status === "rejected" ? "bg-rose-100 text-rose-700" : 
              "bg-gray-100 text-gray-700"
            }`}>
              {
                status === "published" ? "Aktif Penjualan" : 
                status === "archived" ? "Archived (Off)" : 
                status === "pending" ? "Menunggu Peninjauan" : 
                status === "rejected" ? "Ditolak (Butuh Revisi)" : 
                "Draft"
              }
            </span>
            {(status === "draft" || status === "rejected") && (
              <button
                onClick={async () => {
                  if (!confirm("Apakah Anda yakin ingin mengajukan kelas ini ke admin untuk direview? Setelah diajukan, status akan berubah menjadi Menunggu Peninjauan.")) return;
                  setSavingStatus(true);
                  try {
                    const token = await getValidToken();
                    const res = await fetch(`/api/trainer/courses/${courseId}/status`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ status: "pending" }),
                    });
                    const body = await res.json();
                    if (body.success) {
                      setStatus("pending");
                      alert("Kelas berhasil diajukan untuk ditinjau oleh Admin.");
                      loadData();
                    } else {
                      alert(body.error?.message ?? "Gagal mengajukan review.");
                    }
                  } catch {
                    alert("Gagal menghubungi server.");
                  } finally {
                    setSavingStatus(false);
                  }
                }}
                disabled={savingStatus}
                className="px-4 py-2 bg-[#0077A8] hover:bg-[#005f87] text-sm text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {savingStatus ? "Mengajukan..." : "🚀 Ajukan Review"}
              </button>
            )}
            <button
              onClick={handleToggleArchive}
              disabled={savingStatus || status === "draft" || status === "pending" || status === "rejected"}
              className="px-4 py-2 bg-white border border-[#E5E5EA] text-sm text-[#1D1D1F] font-semibold rounded-xl hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
            >
              {savingStatus ? "Memproses..." : status === "archived" ? "Aktifkan Penjualan" : "Nonaktifkan (Archive)"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Rejection Alert Warning */}
        {(data.status === "draft" || data.status === "rejected") && data.adminFeedback && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Umpan Balik Penolakan Kelas dari Admin:</p>
                <p className="text-sm text-amber-700 mt-1 whitespace-pre-wrap">{data.adminFeedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {metrics.map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-2xl border p-5 ${highlight ? "bg-[#0077A8] border-[#0077A8]" : "bg-white border-[#E5E5EA]"}`}>
              <div className={`text-xs font-medium mb-2 ${highlight ? "text-blue-100" : "text-[#6E6E73]"}`}>{label}</div>
              <div className={`text-xl font-bold ${highlight ? "text-white" : "text-[#1D1D1F]"}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* 2-col Grid: Completion Info + Zoom Live Session Setup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Progress Completion */}
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-[#1D1D1F] mb-4">Progress Completion</h2>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#6E6E73]">{data.completedCount} dari {data.totalEnrollments} peserta menyelesaikan kursus</span>
                <span className="font-semibold text-[#1D1D1F]">{data.completionRate}%</span>
              </div>
            </div>
            <div className="bg-[#E5E5EA] rounded-full h-3 overflow-hidden mt-4">
              <div className="bg-[#0077A8] h-3 rounded-full transition-all" style={{ width: `${data.completionRate}%` }} />
            </div>
          </div>

          {/* Zoom Schedule Module */}
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
            <h2 className="font-semibold text-[#1D1D1F] mb-4">Sesi Live (Zoom)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1">Link URL Zoom Sesi Live</label>
                <input
                  type="text"
                  placeholder="https://zoom.us/j/..."
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5EA] rounded-xl text-sm outline-none focus:border-[#0077A8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1">Jadwal Sesi Live</label>
                <input
                  type="datetime-local"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5EA] rounded-xl text-sm outline-none focus:border-[#0077A8]"
                />
              </div>
              <button
                onClick={handleSaveLive}
                disabled={savingLive}
                className="w-full py-2 bg-[#0077A8] hover:bg-[#005f87] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {savingLive ? "Menyimpan..." : "Simpan Sesi Live"}
              </button>
            </div>
          </div>
        </div>

        {/* Watch Time & Drop-off Stats per Lesson */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 overflow-hidden">
          <h2 className="font-semibold text-[#1D1D1F] mb-4">Analitik Drop-Off & Durasi Tontonan Pelajaran</h2>
          
          {data.lessons.length === 0 ? (
            <p className="text-sm text-[#6E6E73] py-4 text-center">Belum ada data materi untuk kursus ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E5E5EA] text-[#6E6E73] text-xs uppercase font-semibold">
                    <th className="py-3 px-4">Materi Pelajaran</th>
                    <th className="py-3 px-4">Modul / Seksi</th>
                    <th className="py-3 px-4 text-center">Avg Watch Time</th>
                    <th className="py-3 px-4 text-center">Selesai (User)</th>
                    <th className="py-3 px-4 text-center">Tingkat Drop-off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F7]">
                  {data.lessons.map((les) => (
                    <tr key={les.lessonId} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-4 font-medium text-[#1D1D1F]">{les.title}</td>
                      <td className="py-3 px-4 text-[#6E6E73]">{les.sectionTitle}</td>
                      <td className="py-3 px-4 text-center font-semibold text-[#0077A8]">{Math.round(les.avgWatchPct)}%</td>
                      <td className="py-3 px-4 text-center text-[#1D1D1F]">{les.completedCount}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${les.dropOffRate > 50 ? "bg-red-50 text-red-600" : les.dropOffRate > 25 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
                          {les.dropOffRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
