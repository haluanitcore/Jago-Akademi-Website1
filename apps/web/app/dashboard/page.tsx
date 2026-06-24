"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDashboard, type DashboardData } from "../../lib/api/enrollment";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.replace("/masuk");
      return;
    }
    getDashboard(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-[#0077A8] border-t-transparent animate-spin" aria-label="Memuat…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-[#1D1D1F] font-semibold">Gagal memuat dashboard</p>
          <p className="text-sm text-[#6E6E73]">{error}</p>
          <button onClick={() => router.refresh()} className="btn-primary px-4 py-2 text-sm">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { stats, enrollments, recentCertificates } = data;

  return (
    <main id="main-content" className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1D1D1F]">Dashboard Saya</h1>
            <p className="text-sm text-[#6E6E73]">Pantau progres belajar Anda</p>
          </div>
          <Link href="/dashboard/profil" className="text-sm text-[#0077A8] hover:underline font-medium">
            Edit Profil
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Terdaftar", value: stats.totalEnrolled, color: "text-[#0077A8]" },
            { label: "Sedang Belajar", value: stats.totalInProgress, color: "text-[#F59E0B]" },
            { label: "Selesai", value: stats.totalCompleted, color: "text-green-600" },
            { label: "Sertifikat", value: stats.totalCertificates, color: "text-[#CC0052]" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E5EA]">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-[#6E6E73] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Enrolled courses */}
        <section>
          <h2 className="text-lg font-bold text-[#1D1D1F] mb-4">Kursus Saya</h2>
          {enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#E5E5EA]">
              <p className="text-[#6E6E73] mb-4">Belum ada kursus yang diikuti.</p>
              <Link href="/e-course" className="btn-primary px-6 py-2 text-sm">
                Jelajahi Kursus
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((e) => {
                const pct = Number(e.progressPct);
                return (
                  <Link
                    key={e.id}
                    href={`/belajar/${e.course.slug}`}
                    className="bg-white rounded-2xl overflow-hidden border border-[#E5E5EA] shadow-sm hover:shadow-md transition-shadow group"
                  >
                    {e.course.thumbnailUrl ? (
                      <img
                        src={e.course.thumbnailUrl}
                        alt={e.course.title}
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-[#0077A8] to-[#CC0052]" />
                    )}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="font-semibold text-[#1D1D1F] leading-tight group-hover:text-[#0077A8] transition-colors line-clamp-2">
                          {e.course.title}
                        </p>
                        {e.course.trainer && (
                          <p className="text-xs text-[#6E6E73] mt-1">{e.course.trainer.name}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-[#6E6E73] mb-1">
                          <span>Progres</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0077A8] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      {e.isCompleted && (
                        <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Selesai
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent certificates */}
        {recentCertificates.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#1D1D1F] mb-4">Sertifikat Terbaru</h2>
            <div className="space-y-3">
              {recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-xl border border-[#E5E5EA] px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-[#1D1D1F] text-sm">{cert.course.title}</p>
                    <p className="text-xs text-[#6E6E73] mt-0.5">
                      {new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/verify/${cert.code}`} className="text-xs text-[#0077A8] hover:underline font-medium">
                      Verifikasi
                    </Link>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/certificates/${cert.code}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#0077A8] text-white hover:bg-[#005f87] transition-colors font-medium"
                    >
                      Unduh PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
