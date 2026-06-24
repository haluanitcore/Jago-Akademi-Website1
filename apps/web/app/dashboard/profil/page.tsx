"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
};

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) { router.replace("/masuk"); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((body) => {
        if (!body.success) throw new Error(body.error);
        setUser(body.data);
        setName(body.data.name);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const token = sessionStorage.getItem("access_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/users/me`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          credentials: "include",
          body: JSON.stringify({ name }),
        }
      );
      const body = await res.json();
      if (!body.success) throw new Error(body.error);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-[#0077A8] border-t-transparent animate-spin" aria-label="Memuat…" />
      </div>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-[#1D1D1F]">Edit Profil</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0077A8] to-[#CC0052] flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-semibold text-[#1D1D1F]">{user?.name}</p>
              <p className="text-sm text-[#6E6E73]">{user?.email}</p>
              {user?.isVerified && (
                <span className="text-xs text-green-600 font-medium">Email terverifikasi</span>
              )}
            </div>
          </div>

          {success && (
            <div role="status" className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              Profil berhasil disimpan.
            </div>
          )}
          {error && (
            <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1D1D1F] mb-1">Nama</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-1">Email</label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="input-dark w-full opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-[#6E6E73] mt-1">Email tidak dapat diubah.</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                  Menyimpan…
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
