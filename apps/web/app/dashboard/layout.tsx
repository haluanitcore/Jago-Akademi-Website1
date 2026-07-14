"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getToken, setToken, clearToken, refreshAccessToken } from "@/lib/auth/token";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: HomeIcon, exact: true },
  { href: "/dashboard/kursus", label: "Kursus Saya", icon: CourseIcon },
  { href: "/dashboard/sertifikat", label: "Sertifikat", icon: CertIcon },
  { href: "/dashboard/ebook", label: "E-Book Saya", icon: EbookIcon },
  { href: "/dashboard/tiket", label: "Tiket Event", icon: TicketIcon },
  { href: "/dashboard/pesanan", label: "Pesanan", icon: OrderIcon },
  { href: "/dashboard/berlangganan", label: "Berlangganan", icon: SubIcon },
  { href: "/dashboard/afiliasi", label: "Afiliasi", icon: AffiliateIcon },
  { href: "/dashboard/profil", label: "Profil Saya", icon: ProfileIcon },
];

type UserInfo = { name: string; email: string; avatarUrl: string | null; roles?: {role: string}[] };
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
      setIsAdmin(roleNames.some((r) => ["admin", "super_admin"].includes(r)));

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
            ✕
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
            <p className="sidebar-user-name">{user?.name ?? "Memuat..."}</p>
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
                <item.icon className="sidebar-nav-icon" />
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
                <span>📚</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
              </a>
            ))}
          </div>
        )}

        {/* Admin Panel shortcut (only for admins) */}
        {isAdmin && (
          <div className="sidebar-admin-wrap">
            <a href="/admin/dashboard" className="sidebar-admin-link">
              <span>⚙️</span>
              <span>Admin Panel</span>
            </a>
          </div>
        )}

        {/* Logout */}
        <div className="sidebar-footer">
          <button onClick={logout} className="sidebar-logout-btn">
            <LogoutIcon className="sidebar-nav-icon" />
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
            <HamburgerIcon />
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
        /* ── Root layout ── */
        .dashboard-root {
          display: flex;
          min-height: 100vh;
          background: #F0F4F8;
          font-family: 'Inter', sans-serif;
        }

        /* ── Sidebar ── */
        .dashboard-sidebar {
          width: 260px;
          min-height: 100vh;
          background: linear-gradient(180deg, #0a1628 0%, #0d1f3c 100%);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 50;
          transition: transform 0.3s ease;
          box-shadow: 4px 0 24px rgba(0,0,0,0.15);
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 40;
          display: none;
        }

        .sidebar-logo {
          padding: 20px 20px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-logo-link { display: flex; align-items: center; }
        .sidebar-logo-img { height: 28px; width: auto; }

        .sidebar-close-btn {
          display: none;
          color: rgba(255,255,255,0.5);
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
        }

        .sidebar-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
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
          border: 2px solid rgba(255,255,255,0.15);
        }

        .sidebar-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .sidebar-avatar-initials { color: white; font-size: 14px; font-weight: 700; }

        .sidebar-user-info { min-width: 0; }
        .sidebar-user-name {
          color: white;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-user-email {
          color: rgba(255,255,255,0.45);
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
          color: rgba(255,255,255,0.6);
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .sidebar-nav-item:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
        }

        .sidebar-nav-active {
          background: linear-gradient(135deg, rgba(0,119,168,0.35), rgba(204,0,82,0.2));
          color: white !important;
          border: 1px solid rgba(0,119,168,0.3);
        }

        .sidebar-nav-icon { width: 18px; height: 18px; flex-shrink: 0; }

        .sidebar-admin-wrap {
          padding: 8px 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .sidebar-admin-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          color: rgba(255,215,0,0.8);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          background: rgba(255,215,0,0.08);
          transition: all 0.18s;
        }
        .sidebar-admin-link:hover {
          background: rgba(255,215,0,0.15);
          color: gold;
        }

        .sidebar-footer {
          padding: 12px 12px 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          color: rgba(255,100,100,0.75);
          font-size: 13.5px;
          font-weight: 500;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.18s;
        }
        .sidebar-logout-btn:hover {
          background: rgba(255,100,100,0.1);
          color: #ff6464;
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
          background: #0a1628;
          position: sticky;
          top: 0;
          z-index: 30;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .topbar-hamburger {
          background: none;
          border: none;
          color: white;
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

/* ── Icon Components ── */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function CourseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function CertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
function EbookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  );
}
function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
function OrderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function SubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function AffiliateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function HamburgerIcon() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
