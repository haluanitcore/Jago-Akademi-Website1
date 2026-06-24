"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function LmsInviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lms/invite/${token}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menerima undangan.");
        return;
      }
      setSuccess(true);
      if (data.data?.tenantSlug) setTenantSlug(data.data.tenantSlug);
      setTimeout(() => {
        if (data.data?.tenantSlug) router.push(`/lms/${data.data.tenantSlug}`);
      }, 2500);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-xl font-bold text-[#1D1D1F] mb-2">Undangan diterima!</h1>
          <p className="text-sm text-[#6E6E73]">Kamu berhasil bergabung. Mengalihkan ke portal...</p>
          {tenantSlug && (
            <Link href={`/lms/${tenantSlug}`} className="mt-4 inline-block text-sm text-[#0077A8] hover:underline">
              Buka portal sekarang →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-10 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">📩</div>
        <h1 className="text-xl font-bold text-[#1D1D1F] mb-2">Undangan LMS</h1>
        <p className="text-sm text-[#6E6E73] mb-6">
          Kamu telah diundang untuk bergabung ke program pembelajaran. Klik tombol di bawah untuk menerima undangan.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-2.5 bg-[#0077A8] text-white rounded-xl text-sm font-medium hover:bg-[#005f87] disabled:opacity-50 transition-colors"
        >
          {loading ? "Memproses..." : "Terima Undangan"}
        </button>

        <p className="mt-4 text-xs text-[#6E6E73]">
          Pastikan kamu sudah masuk dengan akun yang menerima undangan ini.
        </p>
      </div>
    </div>
  );
}
