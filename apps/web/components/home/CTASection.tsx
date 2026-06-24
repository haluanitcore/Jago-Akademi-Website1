import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export function CTASection() {
  return (
    <section className="section relative overflow-hidden bg-white">
      {/* Soft gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#00d4ff]/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#ff0066]/6 blur-[120px] pointer-events-none" />

      <div className="container-pad relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="badge badge-pink">
              <Zap size={10} className="fill-current" />
              Mulai Sekarang — Gratis!
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Siap jadi lebih{" "}
            <span className="text-gradient-brand">Jago</span>?
          </h2>

          <p className="text-lg text-[#636366] mb-10 max-w-xl mx-auto">
            Bergabunglah dengan 50.000+ profesional yang sudah membuktikan.
            Daftar gratis, mulai belajar hari ini.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/daftar" className="btn btn-primary btn-lg w-full sm:w-auto">
              Daftar Gratis Sekarang
              <ArrowRight size={18} />
            </Link>
            <Link href="/kursus" className="btn btn-outline btn-lg w-full sm:w-auto">
              Lihat Semua Kursus
            </Link>
          </div>

          <p className="mt-6 text-xs text-[#6E6E73]">
            Tidak perlu kartu kredit · Akses langsung · Batalkan kapan saja
          </p>
        </div>
      </div>
    </section>
  );
}
