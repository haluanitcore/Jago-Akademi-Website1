"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
};

const API = ""; // Relative path → Next.js proxy → backend

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token") || sessionStorage.getItem("jg_token");
}

export default function ProfilPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", bio: "" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profil" | "keamanan">("profil");

  // Password change state
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passMsg, setPassMsg] = useState("");
  const [passMsgType, setPassMsgType] = useState<"success" | "error">("success");
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/masuk"); return; }

    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((body) => {
        if (!body.success) throw new Error(body.error?.message ?? "Gagal memuat profil.");
        const u: UserProfile = body.data;
        setUser(u);
        setForm({ name: u.name, phone: u.phone ?? "", bio: u.bio ?? "" });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Ukuran foto maks. 5 MB."); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    const token = getToken();
    setUploadingAvatar(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const res = await fetch(`${API}/api/users/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.error?.message ?? "Gagal mengunggah foto.");
      setUser((prev) => prev ? { ...prev, avatarUrl: body.data.avatarUrl } : prev);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah foto.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.error?.message ?? "Gagal menyimpan.");
      setSuccess(true);
      setUser((prev) => prev ? { ...prev, ...form } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg("Konfirmasi password tidak cocok.");
      setPassMsgType("error");
      return;
    }
    setSavingPass(true);
    setPassMsg("");
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/users/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword }),
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.error?.message ?? "Gagal mengubah password.");
      setPassMsg("Password berhasil diubah.");
      setPassMsgType("success");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setPassMsg(e instanceof Error ? e.message : "Gagal mengubah password.");
      setPassMsgType("error");
    } finally {
      setSavingPass(false);
    }
  }

  if (loading) {
    return <div className="pf-loading"><span className="pf-spinner" /></div>;
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const currentAvatar = avatarPreview || user?.avatarUrl;

  return (
    <div className="pf-page">
      {/* Profile Card */}
      <div className="pf-profile-card">
        {/* Avatar */}
        <div className="pf-avatar-section">
          <div className="pf-avatar-wrap">
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt={user?.name ?? "Avatar"}
                width={96}
                height={96}
                className="pf-avatar-img"
              />
            ) : (
              <div className="pf-avatar-initials">{initials}</div>
            )}
            <button
              className="pf-avatar-edit-btn"
              onClick={() => fileRef.current?.click()}
              title="Ganti foto profil"
            >
              ✏️
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="pf-file-hidden"
            onChange={handleAvatarChange}
          />

          {avatarFile && (
            <div className="pf-avatar-actions">
              <p className="pf-avatar-filename">{avatarFile.name}</p>
              <div className="pf-avatar-btns">
                <button onClick={uploadAvatar} disabled={uploadingAvatar} className="pf-btn-upload">
                  {uploadingAvatar ? "Mengunggah..." : "💾 Simpan Foto"}
                </button>
                <button
                  onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                  className="pf-btn-cancel"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <div className="pf-user-display">
            <h2 className="pf-user-name">{user?.name}</h2>
            <p className="pf-user-email">{user?.email}</p>
            {user?.isVerified && (
              <span className="pf-verified-badge">✓ Email Terverifikasi</span>
            )}
            <p className="pf-member-since">
              Member sejak {new Date(user?.createdAt ?? "").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pf-tabs">
        <button
          className={`pf-tab ${activeTab === "profil" ? "pf-tab-active" : ""}`}
          onClick={() => setActiveTab("profil")}
        >
          👤 Data Profil
        </button>
        <button
          className={`pf-tab ${activeTab === "keamanan" ? "pf-tab-active" : ""}`}
          onClick={() => setActiveTab("keamanan")}
        >
          🔒 Keamanan
        </button>
      </div>

      {/* Profil tab */}
      {activeTab === "profil" && (
        <div className="pf-form-card">
          {success && (
            <div className="pf-alert pf-alert-success">✓ Profil berhasil disimpan.</div>
          )}
          {error && (
            <div className="pf-alert pf-alert-error">{error}</div>
          )}

          <form onSubmit={handleSave} className="pf-form">
            {/* Name */}
            <div className="pf-field">
              <label className="pf-label">Nama Lengkap</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="pf-input"
                placeholder="Nama lengkap Anda"
              />
            </div>

            {/* Email (readonly) */}
            <div className="pf-field">
              <label className="pf-label">Email</label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="pf-input pf-input-disabled"
              />
              <p className="pf-field-hint">Email tidak dapat diubah.</p>
            </div>

            {/* Phone */}
            <div className="pf-field">
              <label className="pf-label">Nomor Telepon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="pf-input"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {/* Bio */}
            <div className="pf-field">
              <label className="pf-label">Bio / Tentang Saya</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="pf-textarea"
                placeholder="Ceritakan sedikit tentang diri Anda..."
                rows={3}
                maxLength={300}
              />
              <p className="pf-field-hint">{form.bio.length}/300 karakter</p>
            </div>

            <button type="submit" disabled={saving} className="pf-save-btn">
              {saving ? (
                <><span className="pf-btn-spinner" /> Menyimpan...</>
              ) : "💾 Simpan Perubahan"}
            </button>
          </form>
        </div>
      )}

      {/* Keamanan tab */}
      {activeTab === "keamanan" && (
        <div className="pf-form-card">
          <h3 className="pf-section-title">Ubah Password</h3>
          <p className="pf-section-desc">
            Pastikan password baru Anda kuat dan tidak mudah ditebak.
          </p>

          {passMsg && (
            <div className={`pf-alert ${passMsgType === "error" ? "pf-alert-error" : "pf-alert-success"}`}>
              {passMsg}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="pf-form">
            {[
              { key: "currentPassword", label: "Password Saat Ini",   placeholder: "Masukkan password lama" },
              { key: "newPassword",     label: "Password Baru",        placeholder: "Min. 8 karakter" },
              { key: "confirmPassword", label: "Konfirmasi Password",  placeholder: "Ulangi password baru" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="pf-field">
                <label className="pf-label">{label}</label>
                <input
                  type="password"
                  required
                  minLength={key !== "currentPassword" ? 8 : undefined}
                  value={passForm[key as keyof typeof passForm]}
                  onChange={(e) => setPassForm({ ...passForm, [key]: e.target.value })}
                  className="pf-input"
                  placeholder={placeholder}
                />
              </div>
            ))}

            <button type="submit" disabled={savingPass} className="pf-save-btn pf-save-red">
              {savingPass ? "Menyimpan..." : "🔒 Ubah Password"}
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .pf-page { display: flex; flex-direction: column; gap: 20px; }
        .pf-loading { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
        .pf-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Profile card */
        .pf-profile-card {
          background: linear-gradient(135deg, #0a1628 0%, #0d2b4e 100%);
          border-radius: 20px; padding: 28px 32px; position: relative; overflow: hidden;
        }
        .pf-profile-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 20% 50%, rgba(0,119,168,0.3), transparent 60%);
          pointer-events: none;
        }
        .pf-avatar-section { display: flex; align-items: center; gap: 24px; position: relative; flex-wrap: wrap; }
        .pf-avatar-wrap {
          width: 96px; height: 96px; border-radius: 50%; overflow: hidden; position: relative;
          border: 3px solid rgba(255,255,255,0.2); flex-shrink: 0;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.08);
        }
        .pf-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .pf-avatar-initials {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #0077A8, #CC0052);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 28px; font-weight: 800;
        }
        .pf-avatar-edit-btn {
          position: absolute; bottom: 0; right: 0;
          width: 26px; height: 26px; border-radius: 50%;
          background: white; border: none; cursor: pointer;
          font-size: 12px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.2s;
        }
        .pf-avatar-edit-btn:hover { transform: scale(1.1); }
        .pf-file-hidden { display: none; }
        .pf-avatar-actions { display: flex; flex-direction: column; gap: 8px; }
        .pf-avatar-filename { font-size: 11px; color: rgba(255,255,255,0.6); }
        .pf-avatar-btns { display: flex; gap: 8px; }
        .pf-btn-upload {
          padding: 7px 14px; background: #22C55E; color: white;
          border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
        }
        .pf-btn-upload:hover:not(:disabled) { background: #16A34A; }
        .pf-btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }
        .pf-btn-cancel {
          padding: 7px 14px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
          font-size: 12px; cursor: pointer; transition: all 0.2s;
        }
        .pf-btn-cancel:hover { background: rgba(255,255,255,0.15); }

        .pf-user-display { }
        .pf-user-name { font-size: 22px; font-weight: 800; color: white; margin-bottom: 4px; }
        .pf-user-email { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
        .pf-verified-badge {
          display: inline-block; background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
          color: #4ADE80; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 999px; margin-bottom: 6px;
        }
        .pf-member-since { font-size: 11px; color: rgba(255,255,255,0.4); }

        /* Tabs */
        .pf-tabs {
          display: flex; gap: 0;
          background: white; border-radius: 14px; padding: 4px;
          border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          width: fit-content;
        }
        .pf-tab {
          padding: 9px 20px; border-radius: 11px;
          font-size: 13px; font-weight: 600; color: #6E6E73;
          background: none; border: none; cursor: pointer; transition: all 0.18s;
        }
        .pf-tab:hover { color: #0077A8; }
        .pf-tab-active { background: #0077A8 !important; color: white !important; }

        /* Form card */
        .pf-form-card {
          background: white; border-radius: 20px; padding: 28px 32px;
          border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex; flex-direction: column; gap: 16px;
        }
        .pf-section-title { font-size: 16px; font-weight: 700; color: #1D1D1F; }
        .pf-section-desc { font-size: 13px; color: #6E6E73; }

        /* Alerts */
        .pf-alert { padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; }
        .pf-alert-success { background: #DCFCE7; border: 1px solid #86EFAC; color: #166534; }
        .pf-alert-error   { background: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; }

        /* Form */
        .pf-form { display: flex; flex-direction: column; gap: 16px; }
        .pf-field { display: flex; flex-direction: column; gap: 6px; }
        .pf-label { font-size: 13px; font-weight: 600; color: #1D1D1F; }
        .pf-input {
          padding: 10px 14px; border: 1.5px solid #E5E5EA; border-radius: 12px;
          font-size: 14px; color: #1D1D1F; outline: none; transition: border-color 0.18s;
        }
        .pf-input:focus { border-color: #0077A8; }
        .pf-input-disabled { background: #F5F5F7; color: #9CA3AF; cursor: not-allowed; }
        .pf-textarea {
          padding: 10px 14px; border: 1.5px solid #E5E5EA; border-radius: 12px;
          font-size: 14px; color: #1D1D1F; outline: none; resize: vertical;
          font-family: inherit; transition: border-color 0.18s;
        }
        .pf-textarea:focus { border-color: #0077A8; }
        .pf-field-hint { font-size: 11px; color: #9CA3AF; }

        .pf-save-btn {
          align-self: flex-start; display: flex; align-items: center; gap: 8px;
          padding: 12px 28px; background: #0077A8; color: white;
          border: none; border-radius: 12px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background 0.2s;
        }
        .pf-save-btn:hover:not(:disabled) { background: #005f87; }
        .pf-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pf-save-red { background: #CC0052 !important; }
        .pf-save-red:hover:not(:disabled) { background: #a8003f !important; }
        .pf-btn-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid white; border-top-color: transparent;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        @media (max-width: 640px) {
          .pf-profile-card { padding: 20px; }
          .pf-form-card { padding: 20px; }
          .pf-avatar-section { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
