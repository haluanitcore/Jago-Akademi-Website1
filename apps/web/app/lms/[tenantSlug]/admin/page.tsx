"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getValidToken } from "@/lib/auth/token";

type TenantStat = {
  id: string;
  name: string;
  slug: string;
  _count: { batches: number; courses: number; enrollments: number; invites: number };
};

export default function LmsAdminDashboardPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const router = useRouter();
  const [stat, setStat] = useState<TenantStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStat = async () => {
      const token = await getValidToken();
      if (!token) { router.replace("/masuk"); return; }
      const authHeaders = { Authorization: `Bearer ${token}` };
      const meRes = await fetch("/api/lms/portal/me", { headers: authHeaders });
      const meData = await meRes.json();
      const myTenant = meData.data?.find((t: { slug: string; id: string }) => t.slug === tenantSlug);
      if (!myTenant) { setLoading(false); return; }
      const detailRes = await fetch(`/api/lms/tenants/${myTenant.id}`, { headers: authHeaders });
      const detailData = await detailRes.json();
      if (detailData.success) setStat(detailData.data);
      setLoading(false);
    };
    fetchStat();
  }, [tenantSlug, router]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Batch & Peserta", desc: "Buat batch, undang peserta via email, import CSV", href: `/lms/${tenantSlug}/admin/batches`, color: "bg-blue-50 border-blue-200", icon: "👥" },
          { label: "Course Builder", desc: "Buat kursus, tambah pelajaran, dan kuis", href: `/lms/${tenantSlug}/admin/courses`, color: "bg-purple-50 border-purple-200", icon: "📚" },
          { label: "Laporan Completion", desc: "Pantau progres peserta, unduh CSV & PDF", href: `/lms/${tenantSlug}/admin/reports`, color: "bg-green-50 border-green-200", icon: "📈" },
          { label: "Pengaturan Workspace", desc: "Logo, warna brand, domain kustom", href: `/lms/${tenantSlug}/admin/settings`, color: "bg-amber-50 border-amber-200", icon: "⚙️" },
        ].map(({ label, desc, href, color, icon }) => (
          <Link key={href} href={href} className={`border rounded-2xl p-5 hover:shadow-md transition-all flex items-start gap-3 ${color}`}>
            <span className="text-2xl mt-0.5">{icon}</span>
            <div>
              <h3 className="font-semibold text-[#1D1D1F] mb-1">{label}</h3>
              <p className="text-xs text-[#6E6E73]">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
