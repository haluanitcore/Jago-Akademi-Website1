import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Pre-launch empty-state (TASK-052). Real, moderated member stories replace this
 * once available (TASK-095) — no fabricated names/companies.
 */
export function ECourseTestimonials() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-[rgba(0,119,168,0.04)] border-t border-[rgba(0,119,168,0.08)]">
        <div className="max-w-[1152px] mx-auto px-8 py-12 text-center">
          <h2 className="text-2xl font-bold font-display">
            Cerita Member E-Course{" "}
            <span className="text-gradient-brand">Segera Hadir</span>
          </h2>
          <p className="text-[#636366] text-sm mt-3 max-w-md mx-auto">
            Mulai belajar hari ini dan jadilah salah satu cerita sukses pertama di Jago Akademi.
          </p>
          <Link href="/daftar" className="btn btn-primary btn-lg mt-6 inline-flex">
            Mulai Belajar
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
