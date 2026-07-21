import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { waLink } from "@/lib/config";
import { features } from "@/lib/features";

const footerLinks = {
  Belajar: [
    { label: "Katalog Kursus",    href: "/e-course" },
    { label: "Event & Workshop",  href: "/event" },
    { label: "E-Book",            href: "/ebook" },
    { label: "Kelas Gratis",      href: "/kelas-gratis" },
    { label: "Marketplace Materi", href: "/marketplace" },
    { label: "Blog",              href: "/blog" },
  ],
  Program: [
    // Only surfaced once the private-class catalog ships (flag is build-time).
    ...(features.privateClass ? [{ label: "Private Class", href: "/kelas-privat" }] : []),
    { label: "Trainer Program",  href: "/trainer-program" },
    { label: "Program Afiliasi", href: "/afiliasi" },
    { label: "Paket LMS",        href: "/clients" },
    { label: "Kolaborasi",       href: "/kolaborasi" },
    // Community links — each only surfaces once its feature ships (build-time flags).
    ...(features.community ? [{ label: "Komunitas", href: "/komunitas" }] : []),
    ...(features.alumni ? [{ label: "Cerita Alumni", href: "/alumni" }] : []),
    ...(features.portfolio ? [{ label: "Portofolio Member", href: "/portofolio-member" }] : []),
  ],
  Perusahaan: [
    { label: "Tentang Kami",  href: "/about" },
    { label: "Hubungi Kami",  href: "/contact" },
    { label: "FAQ",           href: "/faq" },
  ],
};

const socials = [
  { label: "IG", text: "Instagram", href: "https://instagram.com/jagoakademi" },
  { label: "YT", text: "YouTube", href: "https://youtube.com/@jagoakademi" },
  { label: "LI", text: "LinkedIn", href: "https://linkedin.com/company/jagoakademi" },
  { label: "X", text: "Twitter/X", href: "https://twitter.com/jagoakademi" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
      {/* Main footer */}
      <div className="container-pad py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/">
              <div className="relative w-36 h-10">
                <Image
                  src="/logo.png"
                  alt="Jago Akademi"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm text-[#636366] leading-relaxed max-w-xs">
              Platform edukasi digital terlengkap Indonesia. Belajar, berlatih, dan
              berkarier bersama ribuan profesional.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socials.map(({ label, text, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={text}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E5E5] text-[#636366] hover:text-[#0077A8] hover:border-[rgba(0,119,168,0.3)] hover:bg-[rgba(0,212,255,0.06)] transition-all duration-200 text-[10px] font-bold shadow-e1"
                >
                  {label}
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1D1D1F] hover:text-[#0077A8] transition-colors group"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Chat WhatsApp
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`Navigasi ${category}`} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#6E6E73]">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#636366] hover:text-[#1D1D1F] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="divider-gradient" />

      {/* Bottom bar */}
      <div className="container-pad py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[#6E6E73]">
          © 2025–2026 Jago Akademi. Hak cipta dilindungi.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs text-[#6E6E73] hover:text-[#636366] transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="/terms" className="text-xs text-[#6E6E73] hover:text-[#636366] transition-colors">
            Syarat & Ketentuan
          </Link>
        </div>
      </div>
    </footer>
  );
}
