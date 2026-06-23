import Link from "next/link";
import { ArrowRight, Play, Star, Users, BookOpen, Zap } from "lucide-react";

const floatingStats = [
  { icon: Users, value: "50K+", label: "Pelajar Aktif", color: "cyan" },
  { icon: BookOpen, value: "200+", label: "Kursus Premium", color: "pink" },
  { icon: Star, value: "4.9", label: "Rating Rata-rata", color: "cyan" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,212,255,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00d4ff]/6 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#ff0066]/6 blur-[100px] pointer-events-none" />

      <div className="container-pad relative z-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up">
            <span className="badge badge-cyan">
              <Zap size={10} className="fill-current" />
              Platform Edukasi #1 Indonesia
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up animate-delay-100">
            Belajar.{" "}
            <span className="text-gradient-brand">Berlatih.</span>
            <br />
            <span className="text-gradient-cyan">Berkarier.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#a3a3a3] max-w-2xl mx-auto mb-10 leading-relaxed text-pretty animate-fade-in-up animate-delay-200">
            Satu platform untuk semua perjalanan belajarmu — dari kursus online,
            event eksklusif, program trainer bersertifikat, hingga LMS untuk perusahaanmu.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animate-delay-300">
            <Link href="/kursus" className="btn btn-primary btn-lg w-full sm:w-auto">
              Mulai Belajar Gratis
              <ArrowRight size={18} />
            </Link>
            <Link href="/demo" className="btn btn-ghost btn-lg w-full sm:w-auto group">
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 group-hover:bg-[#00d4ff]/20 transition-colors">
                <Play size={14} aria-hidden="true" className="text-[#00d4ff] fill-current translate-x-0.5" />
              </span>
              Lihat Demo
            </Link>
          </div>

          {/* Floating stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in-up animate-delay-400">
            {floatingStats.map(({ icon: Icon, value, label, color }) => (
              <div
                key={label}
                className="card-dark p-4 text-center group"
              >
                <Icon
                  size={18}
                  className={`mx-auto mb-2 ${color === "cyan" ? "text-[#00d4ff]" : "text-[#ff0066]"}`}
                />
                <p
                  className={`text-xl font-bold font-display ${color === "cyan" ? "text-gradient-cyan" : "text-[#ff0066]"}`}
                >
                  {value}
                </p>
                <p className="text-xs text-[#525252] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <p className="mt-10 text-xs text-[#525252] animate-fade-in-up animate-delay-500">
            Dipercaya oleh{" "}
            <span className="text-[#a3a3a3] font-medium">500+ trainer</span> dan{" "}
            <span className="text-[#a3a3a3] font-medium">50+ perusahaan</span> di Indonesia
          </p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none" />
    </section>
  );
}
