import Link from "next/link";
import { ArrowRight, Play, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-page" />
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,119,168,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,119,168,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Soft glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00d4ff]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#ff0066]/6 blur-[100px] pointer-events-none" />

      <div className="container-pad relative z-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up">
            <span className="badge badge-cyan">
              <Zap size={10} className="fill-current" />
              Platform Edukasi Digital Terintegrasi
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
          <p className="text-lg md:text-xl text-[#636366] max-w-2xl mx-auto mb-10 leading-relaxed text-pretty animate-fade-in-up animate-delay-200">
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
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,119,168,0.2)] group-hover:bg-[rgba(0,212,255,0.14)] transition-colors">
                <Play size={14} aria-hidden="true" className="text-[#0077A8] fill-current translate-x-0.5" />
              </span>
              Lihat Demo
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
    </section>
  );
}
