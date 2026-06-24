"use client";

import { useState, type FormEvent } from "react";

const TOPICS = [
  "Pertanyaan umum",
  "Masalah teknis",
  "Pembayaran & refund",
  "Korporat & LMS",
  "Partnership & kolaborasi",
  "Lainnya",
];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // In production: POST to /api/contact or email service
    await new Promise((r) => setTimeout(r, 800));

    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg aria-hidden="true" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#1D1D1F]">Pesan terkirim!</h3>
        <p className="text-sm text-[#6E6E73]">
          Terima kasih, {name}. Tim kami akan menghubungi Anda di <strong>{email}</strong> dalam 1–2 hari kerja.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <h2 className="text-xl font-bold text-[#1D1D1F]">Kirim Pesan</h2>

      {error && (
        <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#1D1D1F] mb-1">Nama</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark w-full"
            placeholder="Nama Anda"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1D1D1F] mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark w-full"
            placeholder="nama@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-[#1D1D1F] mb-1">Topik</label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input-dark w-full"
        >
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#1D1D1F] mb-1">Pesan</label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-dark w-full resize-none"
          placeholder="Tulis pesan Anda di sini…"
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
          "Kirim Pesan"
        )}
      </button>
    </form>
  );
}
