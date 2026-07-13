"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "E-Course", href: "/e-course" },
  { label: "Event", href: "/event" },
  {
    label: "Produk",
    href: "#",
    children: [
      { label: "E-Book",             href: "/ebook",           desc: "Buku digital berkualitas" },
      { label: "Kelas Gratis",       href: "/kelas-gratis",    desc: "Mulai belajar tanpa biaya" },
      { label: "Trainer Program",    href: "/trainer-program", desc: "Jadilah trainer profesional" },
      { label: "Paket LMS",          href: "/clients",         desc: "LMS untuk institusi & perusahaan" },
      { label: "Marketplace Materi", href: "/marketplace",     desc: "Rekaman & modul event" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Tentang", href: "/about" },
];

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("jg_token") ||
    localStorage.getItem("jg_access_token")
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const mobileMenuId = "mobile-nav-menu";
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check login state from token
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setIsLoggedIn(true);
          const name: string = body.data?.name ?? "";
          setUserInitials(
            name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "U"
          );
        }
      })
      .catch(() => {});
  }, []);

  const openDropdown = useCallback((label: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveDropdown(label);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-dark border-b border-[#E5E5E5] shadow-e1"
          : "bg-transparent"
      )}
    >
      <nav className="container-pad flex items-center justify-between h-16 md:h-[4.5rem]" aria-label="Navigasi utama">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-32 h-9">
            <Image
              src="/logo.png"
              alt="Jago Akademi"
              fill
              sizes="128px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {navLinks.map((link) =>
            link.children ? (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() => openDropdown(link.label)}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === link.label}
                  onClick={() =>
                    setActiveDropdown(activeDropdown === link.label ? null : link.label)
                  }
                  onFocus={() => openDropdown(link.label)}
                  onBlur={scheduleClose}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn(
                      "transition-transform duration-200",
                      activeDropdown === link.label && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown */}
                {activeDropdown === link.label && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 pt-2"
                    onMouseEnter={() => openDropdown(link.label)}
                    onMouseLeave={scheduleClose}
                    onFocus={() => openDropdown(link.label)}
                    onBlur={scheduleClose}
                  >
                    <div className="card-glow min-w-[220px] p-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          role="menuitem"
                          className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-[#F5F5F7] transition-colors group"
                        >
                          <span className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#0077A8] transition-colors">
                            {child.label}
                          </span>
                          <span className="text-xs text-[#6E6E73]">{child.desc}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={pathname.startsWith(link.href) && link.href !== "#" ? "page" : undefined}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname.startsWith(link.href) && link.href !== "#"
                      ? "text-[#1D1D1F] bg-[#F5F5F7]"
                      : "text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/kolaborasi"
            className="flex items-center gap-1.5 text-sm font-medium text-[#636366] hover:text-[#0077A8] transition-colors"
          >
            <Sparkles size={14} aria-hidden="true" />
            Kolaborasi
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                aria-label="Profil saya"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0077A8] text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                {userInitials}
              </Link>
            </>
          ) : (
            <>
              <Link href="/masuk" className="btn btn-ghost btn-sm">
                Masuk
              </Link>
              <Link href="/daftar" className="btn btn-primary btn-sm">
                Mulai Gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={isMobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isMobileOpen}
          aria-controls={mobileMenuId}
          className="md:hidden p-2 rounded-lg text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div
          id={mobileMenuId}
          role="dialog"
          aria-label="Menu navigasi mobile"
          className="md:hidden border-t border-[#E5E5E5] bg-white/95 backdrop-blur-dark"
        >
          <div className="container-pad py-4 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#6E6E73]">
                    {link.label}
                  </p>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-3 py-2.5 rounded-lg text-sm text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={pathname.startsWith(link.href) && link.href !== "#" ? "page" : undefined}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname.startsWith(link.href) && link.href !== "#"
                      ? "text-[#1D1D1F] bg-[#F5F5F7]"
                      : "text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-[#E5E5E5] flex flex-col gap-2">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn btn-primary w-full justify-center" onClick={() => setIsMobileOpen(false)}>
                  Dashboard Saya
                </Link>
              ) : (
                <>
                  <Link href="/masuk" className="btn btn-ghost w-full justify-center" onClick={() => setIsMobileOpen(false)}>
                    Masuk
                  </Link>
                  <Link href="/daftar" className="btn btn-primary w-full justify-center" onClick={() => setIsMobileOpen(false)}>
                    Mulai Gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
