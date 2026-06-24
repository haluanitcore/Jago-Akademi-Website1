"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth/api";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
          <svg aria-hidden="true" className="w-6 h-6 text-[#0077A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[#1D1D1F]">Cek email Anda</h2>
        <p className="text-sm text-[#6E6E73]">
          Jika email <strong>{email}</strong> terdaftar, kami telah mengirimkan tautan reset kata sandi. Tautan berlaku selama 1 jam.
        </p>
        <Link href="/masuk" className="text-sm text-[#0077A8] hover:underline font-medium">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/masuk" className="flex items-center gap-1.5 text-sm text-[#6E6E73] hover:text-[#1D1D1F] mb-6 transition-colors">
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </Link>

      <h1 className="text-2xl font-bold text-[#1D1D1F] mb-1">Lupa kata sandi?</h1>
      <p className="text-sm text-[#6E6E73] mb-6">
        Masukkan email akun Anda dan kami akan mengirimkan tautan reset kata sandi.
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
              Mengirim…
            </>
          ) : (
            "Kirim tautan reset"
          )}
        </button>
      </form>
    </>
  );
}
