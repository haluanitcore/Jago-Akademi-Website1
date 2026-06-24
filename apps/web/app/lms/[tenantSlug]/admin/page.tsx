"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type TenantStat = {
  id: string;
  name: string;
  slug: string;
  _count: { batches: number; courses: number; enrollments: number; invites: number };
};

export default function LmsAdminDashboardPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [stat, setStat] = useState<TenantStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStat = async () => {
      const meRes = await fetch("/api/lms/portal/me");
      const meData = await meRes.json();
      const myTenant = meData.data?.find((t: { slug: string; id: string }) => t.slug === tenantSlug);
      if (!myTenant) { setLoading(false); return; }
      const detailRes = await fetch(`/api/lms/tenants/${myTenant.id}`);
      const detailData = await detailRes.json();
      if (detailData.success) setStat(detailData.data);
      setLoading(false);
    };
    fetchStat();
  }, [tenantSlug]);

  if (loading) return <div className="p-6 text-center text-[#6E6E73]">Memuat...</div>;
  if (!stat) return <div className="p-6 text-center text-red-500">Tidak ada akses atau tenant tidak ditemukan.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">{stat.name} — Admin LMS</h1>
      <p className="text-sm text-[#6E6E73] mb-8">Kelola pembelajaran, peserta, dan laporan organisasi Anda.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Batch Aktif", value: stat._count.batches },
          { label: "Kursus LMS", value: stat._count.courses },
          { label: "Enrollment", value: stat._count.enrollments },
          { label: "Undangan", value: stat._count.invites },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E5E5EA] rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-[#1D1D1F]">{value}</div>
            <div className="text-xs text-[#6E6E73] mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Manajemen Batch & Undangan", desc: "Buat batch, undang peserta via email", href: `/lms/${tenantSlug}/admin/batches`, color: "bg-blue-50 border-blue-200" },
          { label: "Course Builder", desc: "Buat kursus, tambah pelajaran, dan kuis", href: `/lms/${tenantSlug}/admin/courses`, color: "bg-purple-50 border-purple-200" },
          { label: "Laporan Completion", desc: "Pantau progres peserta & unduh laporan", href: `/lms/${tenantSlug}/admin/reports`, color: "bg-green-50 border-green-200" },
        ].map(({ label, desc, href, color }) => (
          <Link key={href} href={href} className={`border rounded-2xl p-5 hover:shadow-md transition-all ${color}`}>
            <h3 className="font-semibold text-[#1D1D1F] mb-1">{label}</h3>
            <p className="text-xs text-[#6E6E73]">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[#E5E5EA]">
        <Link href={`/lms/${tenantSlug}`} className="text-sm text-[#0077A8] hover:underline">
          ← Lihat Portal Peserta
        </Link>
      </div>
    </div>
  );
}
