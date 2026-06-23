import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const footerLinks = {
  Belajar: [
    { label: "Katalog Kursus", href: "/kursus" },
    { label: "Event & Workshop", href: "/event" },
    { label: "E-Book", href: "/ebook" },
    { label: "Marketplace Materi", href: "/marketplace" },
    { label: "Blog", href: "/blog" },
  ],
  Program: [
    { label: "Trainer Program", href: "/trainer-program" },
    { label: "Paket LMS", href: "/lms" },
    { label: "Kolaborasi", href: "/kolaborasi" },
    { label: "Program Afiliasi", href: "/afiliasi" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "/tentang-kami" },
    { label: "Klien Kami", href: "/klien" },
    { label: "Event Sebelumnya", href: "/event-sebelumnya" },
    { label: "Hubungi Kami", href: "/hubungi-kami" },
    { label: "FAQ", href: "/faq" },
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
    <footer className="border-t border-white/5 bg-[#0d0d0d]">
      {/* Main footer */}
      <div className="container-pad py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/">
              <div className="relative w-36 h-10">
                <Image
                  src="/logo.svg"
                  alt="Jago Akademi"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm text-[#a3a3a3] leading-relaxed max-w-xs">
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
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/[0.08] text-[#a3a3a3] hover:text-[#00d4ff] hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/5 transition-all duration-200 text-[10px] font-bold"
                >
                  {label}
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#f5f5f5] hover:text-[#00d4ff] transition-colors group"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Chat WhatsApp
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#525252]">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="divider-gradient" />

      {/* Bottom bar */}
      <div className="container-pad py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[#525252]">
          © 2025–2026 Jago Akademi. Hak cipta dilindungi.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs text-[#525252] hover:text-[#a3a3a3] transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="/terms" className="text-xs text-[#525252] hover:text-[#a3a3a3] transition-colors">
            Syarat & Ketentuan
          </Link>
        </div>
      </div>
    </footer>
  );
}
