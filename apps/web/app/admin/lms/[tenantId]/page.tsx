"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Users, Layers, BarChart3,
  ChevronRight, ToggleLeft, ToggleRight, Mail,
} from "lucide-react";
import { getToken } from "@/lib/auth/token";

// ─── Types ────────────────────────────────────────────────────────────────────

type TenantDetail = {
  id: string;
  name: string;
  slug: string;
  planType: string;
  isActive: boolean;
  trialEndsAt: string | null;
  seatLimit: number;
  primaryColor: string;
  logoUrl: string | null;
  createdAt: string;
  _count?: { batches: number; courses: number; enrollments: number; invites: number };
};

type Batch = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  _count?: { members: number; assignments: number };
};

type LmsCourse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  _count?: { lessons: number; enrollments: number };
};

type Member = { id: string; name: string; email: string; role: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────


function authHeaders() {
  return { Authorization: `Bearer ${getToken() ?? ""}`, "Content-Type": "application/json" };
}

const PLAN_STYLE: Record<string, { bg: string; text: string }> = {
  trial:      { bg: "rgba(234,179,8,0.12)",  text: "#A16207" },
  starter:    { bg: "rgba(59,130,246,0.1)",  text: "#2563EB" },
  pro:        { bg: "rgba(124,58,237,0.1)",  text: "#7C3AED" },
  enterprise: { bg: "rgba(22,163,74,0.1)",   text: "#15803D" },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ tenantId, onClose }: { tenantId: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"lms_employee" | "lms_admin">("lms_employee");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await fetch(`/api/lms/tenants/${tenantId}/invite`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ email, role }),
      });
      const body = await res.json();
      if (!body.success) { setError(body.error?.message ?? "Gagal mengirim undangan."); return; }
      setDone(true);
    } catch { setError("Tidak dapat terhubung ke server."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1D1D1F", marginBottom: 16 }}>
          {done ? "Undangan Terkirim" : "Undang Pengguna"}
        </h2>
        {done ? (
          <>
            <p style={{ fontSize: 13, color: "#6E6E73", marginBottom: 18 }}>Undangan sudah dikirim ke <strong>{email}</strong>.</p>
            <button onClick={onClose} style={{ width: "100%", padding: "11px 0", borderRadius: 12, background: "#0077A8", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Selesai</button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>{error}</div>}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1D1D1F", marginBottom: 5 }}>Email</label>
              <input id="invite-email-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1D1D1F", marginBottom: 5 }}>Role</label>
              <select id="invite-role-select" value={role} onChange={(e) => setRole(e.target.value as typeof role)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="lms_employee">Karyawan (Employee)</option>
                <option value="lms_admin">Admin LMS</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: "#F5F5F7", color: "#1D1D1F", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Batal</button>
              <button id="invite-submit-btn" type="submit" disabled={loading} style={{ flex: 2, padding: "10px 0", borderRadius: 12, background: "#0077A8", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Mengirim…" : "Kirim Undangan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #E5E5EA", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminTenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const router = useRouter();

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "batches" | "courses" | "members">("overview");

  const fetchAll = useCallback(() => {
    const token = getToken();
    if (!token || !tenantId) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`/api/lms/tenants/${tenantId}`, { headers }).then((r) => r.json()),
      fetch(`/api/lms/tenants/${tenantId}/batches`, { headers }).then((r) => r.json()),
      fetch(`/api/lms/tenants/${tenantId}/courses`, { headers }).then((r) => r.json()),
      fetch(`/api/lms/tenants/${tenantId}/members`, { headers }).then((r) => r.json()),
    ]).then(([t, b, c, m]) => {
      if (t.success) setTenant(t.data);
      if (b.success) setBatches(b.data ?? []);
      if (c.success) setCourses(c.data ?? []);
      if (m.success) setMembers(m.data ?? []);
    }).finally(() => setLoading(false));
  }, [tenantId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function toggleActive() {
    if (!tenant) return;
    await fetch(`/api/lms/tenants/${tenantId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ isActive: !tenant.isActive }),
    });
    fetchAll();
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <span style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #0077A8", borderTopColor: "transparent", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <p style={{ fontSize: 40, marginBottom: 8 }}>🔍</p>
        <p style={{ fontWeight: 600, color: "#1D1D1F", marginBottom: 12 }}>Tenant tidak ditemukan</p>
        <button onClick={() => router.push("/admin/lms")} style={{ padding: "10px 20px", borderRadius: 12, background: "#0077A8", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>← Kembali ke LMS</button>
      </div>
    );
  }

  const plan = PLAN_STYLE[tenant.planType] ?? PLAN_STYLE.trial!;
  const expired = tenant.trialEndsAt && new Date(tenant.trialEndsAt) < new Date();
  const seatUsed = tenant._count?.enrollments ?? 0;
  const seatPct = Math.min(100, Math.round((seatUsed / tenant.seatLimit) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1100 }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/admin/lms" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6E6E73", textDecoration: "none" }}>
          <ArrowLeft size={14} aria-hidden="true" /> LMS B2B
        </Link>
        <ChevronRight size={12} style={{ color: "#9CA3AF" }} aria-hidden="true" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1D1D1F" }}>{tenant.name}</span>
      </div>

      {/* Tenant header card */}
      <div style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d2040 100%)", borderRadius: 20, padding: 28, color: "white" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.12)", color: "white", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(255,255,255,0.15)" }}>
              {tenant.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800 }}>{tenant.name}</h1>
                <span style={{ ...plan, fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 999 }}>{tenant.planType.toUpperCase()}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: expired ? "rgba(220,38,38,0.25)" : tenant.isActive ? "rgba(22,163,74,0.25)" : "rgba(107,114,128,0.25)", color: expired ? "#FCA5A5" : tenant.isActive ? "#86EFAC" : "#9CA3AF" }}>
                  {expired ? "KADALUARSA" : tenant.isActive ? "AKTIF" : "NON-AKTIF"}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "monospace" }}>/{tenant.slug}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                Bergabung: {fmtDate(tenant.createdAt)}{tenant.trialEndsAt ? ` · Trial s/d: ${fmtDate(tenant.trialEndsAt)}` : ""}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button id="tenant-detail-invite-btn" onClick={() => setShowInvite(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <Mail size={14} aria-hidden="true" /> Undang
            </button>
            <button id="tenant-detail-toggle-btn" onClick={toggleActive}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: tenant.isActive ? "rgba(220,38,38,0.2)" : "rgba(22,163,74,0.2)", color: tenant.isActive ? "#FCA5A5" : "#86EFAC", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {tenant.isActive ? <ToggleRight size={14} aria-hidden="true" /> : <ToggleLeft size={14} aria-hidden="true" />}
              {tenant.isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>

        {/* Seat usage bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Penggunaan Kursi</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{seatUsed} / {tenant.seatLimit} ({seatPct}%)</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 999 }}>
            <div style={{ height: 6, borderRadius: 999, width: `${seatPct}%`, background: seatPct > 80 ? "#F87171" : "#34D399", transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Batch", value: tenant._count?.batches ?? 0, icon: Layers, color: "#0077A8" },
          { label: "Kursus", value: tenant._count?.courses ?? 0, icon: Building2, color: "#7C3AED" },
          { label: "Total Enrolled", value: tenant._count?.enrollments ?? 0, icon: BarChart3, color: "#059669" },
          { label: "Undangan", value: tenant._count?.invites ?? 0, icon: Users, color: "#D97706" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "16px 14px", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={16} strokeWidth={1.75} style={{ color }} aria-hidden="true" />
            </span>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color }}>{value}</p>
              <p style={{ fontSize: 10, color: "#6E6E73" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #E5E5EA" }}>
        {([["overview", "📋 Overview"], ["batches", "👥 Batch"], ["courses", "📚 Kursus"], ["members", "🧑‍💼 Anggota"]] as const).map(([s, label]) => (
          <button key={s} id={`tenant-section-${s}-btn`} onClick={() => setActiveSection(s)}
            style={{ padding: "9px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: activeSection === s ? "#0077A8" : "#6E6E73", borderBottom: `3px solid ${activeSection === s ? "#0077A8" : "transparent"}`, marginBottom: -2 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Section: Overview */}
      {activeSection === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #E5E5EA" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F", marginBottom: 14 }}>Info Tenant</h3>
            {[
              ["Nama", tenant.name],
              ["Slug", `/${tenant.slug}`],
              ["Paket", tenant.planType.toUpperCase()],
              ["Batas Kursi", tenant.seatLimit.toString()],
              ["Warna Brand", tenant.primaryColor],
              ["Dibuat", fmtDate(tenant.createdAt)],
              ["Trial Berakhir", fmtDate(tenant.trialEndsAt)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>
                <span style={{ color: "#9CA3AF" }}>{k}</span>
                <span style={{ fontWeight: 600, color: "#1D1D1F", fontFamily: k === "Slug" || k === "Warna Brand" ? "monospace" : "inherit" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #E5E5EA", flex: 1 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F", marginBottom: 14 }}>Batch Terbaru</h3>
              {batches.length === 0
                ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>Belum ada batch.</p>
                : batches.slice(0, 4).map((b) => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: "#1D1D1F" }}>{b.name}</span>
                    <span style={{ color: "#9CA3AF" }}>{b._count?.members ?? 0} peserta</span>
                  </div>
                ))
              }
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #E5E5EA", flex: 1 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F", marginBottom: 14 }}>Kursus Aktif</h3>
              {courses.filter((c) => c.status === "published").length === 0
                ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>Belum ada kursus published.</p>
                : courses.filter((c) => c.status === "published").slice(0, 4).map((c) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: "#1D1D1F" }}>{c.title}</span>
                    <span style={{ color: "#9CA3AF" }}>{c._count?.lessons ?? 0} pelajaran</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Section: Batches */}
      {activeSection === "batches" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {batches.length === 0
            ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 16, border: "1px solid #E5E5EA" }}><p style={{ color: "#6E6E73" }}>Belum ada batch.</p></div>
            : batches.map((b) => (
              <div key={b.id} style={{ background: "white", borderRadius: 16, padding: 18, border: "1px solid #E5E5EA", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F" }}>{b.name}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: b.isActive ? "#DCFCE7" : "#F3F4F6", color: b.isActive ? "#16A34A" : "#6B7280" }}>
                    {b.isActive ? "Aktif" : "Non-aktif"}
                  </span>
                </div>
                {b.description && <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 10 }}>{b.description}</p>}
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6E6E73" }}>
                  <span>👥 {b._count?.members ?? 0} peserta</span>
                  <span>📚 {b._count?.assignments ?? 0} kursus assigned</span>
                  {b.startDate && <span>📅 {fmtDate(b.startDate)}</span>}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Section: Courses */}
      {activeSection === "courses" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {courses.length === 0
            ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 16, border: "1px solid #E5E5EA" }}><p style={{ color: "#6E6E73" }}>Belum ada kursus.</p></div>
            : courses.map((c) => (
              <div key={c.id} style={{ background: "white", borderRadius: 16, padding: 18, border: "1px solid #E5E5EA", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F" }}>{c.title}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: c.status === "published" ? "#DCFCE7" : "#F3F4F6", color: c.status === "published" ? "#16A34A" : "#6B7280" }}>
                    {c.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                {c.description && <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 10 }}>{c.description}</p>}
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6E6E73" }}>
                  <span>📖 {c._count?.lessons ?? 0} pelajaran</span>
                  <span>👥 {c._count?.enrollments ?? 0} enrolled</span>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Section: Members */}
      {activeSection === "members" && (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E5EA", overflow: "hidden" }}>
          {members.length === 0
            ? <div style={{ textAlign: "center", padding: "48px 24px" }}><p style={{ color: "#6E6E73" }}>Belum ada anggota. Gunakan tombol "Undang" untuk mengundang pengguna.</p></div>
            : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E5E5EA", background: "#F9FAFB" }}>
                    {["Nama", "Email", "Role"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "#6E6E73", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: i < members.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1D1D1F" }}>{m.name}</td>
                      <td style={{ padding: "12px 16px", color: "#6E6E73" }}>{m.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: m.role === "lms_admin" ? "rgba(124,58,237,0.1)" : "rgba(0,119,168,0.1)", color: m.role === "lms_admin" ? "#7C3AED" : "#0077A8" }}>
                          {m.role === "lms_admin" ? "Admin LMS" : "Karyawan"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}

      {/* Invite modal */}
      {showInvite && <InviteModal tenantId={tenantId!} onClose={() => setShowInvite(false)} />}
    </div>
  );
}
