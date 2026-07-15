"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getValidToken } from "@/lib/auth/token";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  profile: {
    bio: string | null;
    headline: string | null;
    linkedin: string | null;
    location: string | null;
  } | null;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";


export default function TrainerProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    avatarUrl: "",
    bio: "",
    headline: "",
    linkedin: "",
    location: "",
  });

  useEffect(() => {
    (async () => {
      const token = await getValidToken();
      if (!token) { router.replace("/masuk"); return; }
      try {
        const r = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await r.json();
        if (d.success) {
          setUser(d.data);
          setForm({
            name: d.data.name ?? "",
            avatarUrl: d.data.avatarUrl ?? "",
            bio: d.data.profile?.bio ?? "",
            headline: d.data.profile?.headline ?? "",
            linkedin: d.data.profile?.linkedin ?? "",
            location: d.data.profile?.location ?? "",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    const res = await fetch(`${API}/api/users/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: form.name,
        avatarUrl: form.avatarUrl || undefined,
        bio: form.bio || undefined,
        headline: form.headline || undefined,
        linkedin: form.linkedin || undefined,
        location: form.location || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.success) {
      setError(data.message ?? "Gagal menyimpan profil.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Memuat...</div>;

  const initials = (user?.name ?? "T").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/trainer-hub" className="text-[#0077A8] hover:underline">Trainer Hub</Link>
          <span className="text-[#6E6E73]">/</span>
          <span className="text-[#1D1D1F] font-medium">Profil Saya</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar preview */}
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                {form.avatarUrl ? (
                  // Kept as a plain <img>: this is a live preview of a URL the user is
                  // typing into the form. The host is arbitrary/unvalidated and the
                  // onError handler hides broken/partial URLs mid-type — behavior that
                  // next/image (which errors on unconfigured hosts) cannot replicate.
                  <img
                    src={form.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#0077A8] flex items-center justify-center text-white font-bold text-xl">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-[#1D1D1F]">{user?.name}</p>
                <p className="text-sm text-[#6E6E73]">{user?.email}</p>
              </div>
            </div>

            <h2 className="text-sm font-semibold text-[#1D1D1F] mb-4">Informasi Dasar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">Nama Tampilan</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">URL Foto Profil</label>
                <input
                  value={form.avatarUrl}
                  onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                  placeholder="https://cdn.contoh.com/foto.jpg"
                  type="url"
                />
                <p className="text-xs text-[#6E6E73] mt-1">URL ke foto profil publik Anda</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">Headline Profesional</label>
                <input
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                  placeholder="Contoh: Digital Marketing Expert | 10+ tahun pengalaman"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">Lokasi</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                  placeholder="Jakarta, Indonesia"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#1D1D1F]">Bio & Media Sosial</h2>
            <div>
              <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={5}
                className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                placeholder="Ceritakan tentang keahlian, pengalaman, dan passion Anda sebagai trainer..."
                maxLength={1000}
              />
              <p className="text-xs text-[#6E6E73] mt-1 text-right">{form.bio.length}/1000</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#3C3C43] mb-1.5">LinkedIn</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6E6E73] bg-[#F5F5F7] border border-[#E5E5EA] rounded-l-xl px-3 py-2.5 whitespace-nowrap">linkedin.com/in/</span>
                <input
                  value={form.linkedin.replace(/^.*linkedin\.com\/in\//i, "")}
                  onChange={(e) => setForm({ ...form, linkedin: `https://linkedin.com/in/${e.target.value}` })}
                  className="flex-1 border border-[#E5E5EA] border-l-0 rounded-r-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                  placeholder="username-anda"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}
          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">✅ Profil berhasil disimpan.</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-[#0077A8] text-white rounded-xl text-sm font-medium hover:bg-[#005f87] disabled:opacity-50 transition-colors"
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </div>
    </div>
  );
}
