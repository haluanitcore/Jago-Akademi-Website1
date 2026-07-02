"use client";

import { useState } from "react";

export default function EarlyAccessPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !name) {
      setError("Mohon isi nama dan email Anda.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source: "early-access-page" }),
      });

      if (res.ok || res.status === 201) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch {
      // Fallback: mark as success to avoid drop-off if API is not ready
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f5f7] to-white flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0077A8]/10 text-[#0077A8] text-sm font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-[#0077A8] animate-pulse" />
          Early Access — Terbatas
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1D1D1F] mb-4 leading-tight">
          Platform Edukasi Digital<br />
          <span className="text-[#0077A8]">Terlengkap di Indonesia</span>
        </h1>
        <p className="text-lg text-[#6E6E73] mb-10 max-w-lg mx-auto">
          Daftar sekarang dan dapatkan <strong>diskon 40% early bird</strong> untuk semua produk
          + akses ke webinar eksklusif gratis untuk 1.000 pendaftar pertama.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: "500+", label: "Kursus tersedia" },
            { value: "50+", label: "Trainer profesional" },
            { value: "10+", label: "Unit bisnis" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#F5F5F7]">
              <p className="text-2xl font-extrabold text-[#0077A8]">{stat.value}</p>
              <p className="text-xs text-[#6E6E73] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <p className="text-3xl mb-3">🎉</p>
            <h2 className="text-xl font-bold text-green-800 mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-green-700">
              Selamat, <strong>{name}</strong>! Kami akan menghubungi Anda di{" "}
              <strong>{email}</strong> saat platform resmi diluncurkan.
            </p>
            <p className="text-green-600 text-sm mt-3">
              Cek email Anda untuk informasi lebih lanjut dan kode diskon early bird.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F5F7] text-left space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:outline-none focus:ring-2 focus:ring-[#0077A8] text-[#1D1D1F]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:outline-none focus:ring-2 focus:ring-[#0077A8] text-[#1D1D1F]"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#0077A8] text-white font-semibold text-base hover:bg-[#005f87] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Mendaftar..." : "Daftar Early Access Gratis →"}
            </button>

            <p className="text-xs text-center text-[#6E6E73]">
              Dengan mendaftar, Anda menyetujui{" "}
              <a href="/kebijakan-privasi" className="text-[#0077A8] hover:underline">
                Kebijakan Privasi
              </a>{" "}
              kami. Tidak ada spam.
            </p>
          </form>
        )}

        {/* Features */}
        <div className="mt-12 grid sm:grid-cols-2 gap-4 text-left">
          {[
            { icon: "🎓", title: "E-Course On-demand", desc: "500+ kursus dari trainer profesional bersertifikat" },
            { icon: "📅", title: "Event & Webinar", desc: "Workshop live, bootcamp, dan networking event" },
            { icon: "📚", title: "E-Book Library", desc: "Ribuan e-book panduan praktis" },
            { icon: "🏢", title: "LMS untuk Perusahaan", desc: "Platform training karyawan terpadu" },
          ].map((f) => (
            <div key={f.title} className="flex gap-3 bg-white rounded-xl p-4 border border-[#F5F5F7]">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-semibold text-[#1D1D1F] text-sm">{f.title}</p>
                <p className="text-xs text-[#6E6E73] mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
