"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type CourseProgress = {
  courseId: string;
  courseTitle: string;
  description: string | null;
  totalLessons: number;
  completedLessons: number;
  completionPct: number;
  isCompleted: boolean;
  enrolledAt: string;
  certificate: { issuedAt: string } | null;
};

export default function LmsPortalHomePage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const meRes = await fetch("/api/lms/portal/me");
      const meData = await meRes.json();
      const myTenant = meData.data?.find((t: { slug: string; name: string }) => t.slug === tenantSlug);
      if (myTenant) setTenantName(myTenant.name);

      const res = await fetch(`/api/lms/portal/${tenantSlug}/courses`);
      const data = await res.json();
      setCourses(data.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, [tenantSlug]);

  const completedCount = courses.filter((c) => c.isCompleted).length;
  const avgPct = courses.length > 0
    ? Math.round(courses.reduce((s, c) => s + c.completionPct, 0) / courses.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-[#0077A8]">{tenantName || tenantSlug}</span>
          <span className="text-sm text-[#6E6E73] ml-2">LMS Portal</span>
        </div>
        <Link href={`/lms/${tenantSlug}/certificates`} className="text-xs text-[#0077A8] hover:underline">
          Sertifikat Saya →
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-bold text-[#1D1D1F] mb-1">Halo! Selamat belajar 👋</h1>
        <p className="text-sm text-[#6E6E73] mb-6">
          {completedCount} dari {courses.length} kursus selesai · Rata-rata {avgPct}% progress
        </p>

        {loading ? (
          <div className="text-center py-12 text-[#6E6E73]">Memuat kursus...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E5EA]">
            <p className="text-[#6E6E73]">Kamu belum terdaftar di kursus apapun.</p>
            <p className="text-xs text-[#6E6E73] mt-1">Hubungi admin untuk mendapatkan undangan.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((c) => (
              <Link
                key={c.courseId}
                href={`/lms/${tenantSlug}/courses/${c.courseId}`}
                className="bg-white border border-[#E5E5EA] rounded-2xl p-5 hover:shadow-md transition-all block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1D1D1F]">{c.courseTitle}</h3>
                      {c.isCompleted && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">✓ Selesai</span>
                      )}
                    </div>
                    {c.description && <p className="text-xs text-[#6E6E73] mt-1 line-clamp-2">{c.description}</p>}
                  </div>
                  {c.certificate && (
                    <span className="ml-3 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
                      🏆 Sertifikat
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#E5E5EA] rounded-full h-2">
                    <div
                      className="bg-[#0077A8] h-2 rounded-full transition-all"
                      style={{ width: `${c.completionPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#6E6E73] w-20 text-right">
                    {c.completedLessons}/{c.totalLessons} pelajaran
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
