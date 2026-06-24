"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type LmsCert = {
  id: string;
  courseTitle: string;
  issuedAt: string;
  tenantId: string;
  userId: string;
};

export default function LmsCertificatesPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [certs, setCerts] = useState<LmsCert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lms/portal/${tenantSlug}/certificates`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCerts(d.data); })
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/lms/${tenantSlug}`} className="text-[#0077A8] hover:underline">Portal</Link>
          <span className="text-[#6E6E73]">/</span>
          <span className="text-[#1D1D1F] font-medium">Sertifikat Saya</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-bold text-[#1D1D1F] mb-6">Sertifikat Penyelesaian</h1>

        {loading ? (
          <div className="text-center py-12 text-[#6E6E73]">Memuat...</div>
        ) : certs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E5EA]">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-[#6E6E73]">Belum ada sertifikat.</p>
            <p className="text-xs text-[#6E6E73] mt-1">Selesaikan semua pelajaran dalam sebuah kursus untuk mendapatkan sertifikat.</p>
            <Link href={`/lms/${tenantSlug}`} className="mt-4 inline-block text-sm text-[#0077A8] hover:underline">
              Kembali ke daftar kursus →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {certs.map((cert) => (
              <div key={cert.id} className="bg-white border border-[#E5E5EA] rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">🏆</div>
                  <div>
                    <h3 className="font-semibold text-[#1D1D1F]">{cert.courseTitle}</h3>
                    <p className="text-xs text-[#6E6E73] mt-0.5">
                      Diterbitkan {new Date(cert.issuedAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">Terverifikasi</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
