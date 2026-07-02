import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const categories = [
  "Digital Marketing",
  "Data Science",
  "Microsoft Office",
  "UI/UX Design",
  "Product Management",
  "Web Development",
];

export function ECourseHero() {
  return (
    <section className="relative overflow-hidden pt-16">
      {/* Subtle top accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,212,255,0.04)] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,119,168,0.2)] to-transparent" />

      {/* Hero content */}
      <div className="relative max-w-[1152px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left: Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-[rgba(0,119,168,0.06)] to-[rgba(0,119,168,0.02)] border border-[rgba(0,119,168,0.15)] shadow-e2">
              {/* Decorative grid */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,119,168,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,119,168,1) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Center illustration */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,119,168,0.2)] flex items-center justify-center shadow-e1">
                  <BookOpen size={32} className="text-[#0077A8]" />
                </div>
                <div className="text-center">
                  <p className="text-[#1D1D1F] font-bold text-lg font-display">E-Course Jago Akademi</p>
                  <p className="text-[#6E6E73] text-sm mt-1">Materi Profesional Bersertifikat</p>
                </div>
                {/* Category pills */}
                <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-xs">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs px-2.5 py-1 rounded-md bg-[rgba(0,119,168,0.07)] border border-[rgba(0,119,168,0.15)] text-[#0077A8]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              {/* Soft glow orbs */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#00d4ff]/8 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-[#ff0066]/5 blur-3xl" />
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 space-y-5">
            {/* Badge */}
            <span className="badge badge-cyan inline-flex">
              E-Learning Platform
            </span>

            {/* Heading */}
            <h1 className="text-4xl xl:text-5xl font-bold font-display tracking-tight leading-tight">
              Kuasai Skill Baru,{" "}
              <span className="text-gradient-brand">Bangun Portfolio</span>{" "}
              &amp; Bersertifikat
            </h1>

            {/* Paragraph */}
            <p className="text-[#636366] text-base leading-relaxed">
              Akses materi sekali bayar. Lebih dari sekadar kursus — dapatkan
              sertifikat resmi dan buka peluang karier bersama komunitas Jago Akademi.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/daftar" className="btn btn-primary btn-lg">
                Mulai Belajar
                <ArrowRight size={16} />
              </Link>
              <Link href="/e-course/katalog" className="btn btn-outline btn-lg">
                Lihat Semua Materi
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
