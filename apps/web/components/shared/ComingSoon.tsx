import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

type ComingSoonProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

/**
 * Tasteful "Segera Hadir" placeholder (TASK-053) so links to not-yet-built pages
 * never lead to a blank screen. Invites the visitor to early access instead.
 */
export function ComingSoon({ title, description, eyebrow = "Segera Hadir" }: ComingSoonProps) {
  return (
    <main id="main-content" className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-[#F5F5F7]">
      <div className="max-w-xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 badge badge-cyan mb-6">
          <Clock size={12} />
          {eyebrow}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-4">{title}</h1>
        <p className="text-[#6E6E73] leading-relaxed mb-8">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/early-access" className="btn btn-primary btn-lg">
            Gabung Early Access
            <ArrowRight size={16} />
          </Link>
          <Link href="/" className="btn btn-outline btn-lg">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
