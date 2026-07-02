import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Pre-launch honest empty-state (TASK-052). Real, moderated success stories will
 * replace this once available (TASK-095) — we do not display fabricated
 * testimonials or statistics.
 */
export function TestimonialsSection() {
  return (
    <section className="section bg-[#F5F5F7]">
      <div className="container-pad">
        <div className="max-w-2xl mx-auto text-center">
          <span className="badge badge-cyan mb-4">
            <Sparkles size={10} className="fill-current" />
            Early Access
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Jadilah yang{" "}
            <span className="text-gradient-brand">pertama</span>
          </h2>
          <p className="text-[#636366] max-w-lg mx-auto mb-8">
            Jago Akademi baru saja dibuka. Bergabung sekarang, mulai belajar, dan
            ceritakan perjalananmu — kisah suksesmu bisa jadi yang pertama tampil di sini.
          </p>
          <Link href="/early-access" className="btn btn-primary btn-lg">
            Gabung Early Access
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
