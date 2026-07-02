"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { register, buildGoogleLoginUrl } from "@/lib/auth/api";

export default function DaftarPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError("Anda harus menyetujui Kebijakan Privasi untuk mendaftar.");
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, consent: true });
    setLoading(false);

    if (!result.success) {
      setError(result.error?.message ?? "Terjadi kesalahan.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <svg aria-hidden="true" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[#1D1D1F]">Registrasi berhasil!</h2>
        <p className="text-sm text-[#6E6E73]">
          Kami telah mengirimkan tautan verifikasi ke <strong>{email}</strong>. Silakan cek inbox Anda.
        </p>
        <Link href="/masuk" className="btn-primary inline-block mt-2">
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1D1D1F] mb-1">Buat akun</h1>
      <p className="text-sm text-[#6E6E73] mb-6">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="text-[#0077A8] hover:underline font-medium">
          Masuk di sini
        </Link>
      </p>

      {error && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Nama lengkap
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark w-full"
            placeholder="Nama Anda"
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Kata Sandi
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark w-full"
            placeholder="Minimal 8 karakter"
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="consent"
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#C7C7CC] text-[#0077A8] focus:ring-[#0077A8] cursor-pointer"
          />
          <label htmlFor="consent" className="text-sm text-[#3C3C43] cursor-pointer leading-snug">
            Saya menyetujui{" "}
            <Link href="/kebijakan-privasi" className="text-[#0077A8] hover:underline" target="_blank">
              Kebijakan Privasi
            </Link>{" "}
            dan{" "}
            <Link href="/syarat-ketentuan" className="text-[#0077A8] hover:underline" target="_blank">
              Syarat &amp; Ketentuan
            </Link>{" "}
            Jago Akademi, termasuk pemrosesan data pribadi saya sesuai UU PDP.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
              Mendaftarkan…
            </>
          ) : (
            "Buat akun"
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
        Daftar dengan Google
      </a>
    </>
  );
}
