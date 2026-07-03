import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Jago Akademi", template: "%s | Jago Akademi" },
};

/**
 * Auth shell (design refresh, Jul 2026) — centered editorial card on the
 * page surface: white card, default border, radius-xl, e2 elevation, and a
 * restrained 2px brand-cyan top rule for character. No gradients.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] p-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 text-[var(--text-primary)] transition-colors hover:text-[var(--brand-cyan-strong)]"
          >
            <img src="/logo.svg" alt="Jago Akademi" className="h-8 w-auto" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] shadow-e2">
          <div aria-hidden="true" className="h-0.5 w-full bg-[var(--brand-cyan)]" />
          <div className="p-8 sm:p-10">{children}</div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} Jago Akademi &middot; Belajar. Berlatih. Berkarier.
        </p>
      </div>
    </div>
  );
}
