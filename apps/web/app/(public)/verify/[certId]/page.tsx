import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type CertData = {
  code: string;
  type: string;
  holderName: string;
  courseName: string | null;
  issuedAt: string;
  revokedAt: string | null;
  status: "valid" | "revoked";
};

async function getCertificate(code: string): Promise<CertData | null> {
  try {
    const res = await fetch(`${API}/api/certificates/${encodeURIComponent(code)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as CertData) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certId: string }>;
}): Promise<Metadata> {
  const { certId } = await params;
  const cert = await getCertificate(certId);
  if (!cert) return { title: "Sertifikat Tidak Ditemukan" };
  return {
    title: `Sertifikat ${cert.holderName}`,
    description: `Verifikasi keaslian sertifikat ${cert.type} atas nama ${cert.holderName}`,
  };
}

export default async function VerifyCertPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  const cert = await getCertificate(certId);

  if (!cert) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5EA] p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <svg aria-hidden="true" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1D1D1F]">Sertifikat Tidak Ditemukan</h1>
          <p className="text-sm text-[#6E6E73]">
            Kode sertifikat <strong>{certId}</strong> tidak valid atau belum diterbitkan.
          </p>
          <Link href="/" className="text-sm text-[#0077A8] hover:underline">
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  const isValid = cert.status === "valid";
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5EA] p-8 max-w-md w-full space-y-6">
        {/* Status badge */}
        <div className="flex justify-center">
          {isValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sertifikat Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
              </svg>
              Sertifikat Dicabut
            </span>
          )}
        </div>

        {/* Logo */}
        <div className="text-center">
          <Image src="/logo.png" alt="Jago Akademi" width={1037} height={190} className="h-8 w-auto mx-auto" />
        </div>

        {/* Detail */}
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[#6E6E73] shrink-0">Pemegang</dt>
            <dd className="font-semibold text-[#1D1D1F] text-right">{cert.holderName}</dd>
          </div>
          {cert.courseName && (
            <div className="flex justify-between gap-4">
              <dt className="text-[#6E6E73] shrink-0">Kursus</dt>
              <dd className="font-medium text-[#1D1D1F] text-right">{cert.courseName}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-[#6E6E73] shrink-0">Jenis</dt>
            <dd className="text-[#1D1D1F] capitalize">{cert.type}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6E6E73] shrink-0">Diterbitkan</dt>
            <dd className="text-[#1D1D1F]">{issuedDate}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6E6E73] shrink-0">Kode</dt>
            <dd className="font-mono text-xs text-[#1D1D1F] break-all">{cert.code}</dd>
          </div>
        </dl>

        <p className="text-center text-xs text-[#6E6E73] border-t border-[#F2F2F7] pt-4">
          Verifikasi resmi oleh{" "}
          <Link href="/" className="text-[#0077A8] hover:underline">
            Jago Akademi
          </Link>
        </p>
      </div>
    </main>
  );
}
