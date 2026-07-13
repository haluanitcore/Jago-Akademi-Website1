"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, Building2, Layers, Users, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tenant = {
  id: string;
  name: string;
  slug: string;
  planType: string;
  isActive: boolean;
  trialEndsAt: string | null;
  seatLimit: number;
  createdAt: string;
  _count?: { batches: number; courses: number; enrollments: number };
};

type Batch = { id: string; name: string; isActive: boolean; _count?: { members: number; assignments: number } };
type LmsCourse = { id: string; title: string; status: string; _count?: { lessons: number; enrollments: number } };

type AssignForm = {
  tenantId: string;
  courseId: string;
  batchId: string;
  dueDate: string;
  isMandatory: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("jg_token") ||
    localStorage.getItem("jg_access_token")
  );
}

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" };
}

const PLAN_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  trial:      { bg: "rgba(234,179,8,0.12)",  text: "#A16207", label: "Trial" },
  starter:    { bg: "rgba(59,130,246,0.1)",  text: "#2563EB", label: "Starter" },
  pro:        { bg: "rgba(124,58,237,0.1)",  text: "#7C3AED", label: "Pro" },
  enterprise: { bg: "rgba(22,163,74,0.1)",   text: "#15803D", label: "Enterprise" },
};

// ─── Create Tenant Modal ──────────────────────────────────────────────────────

function CreateTenantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<"trial" | "starter" | "pro" | "enterprise">("trial");
  const [seatLimit, setSeatLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/lms/tenants", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ slug, name, planType: plan, seatLimit }),
      });
      const body = await res.json();
      if (!body.success) { setError(body.error?.message ?? "Gagal membuat tenant."); return; }
      onCreated();
      onClose();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1D1D1F" }}>Buat Tenant Baru</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6E6E73" }} aria-label="Tutup"><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1D1D1F", marginBottom: 5 }}>Nama Perusahaan / Institusi *</label>
            <input id="tenant-name-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: PT Maju Bersama" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1D1D1F", marginBottom: 5 }}>Slug (URL-friendly) *</label>
            <input id="tenant-slug-input" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="maju-bersama" style={inputStyle} />
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Hanya huruf kecil, angka, dan tanda hubung</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1D1D1F", marginBottom: 5 }}>Paket</label>
              <select id="tenant-plan-select" value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="trial">Trial (14 hari)</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1D1D1F", marginBottom: 5 }}>Maks. Kursi</label>
              <input id="tenant-seats-input" type="number" min={1} max={10000} value={seatLimit} onChange={(e) => setSeatLimit(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <button id="tenant-create-submit-btn" type="submit" disabled={loading} style={{ marginTop: 4, padding: "11px 0", borderRadius: 12, background: "#0077A8", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Membuat…" : "Buat Tenant"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #E5E5EA", borderRadius: 10,
  fontSize: 13, outline: "none", boxSizing: "border-box",
};

// ─── Workshop Assignment Panel ────────────────────────────────────────────────

function WorkshopAssignPanel() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [form, setForm] = useState<AssignForm>({ tenantId: "", courseId: "", batchId: "", dueDate: "", isMandatory: true });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/lms/tenants", { headers: authHeaders() })
      .then((r) => r.json())
      .then((b) => { if (b.success) setTenants(Array.isArray(b.data) ? b.data : []); });
  }, []);

  function handleTenantChange(tenantId: string) {
    setForm((f) => ({ ...f, tenantId, batchId: "", courseId: "" }));
    setBatches([]); setCourses([]);
    if (!tenantId) return;
    fetch(`/api/lms/tenants/${tenantId}/batches`, { headers: authHeaders() })
      .then((r) => r.json()).then((b) => { if (b.success) setBatches(b.data ?? []); });
    fetch(`/api/lms/tenants/${tenantId}/courses`, { headers: authHeaders() })
      .then((r) => r.json()).then((b) => { if (b.success) setCourses(b.data ?? []); });
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      const res = await fetch(
        `/api/lms/tenants/${form.tenantId}/courses/${form.courseId}/assign`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            batchId: form.batchId,
            ...(form.dueDate ? { dueDate: new Date(form.dueDate).toISOString() } : {}),
            isMandatory: form.isMandatory,
          }),
        }
      );
      const body = await res.json();
      if (!body.success) { setError(body.error?.message ?? "Gagal assign."); return; }
      setSuccess("✅ Kursus berhasil di-assign! Peserta batch otomatis terdaftar.");
      setForm((f) => ({ ...f, courseId: "", batchId: "", dueDate: "" }));
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
      {/* Left: form */}
      <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E5E5EA", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F", marginBottom: 18 }}>Assign Kursus ke Batch</h3>

        {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14 }}>{error}</div>}
        {success && <div style={{ background: "#DCFCE7", color: "#15803D", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14 }}>{success}</div>}

        <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>1. Pilih Tenant</label>
            <select id="assign-tenant-select" value={form.tenantId} onChange={(e) => handleTenantChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} required>
              <option value="">— Pilih perusahaan —</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>2. Pilih Batch</label>
            <select id="assign-batch-select" value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }} required disabled={!form.tenantId}>
              <option value="">— Pilih batch —</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b._count?.members ?? 0} peserta)</option>)}
            </select>
            {form.tenantId && batches.length === 0 && <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Belum ada batch. Buat di halaman detail tenant.</p>}
          </div>
          <div>
            <label style={labelStyle}>3. Pilih Kursus LMS</label>
            <select id="assign-course-select" value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }} required disabled={!form.tenantId}>
              <option value="">— Pilih kursus —</option>
              {courses.filter((c) => c.status === "published").map((c) => (
                <option key={c.id} value={c.id}>{c.title} ({c._count?.lessons ?? 0} pelajaran)</option>
              ))}
            </select>
            {form.tenantId && courses.filter((c) => c.status === "published").length === 0 && (
              <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Belum ada kursus published di tenant ini.</p>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Deadline (opsional)</label>
              <input id="assign-due-date-input" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ paddingBottom: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1D1D1F" }}>
                <input id="assign-mandatory-checkbox" type="checkbox" checked={form.isMandatory} onChange={(e) => setForm((f) => ({ ...f, isMandatory: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#0077A8" }} />
                Wajib
              </label>
            </div>
          </div>
          <button id="assign-submit-btn" type="submit" disabled={loading || !form.tenantId || !form.batchId || !form.courseId}
            style={{ padding: "11px 0", borderRadius: 12, background: "#0077A8", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: (loading || !form.tenantId || !form.batchId || !form.courseId) ? 0.5 : 1 }}>
            {loading ? "Menyimpan…" : "Assign & Auto-Enroll Peserta"}
          </button>
        </form>
      </div>

      {/* Right: info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "rgba(0,119,168,0.05)", borderRadius: 16, padding: 20, border: "1px solid rgba(0,119,168,0.15)" }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0077A8", marginBottom: 10 }}>ℹ️ Cara Kerja Assignment</h4>
          <ol style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 8, color: "#374151", fontSize: 13, lineHeight: 1.5 }}>
            <li>Pilih tenant (perusahaan/institusi klien)</li>
            <li>Pilih batch peserta yang akan menerima kursus</li>
            <li>Pilih kursus LMS yang sudah di-publish</li>
            <li>Set deadline dan toggle wajib/opsional</li>
            <li>Klik Assign — <strong>semua anggota batch otomatis di-enroll</strong></li>
          </ol>
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #E5E5EA" }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1D1D1F", marginBottom: 10 }}>📊 Ringkasan Tenant Aktif</h4>
          {tenants.filter((t) => t.isActive).length === 0
            ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>Belum ada tenant aktif.</p>
            : tenants.filter((t) => t.isActive).slice(0, 5).map((t) => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: "#1D1D1F" }}>{t.name}</span>
                <span style={{ color: "#9CA3AF", fontSize: 11 }}>{t._count?.courses ?? 0} kursus · {t._count?.enrollments ?? 0} enrolled</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#1D1D1F", marginBottom: 5 };

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminLMSPage() {
  const [activeTab, setActiveTab] = useState<"tenants" | "workshop">("tenants");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const limit = 10;

  const loadTenants = useCallback((p: number) => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    fetch(`/api/lms/tenants?page=${p}&limit=${limit}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setTenants(Array.isArray(body.data) ? body.data : body.data?.tenants ?? []);
          setTotal(body.meta?.total ?? body.data?.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadTenants(page); }, [page, loadTenants]);

  async function toggleActive(id: string, current: boolean) {
    const token = getToken();
    if (!token) return;
    await fetch(`/api/lms/tenants/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    loadTenants(page);
  }

  const totalPages = Math.ceil(total / limit);
  const activeTenants = tenants.filter((t) => t.isActive).length;
  const totalSeats = tenants.reduce((s, t) => s + t.seatLimit, 0);
  const totalEnrolled = tenants.reduce((s, t) => s + (t._count?.enrollments ?? 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1D1D1F" }}>LMS B2B</h1>
          <p style={{ fontSize: 13, color: "#6E6E73", marginTop: 3 }}>{total.toLocaleString("id-ID")} perusahaan / institusi</p>
        </div>
        {activeTab === "tenants" && (
          <button id="lms-create-tenant-btn" onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 12, background: "#0077A8", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Plus size={15} aria-hidden="true" /> Buat Tenant Baru
          </button>
        )}
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Total Tenant", value: total, color: "#0077A8", icon: Building2 },
          { label: "Tenant Aktif", value: activeTenants, color: "#059669", icon: Users },
          { label: "Total Kursi", value: totalSeats, color: "#7C3AED", icon: Layers },
          { label: "Total Enrolled", value: totalEnrolled, color: "#D97706", icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "18px 16px", display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} strokeWidth={1.75} style={{ color }} aria-hidden="true" />
            </span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color }}>{value.toLocaleString("id-ID")}</p>
              <p style={{ fontSize: 11, color: "#6E6E73", marginTop: 2 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #E5E5EA", paddingBottom: 0 }}>
        {([["tenants", "🏢 Tenants"], ["workshop", "⚙️ Workshop Assignment"]] as const).map(([tab, label]) => (
          <button
            id={`lms-tab-${tab}-btn`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
              color: activeTab === tab ? "#0077A8" : "#6E6E73",
              borderBottom: `3px solid ${activeTab === tab ? "#0077A8" : "transparent"}`,
              marginBottom: -2, transition: "all 0.18s",
            }}
            aria-current={activeTab === tab ? "true" : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Tenants */}
      {activeTab === "tenants" && (
        <>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <span style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #0077A8", borderTopColor: "transparent", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : tenants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 16, border: "1px solid #E5E5EA" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🏢</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1D1D1F", marginBottom: 4 }}>Belum ada tenant</p>
              <p style={{ fontSize: 13, color: "#6E6E73" }}>Klik "Buat Tenant Baru" untuk menambahkan perusahaan pertama.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              {tenants.map((t) => {
                const plan = PLAN_STYLE[t.planType] ?? PLAN_STYLE["trial"]!;
                const expired = t.trialEndsAt && new Date(t.trialEndsAt) < new Date();
                return (
                  <div key={t.id} style={{ background: "white", borderRadius: 18, padding: 20, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", opacity: t.isActive ? 1 : 0.65, transition: "all 0.22s" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#0a1628,#0077A8)", color: "white", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</p>
                        <p style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>/{t.slug}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <span style={{ ...plan, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{plan.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: expired ? "#FEE2E2" : t.isActive ? "#DCFCE7" : "#F3F4F6", color: expired ? "#DC2626" : t.isActive ? "#16A34A" : "#6B7280" }}>
                          {expired ? "Kadaluarsa" : t.isActive ? "Aktif" : "Non-aktif"}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
                      {[
                        { label: "Batch", value: t._count?.batches ?? 0 },
                        { label: "Kursus", value: t._count?.courses ?? 0 },
                        { label: "Enrolled", value: t._count?.enrollments ?? 0 },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: "#F9FAFB", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                          <p style={{ fontSize: 16, fontWeight: 800, color: "#1D1D1F" }}>{value}</p>
                          <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{label}</p>
                        </div>
                      ))}
                    </div>

                    {t.trialEndsAt && (
                      <p style={{ fontSize: 11, color: expired ? "#DC2626" : "#9CA3AF", marginBottom: 12 }}>
                        ⏰ {expired ? "Trial berakhir" : "Trial s/d"}: {new Date(t.trialEndsAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Link
                        href={`/admin/lms/${t.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, background: "#F5F5F7", color: "#1D1D1F", textDecoration: "none", fontSize: 12, fontWeight: 600 }}
                      >
                        Detail <ChevronRight size={12} aria-hidden="true" />
                      </Link>
                      <button
                        id={`lms-toggle-tenant-${t.id}-btn`}
                        onClick={() => toggleActive(t.id, t.isActive)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: t.isActive ? "#FEE2E2" : "#DCFCE7", color: t.isActive ? "#DC2626" : "#16A34A" }}
                      >
                        {t.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <button id="lms-prev-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #E5E5EA", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: page <= 1 ? 0.4 : 1 }}>← Prev</button>
              <span style={{ fontSize: 13, color: "#6E6E73" }}>{page} / {totalPages}</span>
              <button id="lms-next-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #E5E5EA", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: page >= totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Tab: Workshop Assignment */}
      {activeTab === "workshop" && <WorkshopAssignPanel />}

      {/* Create Tenant Modal */}
      {showCreate && (
        <CreateTenantModal onClose={() => setShowCreate(false)} onCreated={() => { loadTenants(1); setPage(1); }} />
      )}
    </div>
  );
}
