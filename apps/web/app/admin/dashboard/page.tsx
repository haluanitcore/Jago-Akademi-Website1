"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth/token";

type Stats = {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  pendingCourses: number;
  totalEvents: number;
  activeSubscriptions: number;
  totalAffiliates: number;
};

type RecentOrder = {
  id: string;
  finalAmount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { itemTitle: string | null; itemType: string }[];
};

type PopularCourse = {
  id: string;
  title: string;
  totalEnrolled: number;
  avgRating: string;
  price: string;
  trainer: { name: string };
};

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
};


export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [courses, setCourses] = useState<PopularCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState<number | null>(null);
  const [now] = useState(new Date());

  const greeting = now.getHours() < 12 ? "Selamat Pagi" : now.getHours() < 17 ? "Selamat Siang" : "Selamat Malam";

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/admin/stats", { headers: h }).then((r) => r.json()),
      fetch("/api/admin/orders?limit=6&sort=createdAt:desc", { headers: h }).then((r) => r.json()),
      fetch("/api/admin/courses?limit=5&sort=totalEnrolled:desc", { headers: h }).then((r) => r.json()),
      fetch("/api/admin/leads?status=new&limit=1", { headers: h }).then((r) => r.json()),
    ])
      .then(([s, o, c, l]) => {
        if (s.success) setStats(s.data);
        if (o.success) setOrders(o.data ?? []);
        if (c.success) setCourses(c.data ?? []);
        if (l.success) setNewLeadsCount(l.meta?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const KPI_CARDS = stats
    ? [
        { label: "Total Pengguna",     value: stats.totalUsers,          icon: "👥", color: "#0077A8", bg: "#E8F4F9", change: "+12%" },
        { label: "Kursus Aktif",       value: stats.totalCourses,        icon: "📖", color: "#7C3AED", bg: "#EDE9FE", change: "+3%" },
        { label: "Total Pendaftaran",  value: stats.totalEnrollments,    icon: "🎓", color: "#059669", bg: "#D1FAE5", change: "+8%" },
        { label: "Total Pendapatan",   value: null, revenue: stats.totalRevenue, icon: "💰", color: "#DC2626", bg: "#FEE2E2", change: "+22%" },
        { label: "Langganan Aktif",    value: stats.activeSubscriptions, icon: "⭐", color: "#F59E0B", bg: "#FEF3C7", change: "+5%" },
        { label: "Event Berlangsung",  value: stats.totalEvents,         icon: "🎫", color: "#CC0052", bg: "#FFE4EF", change: "0%" },
        { label: "Afiliator",          value: stats.totalAffiliates,     icon: "🤝", color: "#0D9488", bg: "#CCFBF1", change: "+18%" },
        { label: "Kursus Menunggu",    value: stats.pendingCourses,      icon: "⏳", color: "#6B7280", bg: "#F3F4F6", change: "" },
      ]
    : [];

  if (loading) {
    return (
      <div className="adm-loading">
        <span className="adm-spinner" />
        <style jsx>{`.adm-loading{display:flex;justify-content:center;align-items:center;min-height:50vh;}.adm-spinner{width:36px;height:36px;border-radius:50%;border:3px solid #0077A8;border-top-color:transparent;animation:spin 0.8s linear infinite;}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div className="adp-page">
      {/* Header */}
      <div className="adp-header">
        <div>
          <h1 className="adp-title">{greeting}, Admin 👋</h1>
          <p className="adp-sub">
            {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="adp-header-actions">
          <Link href="/admin/kursus" className="adp-action-btn adp-btn-outline">+ Tambah Kursus</Link>
          <Link href="/admin/pengguna" className="adp-action-btn adp-btn-primary">Kelola Pengguna</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="adp-kpi-grid">
        {KPI_CARDS.map(({ label, value, revenue, icon, color, bg, change }) => (
          <div key={label} className="adp-kpi-card">
            <div className="adp-kpi-top">
              <div className="adp-kpi-icon" style={{ background: bg }}>
                <span>{icon}</span>
              </div>
              {change && (
                <span className={`adp-kpi-change ${change.startsWith("-") ? "adp-change-neg" : "adp-change-pos"}`}>
                  {change.startsWith("+") ? "↑" : change.startsWith("-") ? "↓" : "→"} {change}
                </span>
              )}
            </div>
            <p className="adp-kpi-value" style={{ color }}>
              {revenue !== undefined
                ? `Rp ${revenue.toLocaleString("id-ID")}`
                : (value ?? 0).toLocaleString("id-ID")}
            </p>
            <p className="adp-kpi-label">{label}</p>
          </div>
        ))}
      </div>

      {/* Two columns: Recent Orders + Popular Courses */}
      <div className="adp-grid2">
        {/* Recent Transactions */}
        <div className="adp-card">
          <div className="adp-card-header">
            <h2 className="adp-card-title">Transaksi Terbaru</h2>
            <Link href="/admin/transaksi" className="adp-card-link">Lihat Semua →</Link>
          </div>

          {orders.length === 0 ? (
            <p className="adp-empty">Belum ada transaksi.</p>
          ) : (
            <div className="adp-order-list">
              {orders.map((order) => {
                const title = order.items[0]?.itemTitle ?? "—";
                const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.expired;
                return (
                  <div key={order.id} className="adp-order-row">
                    <div className="adp-order-avatar">
                      {order.user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="adp-order-info">
                      <p className="adp-order-name">{order.user.name}</p>
                      <p className="adp-order-product">{title}</p>
                    </div>
                    <div className="adp-order-right">
                      <p className="adp-order-amount">Rp {Number(order.finalAmount).toLocaleString("id-ID")}</p>
                      <span className={`adp-order-badge ${badge}`}>{order.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular Courses */}
        <div className="adp-card">
          <div className="adp-card-header">
            <h2 className="adp-card-title">Kursus Terpopuler</h2>
            <Link href="/admin/kursus" className="adp-card-link">Kelola →</Link>
          </div>

          {courses.length === 0 ? (
            <p className="adp-empty">Belum ada kursus.</p>
          ) : (
            <div className="adp-course-list">
              {courses.map((course, i) => (
                <div key={course.id} className="adp-course-row">
                  <span className="adp-course-rank">#{i + 1}</span>
                  <div className="adp-course-info">
                    <p className="adp-course-title">{course.title}</p>
                    <p className="adp-course-trainer">{course.trainer.name}</p>
                  </div>
                  <div className="adp-course-stats">
                    <span className="adp-course-enrolled">🎓 {course.totalEnrolled}</span>
                    <span className="adp-course-rating">⭐ {parseFloat(course.avgRating).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leads Alert Widget */}
      <div className="adp-card" style={{ marginBottom: 0 }}>
        <div className="adp-card-header">
          <h2 className="adp-card-title">📋 Leads Masuk</h2>
          <Link href="/admin/leads" className="adp-card-link">Kelola Leads →</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "12px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: newLeadsCount && newLeadsCount > 0 ? "#FEF3C7" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📩</div>
          <div>
            <p style={{ fontSize: 28, fontWeight: 800, color: newLeadsCount && newLeadsCount > 0 ? "#D97706" : "#6B7280" }}>
              {newLeadsCount ?? "—"}
            </p>
            <p style={{ fontSize: 13, color: "#6E6E73" }}>
              {newLeadsCount === null ? "Memuat…" : newLeadsCount === 0 ? "Tidak ada leads baru saat ini" : `Leads baru menunggu follow-up`}
            </p>
          </div>
          {newLeadsCount !== null && newLeadsCount > 0 && (
            <Link href="/admin/leads?status=new" className="adp-action-btn adp-btn-primary" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>
              Tindak Lanjuti
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="adp-quick-grid">
        {[
          { href: "/admin/pengguna",  label: "Manajemen Pengguna",    icon: "👥",  desc: "Kelola akun & role" },
          { href: "/admin/kursus",    label: "Approval Kursus",       icon: "✅",  desc: "Review kursus baru" },
          { href: "/admin/leads",     label: "Leads CRM",             icon: "📋",  desc: "Follow-up prospek" },
          { href: "/admin/transaksi", label: "Laporan Keuangan",      icon: "📊",  desc: "Export & analisis" },
          { href: "/admin/kupon",     label: "Buat Kupon",            icon: "🏷️",  desc: "Diskon & promo" },
          { href: "/admin/event",     label: "Kelola Event",          icon: "🎫",  desc: "Seminar & workshop" },
          { href: "/admin/blog",      label: "Konten Blog",           icon: "✍️",  desc: "Artikel & SEO" },
          { href: "/admin/review",    label: "Moderasi Review",       icon: "⭐",  desc: "Approve ulasan" },
          { href: "/admin/lms",       label: "LMS B2B",               icon: "🏢",  desc: "Tenant & lisensi" },
        ].map(({ href, label, icon, desc }) => (
          <Link key={href} href={href} className="adp-quick-card">
            <span className="adp-quick-icon">{icon}</span>
            <div>
              <p className="adp-quick-label">{label}</p>
              <p className="adp-quick-desc">{desc}</p>
            </div>
            <span className="adp-quick-arrow">→</span>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .adp-page { display: flex; flex-direction: column; gap: 24px; max-width: 1200px; }

        .adp-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .adp-title { font-size: 22px; font-weight: 800; color: #1D1D1F; }
        .adp-sub { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .adp-header-actions { display: flex; gap: 10px; }
        .adp-action-btn { padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .adp-btn-outline { background: white; color: #0077A8; border: 1.5px solid #0077A8; }
        .adp-btn-outline:hover { background: #0077A8; color: white; }
        .adp-btn-primary { background: #0077A8; color: white; border: 1.5px solid #0077A8; }
        .adp-btn-primary:hover { background: #005f87; }

        /* KPI Cards */
        .adp-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .adp-kpi-card {
          background: white; border-radius: 18px; padding: 20px;
          border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: all 0.22s; cursor: default;
        }
        .adp-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .adp-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .adp-kpi-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .adp-kpi-change { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
        .adp-change-pos { background: #DCFCE7; color: #16A34A; }
        .adp-change-neg { background: #FEE2E2; color: #DC2626; }
        .adp-kpi-value { font-size: 22px; font-weight: 800; margin-bottom: 4px; line-height: 1; }
        .adp-kpi-label { font-size: 11px; color: #6E6E73; font-weight: 500; }

        /* 2-col grid */
        .adp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .adp-card {
          background: white; border-radius: 18px; padding: 20px 22px;
          border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .adp-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .adp-card-title { font-size: 14px; font-weight: 700; color: #1D1D1F; }
        .adp-card-link { font-size: 12px; color: #0077A8; text-decoration: none; font-weight: 600; }
        .adp-card-link:hover { text-decoration: underline; }
        .adp-empty { font-size: 13px; color: #9CA3AF; text-align: center; padding: 24px; }

        /* Orders */
        .adp-order-list { display: flex; flex-direction: column; gap: 10px; }
        .adp-order-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F5F5F7; }
        .adp-order-row:last-child { border-bottom: none; }
        .adp-order-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #0077A8, #CC0052);
          color: white; font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .adp-order-info { flex: 1; min-width: 0; }
        .adp-order-name { font-size: 13px; font-weight: 600; color: #1D1D1F; }
        .adp-order-product { font-size: 11px; color: #6E6E73; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adp-order-right { text-align: right; flex-shrink: 0; }
        .adp-order-amount { font-size: 13px; font-weight: 700; color: #1D1D1F; }
        .adp-order-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; display: inline-block; margin-top: 3px; }

        /* Courses */
        .adp-course-list { display: flex; flex-direction: column; gap: 10px; }
        .adp-course-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #F5F5F7; }
        .adp-course-row:last-child { border-bottom: none; }
        .adp-course-rank { font-size: 13px; font-weight: 800; color: #C0C0C7; width: 20px; text-align: center; flex-shrink: 0; }
        .adp-course-info { flex: 1; min-width: 0; }
        .adp-course-title { font-size: 13px; font-weight: 600; color: #1D1D1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adp-course-trainer { font-size: 11px; color: #6E6E73; margin-top: 1px; }
        .adp-course-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
        .adp-course-enrolled, .adp-course-rating { font-size: 11px; color: #6E6E73; }

        /* Quick Actions */
        .adp-quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .adp-quick-card {
          background: white; border-radius: 14px; padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          border: 1px solid rgba(0,0,0,0.06); text-decoration: none;
          transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .adp-quick-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); border-color: #0077A8; }
        .adp-quick-icon { font-size: 20px; flex-shrink: 0; }
        .adp-quick-label { font-size: 12px; font-weight: 700; color: #1D1D1F; }
        .adp-quick-desc { font-size: 10px; color: #9CA3AF; margin-top: 2px; }
        .adp-quick-arrow { font-size: 14px; color: #C0C0C7; margin-left: auto; flex-shrink: 0; }

        @media (max-width: 1100px) {
          .adp-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .adp-quick-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .adp-grid2 { grid-template-columns: 1fr; }
          .adp-kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
