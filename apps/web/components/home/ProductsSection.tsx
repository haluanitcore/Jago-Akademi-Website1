import Link from "next/link";
import {
  PlayCircle, CalendarDays, BookMarked, GraduationCap,
  Monitor, ShoppingBag, ArrowRight,
} from "lucide-react";

const products = [
  {
    icon: PlayCircle,
    label: "E-Course",
    href: "/kursus",
    desc: "Ratusan kursus video berkualitas dari trainer berpengalaman. Belajar kapan saja, di mana saja.",
    color: "cyan",
    tag: "Terpopuler",
  },
  {
    icon: CalendarDays,
    label: "Event & Workshop",
    href: "/event",
    desc: "Event online & offline, webinar eksklusif, dan workshop intensif bersama para ahli industri.",
    color: "pink",
    tag: "Hot",
  },
  {
    icon: BookMarked,
    label: "E-Book",
    href: "/ebook",
    desc: "Koleksi buku digital premium — panduan praktis, riset industri, dan template siap pakai.",
    color: "cyan",
    tag: null,
  },
  {
    icon: GraduationCap,
    label: "Trainer Program",
    href: "/trainer-program",
    desc: "Jadilah trainer bersertifikat. Program intensif untuk membangun personal brand dan karier mengajar.",
    color: "pink",
    tag: "Eksklusif",
  },
  {
    icon: Monitor,
    label: "Paket LMS",
    href: "/lms",
    desc: "Solusi LMS white-label untuk institusi, korporat, dan lembaga pelatihan. Setup cepat, harga terjangkau.",
    color: "cyan",
    tag: null,
  },
  {
    icon: ShoppingBag,
    label: "Marketplace Materi",
    href: "/marketplace",
    desc: "Akses rekaman event, modul presentasi, dan materi training langsung dari sumbernya.",
    color: "pink",
    tag: "Baru",
  },
];

export function ProductsSection() {
  return (
    <section className="section bg-[#0a0a0a]">
      <div className="container-pad">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge badge-pink mb-4">6 Unit Bisnis</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Semua yang kamu butuhkan{" "}
            <span className="text-gradient-brand">dalam satu platform</span>
          </h2>
          <p className="text-[#a3a3a3] max-w-xl mx-auto">
            Dari belajar mandiri, hadir di event, hingga membangun karier sebagai trainer —
            semua tersedia di Jago Akademi.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(({ icon: Icon, label, href, desc, color, tag }) => (
            <Link
              key={label}
              href={href}
              className="card-dark group p-6 flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Tag */}
              {tag && (
                <span className={`absolute top-4 right-4 badge ${color === "cyan" ? "badge-cyan" : "badge-pink"} text-[10px]`}>
                  {tag}
                </span>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                  color === "cyan"
                    ? "bg-[#00d4ff]/10 border border-[#00d4ff]/20 group-hover:bg-[#00d4ff]/20"
                    : "bg-[#ff0066]/10 border border-[#ff0066]/20 group-hover:bg-[#ff0066]/20"
                } transition-colors`}
              >
                <Icon
                  size={22}
                  className={color === "cyan" ? "text-[#00d4ff]" : "text-[#ff0066]"}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-[#f5f5f5] mb-1.5 group-hover:text-white transition-colors">
                  {label}
                </h3>
                <p className="text-sm text-[#737373] leading-relaxed">{desc}</p>
              </div>

              {/* Arrow */}
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  color === "cyan" ? "text-[#00d4ff]" : "text-[#ff0066]"
                } opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                Selengkapnya
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
