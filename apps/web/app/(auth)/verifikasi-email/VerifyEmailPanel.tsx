"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth/api";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [error, setError] = useState<string | null>(
    token ? null : "Tautan verifikasi tidak valid. Pastikan Anda membuka tautan lengkap dari email.",
  );
  const ranRef = useRef(false);

  useEffect(() => {
    if (!token || ranRef.current) return;
    ranRef.current = true;

    verifyEmail(token).then((result) => {
      if (!result.success) {
        setError(result.error?.message ?? "Gagal memverifikasi email. Tautan mungkin sudah kedaluwarsa.");
        setStatus("error");
        return;
      }
      setStatus("success");
    });
  }, [token]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <span
          className="h-6 w-6 rounded-full border-2 border-[#0077A8] border-t-transparent animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-[#6E6E73]">Memverifikasi email Anda…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <svg aria-hidden="true" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[#1D1D1F]">Email berhasil diverifikasi!</h2>
        <p className="text-sm text-[#6E6E73]">Terima kasih, akun Anda kini terverifikasi.</p>
        <Link href="/masuk" className="btn-primary inline-block mt-2">
          Masuk sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3">
      <p role="alert" className="text-sm text-red-600 font-medium">
        {error}
      </p>
      <Link href="/masuk" className="text-sm text-[#0077A8] hover:underline">
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}
