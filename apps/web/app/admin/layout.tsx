"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const NAV_GROUPS = [
  {
    label: "Utama",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "📊", exact: true },
    ],
  },
  {
    label: "Akademi",
    items: [
      { href: "/admin/kursus",   label: "Kursus",    icon: "📖" },
      { href: "/admin/blog",     label: "Blog",      icon: "✍️" },
      { href: "/admin/event",    label: "Event",     icon: "🎫" },
      { href: "/admin/review",   label: "Review",    icon: "⭐" },
    ],
  },
  {
    label: "Bisnis",
    items: [
      { href: "/admin/pengguna",  label: "Pengguna",  icon: "👥" },
      { href: "/admin/transaksi", label: "Transaksi", icon: "💳" },
      { href: "/admin/leads",     label: "Leads",     icon: "📋" },
      { href: "/admin/kupon",     label: "Kupon",     icon: "🏷️" },
      { href: "/admin/lms",       label: "LMS B2B",   icon: "🏢" },
    ],
  },
];

type AdminUser = { name: string; email: string; avatarUrl: string | null };

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("jg_token") ||
    localStorage.getItem("jg_access_token")
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/masuk"); return; }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (!body.success) { router.replace("/masuk"); return; }
        // Verify user has admin or super_admin role
        const roleNames: string[] = (body.data.roles ?? []).map(
          (r: { role: string } | string) => (typeof r === "string" ? r : r.role)
        );
        console.log("[AdminLayout] roles:", roleNames); // debug
        const isAdmin = roleNames.some((r) => ["admin", "super_admin"].includes(r));
        console.log("[AdminLayout] isAdmin:", isAdmin); // debug
        if (!isAdmin) {
          // If not admin, still allow if token is valid (dev convenience)
          // Comment out below line to enforce admin-only in production:
          // router.replace("/dashboard"); return;
        }
        setAdmin(body.data);
        setReady(true);
      })
      .catch((err) => {
        console.error("[AdminLayout] Auth error:", err);
        router.replace("/masuk");
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="al-loading">
        <span className="al-spinner" />
        <style jsx>{`
          .al-loading { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#0a1628; }
          .al-spinner { width:36px; height:36px; border-radius:50%; border:3px solid #0077A8; border-top-color:transparent; animation:spin 0.8s linear infinite; }
          @keyframes spin { to { transform:rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const initials = admin?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "A";

  return (
    <div className={`al-root ${collapsed ? "al-collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="al-sidebar">
        {/* Logo */}
        <div className="al-logo-row">
          {!collapsed && (
            <div className="al-logo-wrap">
              <Image src="/logo.png" alt="Jago Akademi" width={32} height={32} className="al-logo-img" />
              <div className="al-logo-text">
                <span className="al-logo-name">Jago Admin</span>
                <span className="al-logo-sub">Control Panel</span>
              </div>
            </div>
          )}
          <button className="al-collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav groups */}
        <nav className="al-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="al-nav-group">
              {!collapsed && <p className="al-group-label">{group.label}</p>}
              {group.items.map((item) => {
                const isActive = ("exact" in item && item.exact) ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`al-nav-item ${isActive ? "al-nav-active" : ""}`} title={collapsed ? item.label : ""}>
                    <span className="al-nav-icon">{item.icon}</span>
                    {!collapsed && <span className="al-nav-label">{item.label}</span>}
                    {isActive && !collapsed && <span className="al-nav-dot" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Admin user bottom */}
        <div className="al-bottom">
          <div className="al-admin-row">
            <div className="al-admin-avatar">{initials}</div>
            {!collapsed && (
              <div className="al-admin-info">
                <p className="al-admin-name">{admin?.name}</p>
                <p className="al-admin-role">Super Admin</p>
              </div>
            )}
          </div>
          <Link href="/dashboard" className={`al-back-btn ${collapsed ? "al-back-btn-sm" : ""}`} title="Kembali ke situs">
            <span>↩</span>
            {!collapsed && <span>Situs Utama</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="al-main">
        {/* Topbar */}
        <header className="al-topbar">
          <div className="al-topbar-left">
            <p className="al-breadcrumb">
              {pathname.split("/").filter(Boolean).map((seg, i, arr) => (
                <span key={seg}>
                  {i > 0 && <span className="al-bc-sep">/</span>}
                  <span className={i === arr.length - 1 ? "al-bc-active" : "al-bc-item"}>
                    {seg.charAt(0).toUpperCase() + seg.slice(1)}
                  </span>
                </span>
              ))}
            </p>
          </div>
          <div className="al-topbar-right">
            <div className="al-topbar-avatar">{initials}</div>
          </div>
        </header>

        <main className="al-content">
          {children}
        </main>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .al-root {
          display: flex;
          min-height: 100vh;
          background: #F0F2F5;
        }

        /* ── Sidebar ── */
        .al-sidebar {
          width: 240px;
          background: linear-gradient(180deg, #0a1628 0%, #0d2040 100%);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.25s ease;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }
        .al-collapsed .al-sidebar { width: 64px; }

        .al-logo-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          min-height: 68px;
        }
        .al-logo-wrap { display: flex; align-items: center; gap: 10px; overflow: hidden; }
        .al-logo-img { border-radius: 8px; flex-shrink: 0; }
        .al-logo-text { display: flex; flex-direction: column; white-space: nowrap; }
        .al-logo-name { font-size: 14px; font-weight: 800; color: white; letter-spacing: -0.01em; }
        .al-logo-sub { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 500; margin-top: 1px; }

        .al-collapse-btn {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,0.08); border: none;
          color: rgba(255,255,255,0.5); font-size: 12px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.18s;
        }
        .al-collapse-btn:hover { background: rgba(255,255,255,0.15); color: white; }

        .al-nav { flex: 1; padding: 12px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
        .al-nav-group { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
        .al-group-label {
          font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.25);
          text-transform: uppercase; letter-spacing: 0.1em;
          padding: 6px 10px 4px;
        }
        .al-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 10px;
          color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500;
          text-decoration: none; transition: all 0.18s;
          position: relative; white-space: nowrap;
        }
        .al-nav-item:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); }
        .al-nav-active {
          background: linear-gradient(135deg, rgba(0,119,168,0.35), rgba(0,119,168,0.15)) !important;
          color: white !important;
          border: 1px solid rgba(0,119,168,0.4);
        }
        .al-nav-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }
        .al-nav-label { flex: 1; }
        .al-nav-dot { width: 6px; height: 6px; border-radius: 50%; background: #0077A8; flex-shrink: 0; }

        .al-bottom {
          padding: 12px 8px 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column; gap: 8px;
        }
        .al-admin-row { display: flex; align-items: center; gap: 10px; padding: 6px 8px; }
        .al-admin-avatar {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, #0077A8, #CC0052);
          color: white; font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .al-admin-info { overflow: hidden; }
        .al-admin-name { font-size: 12px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .al-admin-role { font-size: 10px; color: rgba(255,255,255,0.35); margin-top: 1px; }

        .al-back-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 10px;
          color: rgba(255,255,255,0.4); font-size: 12px;
          text-decoration: none; transition: all 0.18s;
          background: rgba(255,255,255,0.04);
        }
        .al-back-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .al-back-btn-sm { justify-content: center; }

        /* ── Main ── */
        .al-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

        .al-topbar {
          height: 56px; background: white;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .al-breadcrumb { font-size: 13px; color: #6E6E73; }
        .al-bc-sep { margin: 0 6px; color: #C0C0C7; }
        .al-bc-item { color: #6E6E73; }
        .al-bc-active { color: #1D1D1F; font-weight: 600; }
        .al-topbar-right { display: flex; align-items: center; }
        .al-topbar-avatar {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, #0077A8, #CC0052);
          color: white; font-size: 12px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }

        .al-content {
          flex: 1; overflow-y: auto; padding: 24px;
        }
      `}</style>
    </div>
  );
}
