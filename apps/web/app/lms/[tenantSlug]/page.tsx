"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle2, Award, BarChart3, Home, Folder, Trophy, User } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CourseProgress = {
  courseId: string;
  courseTitle: string;
  description: string | null;
  totalLessons: number;
  completedLessons: number;
  completionPct: number;
  isCompleted: boolean;
  enrolledAt: string;
  dueDate?: string | null;
  isMandatory?: boolean;
  certificate: { issuedAt: string } | null;
};

type TenantInfo = {
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ slug, tenant }: { slug: string; tenant: TenantInfo | null }) {
  const primary = tenant?.primaryColor ?? "#0077A8";
  const navItems = [
    { href: `/lms/${slug}`,              icon: Home,     label: "Beranda" },
    { href: `/lms/${slug}/courses`,      icon: Folder,   label: "Kursus Saya" },
    { href: `/lms/${slug}/certificates`, icon: Trophy,   label: "Sertifikat" },
    { href: `/lms/${slug}/profile`,      icon: User,     label: "Profil" },
  ];

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: "white",
      borderRight: "1px solid #E5E5EA",
      display: "flex", flexDirection: "column", minHeight: "100vh",
      position: "sticky", top: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 18px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>
            {(tenant?.name ?? "LMS").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1D1D1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tenant?.name ?? slug}</p>
            <p style={{ fontSize: 10, color: "#9CA3AF" }}>LMS Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = typeof window !== "undefined" && window.location.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10, marginBottom: 2,
                textDecoration: "none", fontSize: 13, fontWeight: 600,
                background: isActive ? `${primary}15` : "transparent",
                color: isActive ? primary : "#6E6E73",
                transition: "all 0.15s",
              }}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Back to Dashboard */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 6 }}>
        <Link href="/dashboard" style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
          ← Kembali ke Dashboard
        </Link>
        <Link href="/" style={{ fontSize: 11, color: "#C4C4C6", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
          ↖ Jago Akademi
        </Link>
      </div>
    </aside>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ courses, primary }: { courses: CourseProgress[]; primary: string }) {
  const completed = courses.filter((c) => c.isCompleted).length;
  const active = courses.filter((c) => !c.isCompleted).length;
  const avgPct = courses.length > 0 ? Math.round(courses.reduce((s, c) => s + c.completionPct, 0) / courses.length) : 0;
  const certs = courses.filter((c) => c.certificate).length;

  const stats = [
    { label: "Kursus Selesai", value: completed, icon: CheckCircle2, color: "#059669" },
    { label: "Kursus Aktif", value: active, icon: BookOpen, color: primary },
    { label: "Rata-rata Progress", value: `${avgPct}%`, icon: BarChart3, color: "#7C3AED" },
    { label: "Sertifikat", value: certs, icon: Award, color: "#D97706" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} style={{ background: "white", borderRadius: 16, padding: "16px 14px", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={16} strokeWidth={1.75} style={{ color }} aria-hidden="true" />
          </span>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color }}>{value}</p>
            <p style={{ fontSize: 10, color: "#6E6E73", marginTop: 1 }}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ c, slug, primary }: { c: CourseProgress; slug: string; primary: string }) {
  const now = new Date();
  const overdue = c.dueDate && !c.isCompleted && new Date(c.dueDate) < now;
  const dueSoon = c.dueDate && !c.isCompleted && !overdue && (new Date(c.dueDate).getTime() - now.getTime()) < 7 * 86400000;

  return (
    <Link
      href={`/lms/${slug}/courses/${c.courseId}`}
      style={{ display: "block", textDecoration: "none" }}
    >
      <article style={{
        background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 18,
        padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", transition: "all 0.2s",
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"; }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F", lineHeight: 1.3 }}>{c.courseTitle}</h3>
              {c.isCompleted && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#DCFCE7", color: "#16A34A" }}>✓ Selesai</span>
              )}
              {c.isMandatory && !c.isCompleted && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: `${primary}18`, color: primary }}>Wajib</span>
              )}
              {overdue && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#FEE2E2", color: "#DC2626" }}>Terlambat</span>
              )}
              {dueSoon && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "rgba(234,179,8,0.12)", color: "#A16207" }}>Deadline dekat</span>
              )}
            </div>
            {c.description && (
              <p style={{ fontSize: 12, color: "#6E6E73", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</p>
            )}
          </div>
          {c.certificate && (
            <span style={{ fontSize: 18, flexShrink: 0 }} title={`Sertifikat diterbitkan ${new Date(c.certificate.issuedAt).toLocaleDateString("id-ID")}`}>🏆</span>
          )}
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, background: "#F3F4F6", borderRadius: 999, height: 6 }}>
            <div style={{ height: 6, borderRadius: 999, width: `${c.completionPct}%`, background: c.isCompleted ? "#34D399" : primary, transition: "width 0.5s ease" }} />
          </div>
          <span style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap", minWidth: 80, textAlign: "right" }}>
            {c.completedLessons}/{c.totalLessons} pelajaran
          </span>
        </div>

        {c.dueDate && (
          <p style={{ fontSize: 11, color: overdue ? "#DC2626" : "#9CA3AF", marginTop: 8 }}>
            📅 Deadline: {new Date(c.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}
      </article>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LmsPortalHomePage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [meRes, coursesRes] = await Promise.all([
        fetch("/api/lms/portal/me"),
        fetch(`/api/lms/portal/${tenantSlug}/courses`),
      ]);
      const [meData, coursesData] = await Promise.all([meRes.json(), coursesRes.json()]);

      const myTenant = meData.data?.find((t: { slug: string; name: string; logoUrl: string | null; primaryColor: string }) => t.slug === tenantSlug);
      if (myTenant) setTenant(myTenant);
      setCourses(coursesData.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, [tenantSlug]);

  const primary = tenant?.primaryColor ?? "#0077A8";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB", fontFamily: "inherit" }}>
      {/* Sidebar */}
      <Sidebar slug={tenantSlug} tenant={tenant} />

      {/* Main */}
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: "calc(100% - 220px)" }}>
        {/* Header greeting */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1D1F", marginBottom: 4 }}>
            Selamat belajar! 👋
          </h1>
          <p style={{ fontSize: 14, color: "#6E6E73" }}>
            {tenant ? `Portal belajar ${tenant.name}` : "Memuat portal…"}
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${primary}`, borderTopColor: "transparent", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <StatsBar courses={courses} primary={primary} />

            {/* Course grid */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F" }}>Kursus Saya</h2>
              <Link href={`/lms/${tenantSlug}/certificates`} style={{ fontSize: 13, color: primary, textDecoration: "none", fontWeight: 600 }}>
                Sertifikat Saya →
              </Link>
            </div>

            {courses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E5E5EA" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>📚</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", marginBottom: 8 }}>Belum ada kursus</p>
                <p style={{ fontSize: 13, color: "#6E6E73" }}>Kamu belum terdaftar di kursus apapun.</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Hubungi admin perusahaan untuk mendapatkan akses kursus.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                {courses.map((c) => (
                  <CourseCard key={c.courseId} c={c} slug={tenantSlug} primary={primary} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
