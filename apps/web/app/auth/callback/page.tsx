"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * OAuth callback landing (TASK-055).
 *
 * The API's Google OAuth handler redirects here as
 * `${WEB_URL}/auth/callback?token=<accessToken>` (or `?error=<code>`).
 * Without this page that redirect 404s and the "Masuk dengan Google" CTA
 * silently fails. We consume the token exactly like the password login
 * (sessionStorage) and immediately scrub it from the URL so it does not
 * linger in history/referrer, then hand off to the dashboard.
 */
function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    const errCode = params.get("error");

    if (errCode) {
      setError(
        errCode === "account_disabled"
          ? "Akun Anda dinonaktifkan. Hubungi dukungan Jago Akademi."
          : "Gagal masuk dengan Google. Silakan coba lagi.",
      );
      return;
    }

    if (!token) {
      setError("Sesi masuk tidak valid. Silakan coba lagi.");
      return;
    }

    sessionStorage.setItem("access_token", token);
    // Remove the token from the visible URL before navigating away.
    window.history.replaceState(null, "", "/auth/callback");
    router.replace("/dashboard");
  }, [params, router]);

  if (error) {
    return (
      <div className="text-center space-y-3">
        <h1 className="text-lg font-semibold text-[#1D1D1F]">Masuk gagal</h1>
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
        <Link href="/masuk" className="btn-primary inline-block mt-2">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
      <span
        className="h-6 w-6 rounded-full border-2 border-[#0077A8] border-t-transparent animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm text-[#6E6E73]">Menyelesaikan proses masuk…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <p className="text-center text-sm text-[#6E6E73]">Memuat…</p>
          }
        >
          <CallbackHandler />
        </Suspense>
      </div>
    </main>
  );
}
