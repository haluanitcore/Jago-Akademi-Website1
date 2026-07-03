"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth/api";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-red-600 font-medium">Token reset tidak valid atau sudah kedaluwarsa.</p>
        <Link href="/lupa-password" className="text-sm text-[#0077A8] hover:underline">
          Minta tautan baru
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface-accent-soft)] flex items-center justify-center">
          <svg aria-hidden="true" className="w-6 h-6 text-[var(--brand-cyan-strong)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[#1D1D1F]">Kata sandi berhasil diperbarui!</h2>
        <p className="text-sm text-[#6E6E73]">Silakan masuk dengan kata sandi baru Anda.</p>
        <Link href="/masuk" className="btn-primary inline-block mt-2">
          Masuk sekarang
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error?.message ?? "Terjadi kesalahan.");
      return;
    }

    setSuccess(true);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1D1D1F] mb-1">Buat kata sandi baru</h1>
      <p className="text-sm text-[#6E6E73] mb-6">Kata sandi minimal 8 karakter.</p>

      {error && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Kata sandi baru
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

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Konfirmasi kata sandi
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-dark w-full"
            placeholder="Ulangi kata sandi"
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
              Menyimpan…
            </>
          ) : (
            "Simpan kata sandi baru"
          )}
        </button>
      </form>
    </>
  );
}
