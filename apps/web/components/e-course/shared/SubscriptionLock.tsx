import Link from "next/link";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

type SubscriptionLockProps = {
  isLocked: boolean;
  children: ReactNode;
};

export function SubscriptionLock({ isLocked, children }: SubscriptionLockProps) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      <div
        className="blur-sm opacity-50 pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center max-w-sm px-6 py-8 bg-white border border-[rgba(0,119,168,0.2)] rounded-2xl shadow-e3 mx-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,119,168,0.2)] flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-[#0077A8]" />
          </div>
          <h3 className="text-[#1D1D1F] font-bold font-display text-lg mb-2">
            Konten Terkunci
          </h3>
          <p className="text-[#636366] text-sm mb-5 leading-relaxed">
            Berlangganan Jago Akademi untuk mengakses semua materi, video, dan sertifikat pembelajaran.
          </p>
          <Link
            href="/e-course/berlangganan"
            className="btn btn-primary w-full justify-center"
          >
            Berlangganan Sekarang
          </Link>
          <p className="text-[#AEAEB2] text-xs mt-3">
            Akses seumur hidup · Sertifikat resmi · Komunitas eksklusif
          </p>
        </div>
      </div>
    </div>
  );
}
