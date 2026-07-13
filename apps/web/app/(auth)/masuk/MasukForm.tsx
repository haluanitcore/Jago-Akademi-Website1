"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { login, buildGoogleLoginUrl } from "@/lib/auth/api";

export function MasukForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login({ email, password });

    setLoading(false);

    if (!result.success) {
      setError(result.error?.message ?? "Terjadi kesalahan.");
      return;
    }

    // Store access token in both storages: sessionStorage for current tab, localStorage for cross-tab
    if (typeof window !== "undefined") {
      sessionStorage.setItem("access_token", result.data.accessToken);
      localStorage.setItem("jg_access_token", result.data.accessToken);
    }

    // Fetch role to determine redirect target
    try {
      const meRes = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${result.data.accessToken}` },
      }).then((r) => r.json());

      if (meRes.success) {
        const roleNames: string[] = (meRes.data.roles ?? []).map(
          (r: { role: string } | string) => (typeof r === "string" ? r : r.role)
        );
        if (roleNames.some((r) => ["admin", "super_admin"].includes(r))) {
          window.location.href = "/admin/dashboard";
          return;
        }
      }
    } catch {
      // fallback to dashboard
    }
    window.location.href = "/dashboard";
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1D1D1F] mb-1">Masuk</h1>
      <p className="text-sm text-[#6E6E73] mb-6">
        Belum punya akun?{" "}
        <Link href="/daftar" className="text-[#0077A8] hover:underline font-medium">
          Daftar sekarang
        </Link>
      </p>

      {error && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark w-full"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-[#1D1D1F]">
              Kata Sandi
            </label>
            <Link href="/lupa-password" className="text-xs text-[#0077A8] hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark w-full"
            placeholder="Kata sandi Anda"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
              Memproses…
            </>
          ) : (
            "Masuk"
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[#E5E5EA]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[#6E6E73]">atau</span>
        </div>
      </div>

      <a
        href={buildGoogleLoginUrl()}
        className="flex items-center justify-center gap-3 w-full px-4 py-2.5 border border-[#E5E5EA] rounded-xl text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
        Masuk dengan Google
      </a>
    </>
  );
}
