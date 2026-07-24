"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Award,
  BookMarked,
  Ticket,
  ShoppingBag,
  Crown,
  Handshake,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Settings,
} from "lucide-react";
import { getToken, setToken, clearToken, refreshAccessToken } from "@/lib/auth/token";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: Home, exact: true },
  { href: "/dashboard/kursus", label: "Kursus Saya", icon: BookOpen },
  { href: "/dashboard/sertifikat", label: "Sertifikat", icon: Award },
  { href: "/dashboard/ebook", label: "E-Book Saya", icon: BookMarked },
  { href: "/dashboard/tiket", label: "Tiket Event", icon: Ticket },
  { href: "/dashboard/pesanan", label: "Pesanan", icon: ShoppingBag },
  { href: "/dashboard/berlangganan", label: "Berlangganan", icon: Crown },
  { href: "/dashboard/afiliasi", label: "Afiliasi", icon: Handshake },
  { href: "/dashboard/profil", label: "Profil Saya", icon: User },
];

type UserInfo = {
  name: string;
  email: string;
  avatarUrl: string | null;
  roles?: {role: string}[];
  subscription?: { status: string; expiresAt: string } | null;
};
type LmsTenant = { id: string; name: string; slug: string };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lmsTenants, setLmsTenants] = useState<LmsTenant[]>([]);

  useEffect(() => {
    async function initAuth() {
      let token = getToken();
      if (!token) { router.replace("/masuk"); return; }

      // Sync from localStorage to sessionStorage if needed
      if (!sessionStorage.getItem("access_token") && token) {
        setToken(token);
      }

      // Attempt to fetch user info
      let res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);

      // If 401 → try token refresh once
      if (res && res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) { clearToken(); router.replace("/masuk"); return; }
        token = refreshed;
        res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
      }

      if (!res || !res.ok) { clearToken(); router.replace("/masuk"); return; }

      const body = await res.json();
      if (!body.success) { clearToken(); router.replace("/masuk"); return; }

      setUser(body.data);
      const roleNames: string[] = (body.data.roles ?? []).map(
        (r: { role: string } | string) => (typeof r === "string" ? r : r.role)
      );
      if (roleNames.some((r) => ["admin", "super_admin"].includes(r))) {
        router.replace("/admin/dashboard");
        return;
      }
      if (roleNames.includes("trainer")) {
        router.replace("/trainer-hub");
        return;
      }
      setIsAdmin(false);

      // Fetch LMS tenants for this user
      fetch("/api/lms/portal/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((b) => { if (b.success && Array.isArray(b.data)) setLmsTenants(b.data); })
        .catch(() => {});
    }
    initAuth();
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/masuk");
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="dashboard-root">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/" className="sidebar-logo-link">
            <Image src="/logo.png" alt="Jago Akademi" width={120} height={32} className="sidebar-logo-img" />
          </Link>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* User card mini */}
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.name} width={40} height={40} className="sidebar-avatar-img" />
            ) : (
              <span className="sidebar-avatar-initials">{initials}</span>
            )}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>{user?.name ?? "Memuat..."}</span>
              {user?.subscription?.status === "active" && (
                <span className="pro-badge">PRO</span>
              )}
            </p>
            <p className="sidebar-user-email">{user?.email ?? ""}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Menu Dashboard">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "sidebar-nav-active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="sidebar-nav-icon" size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* LMS Portal shortcut (only for LMS members) */}
        {lmsTenants.length > 0 && (
          <div className="sidebar-admin-wrap">
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 12px", marginBottom: 4 }}>LMS Portal</p>
            {lmsTenants.map((t) => (
              <a key={t.id} href={`/lms/${t.slug}`} className="sidebar-admin-link" style={{ gap: 8 }}>
                <GraduationCap size={16} aria-hidden="true" />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
              </a>
            ))}
          </div>
        )}

        {/* Admin Panel shortcut (only for admins) */}
        {isAdmin && (
          <div className="sidebar-admin-wrap">
            <a href="/admin/dashboard" className="sidebar-admin-link">
              <Settings size={16} aria-hidden="true" />
              <span>Admin Panel</span>
            </a>
          </div>
        )}

        {/* Logout */}
        <div className="sidebar-footer">
          <button onClick={logout} className="sidebar-logout-btn">
            <LogOut className="sidebar-nav-icon" size={18} aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="dashboard-main">
        {/* Mobile topbar */}
        <header className="dashboard-topbar">
          <button
            className="topbar-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          <Link href="/" className="topbar-logo">
            <Image src="/logo.png" alt="Jago Akademi" width={100} height={26} />
          </Link>
          <div className="topbar-avatar">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user?.name ?? ""} width={32} height={32} className="topbar-avatar-img" />
            ) : (
              <span className="topbar-avatar-initials">{initials}</span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="dashboard-content" id="main-content">
          {children}
        </main>
      </div>

      <style jsx global>{`
        /* ── Pro Badge ── */
        .pro-badge {
          background: #EBE5FC;
          color: #7C3AED;
          font-size: 9px;
          font-weight: 800;
          padding: 1.5px 5px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          border: 1px solid rgba(124, 58, 237, 0.2);
          display: inline-block;
          line-height: 1;
        }

        /* ── Root layout ── */
        .dashboard-root {
          display: flex;
          min-height: 100vh;
          background: #F5F5F7;
          font-family: 'Inter', sans-serif;
        }

        /* ── Sidebar (light) ── */
        .dashboard-sidebar {
          width: 260px;
          min-height: 100vh;
          background: #FFFFFF;
          border-right: 1px solid #E5E5E5;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 50;
          transition: transform 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(29,29,31,0.4);
          backdrop-filter: blur(2px);
          z-index: 40;
          display: none;
        }

        .sidebar-logo {
          padding: 20px 20px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #E5E5E5;
        }

        .sidebar-logo-link { display: flex; align-items: center; }
        .sidebar-logo-img { height: 28px; width: auto; }

        .sidebar-close-btn {
          display: none;
          color: #6E6E73;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          align-items: center;
          justify-content: center;
        }
        .sidebar-close-btn:hover { color: #1D1D1F; }

        .sidebar-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #E5E5E5;
          background: #FAFAFA;
        }

        .sidebar-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077A8, #CC0052);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid #FFFFFF;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .sidebar-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .sidebar-avatar-initials { color: white; font-size: 14px; font-weight: 700; }

        .sidebar-user-info { min-width: 0; }
        .sidebar-user-name {
          color: #1D1D1F;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-user-email {
          color: #6E6E73;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          color: #636366;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .sidebar-nav-item:hover {
          background: #F5F5F7;
          color: #1D1D1F;
        }

        .sidebar-nav-active {
          background: rgba(0, 212, 255, 0.08);
          color: #0077A8 !important;
          font-weight: 600;
          box-shadow: inset 3px 0 0 #0077A8;
        }

        .sidebar-nav-icon { width: 18px; height: 18px; flex-shrink: 0; }

        .sidebar-admin-wrap {
          padding: 8px 12px;
          border-top: 1px solid #E5E5E5;
        }
        .sidebar-admin-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          color: #B45309;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          background: rgba(245, 158, 11, 0.1);
          transition: all 0.18s;
        }
        .sidebar-admin-link:hover {
          background: rgba(245, 158, 11, 0.18);
          color: #92400E;
        }

        .sidebar-footer {
          padding: 12px 12px 20px;
          border-top: 1px solid #E5E5E5;
        }

        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          color: #DC2626;
          font-size: 13.5px;
          font-weight: 500;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.18s;
        }
        .sidebar-logout-btn:hover {
          background: rgba(220, 38, 38, 0.08);
          color: #B91C1C;
        }

        /* ── Main area ── */
        .dashboard-main {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* ── Mobile topbar (hidden on desktop) ── */
        .dashboard-topbar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #FFFFFF;
          position: sticky;
          top: 0;
          z-index: 30;
          border-bottom: 1px solid #E5E5E5;
        }

        .topbar-hamburger {
          background: none;
          border: none;
          color: #1D1D1F;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .topbar-logo { display: flex; align-items: center; }
        .topbar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077A8, #CC0052);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .topbar-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .topbar-avatar-initials { color: white; font-size: 12px; font-weight: 700; }

        .dashboard-content {
          flex: 1;
          padding: 28px 32px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
          .sidebar-overlay {
            display: block;
          }
          .sidebar-close-btn {
            display: flex;
          }
          .dashboard-main {
            margin-left: 0;
          }
          .dashboard-topbar {
            display: flex;
          }
          .dashboard-content {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
}
