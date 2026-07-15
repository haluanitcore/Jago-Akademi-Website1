import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

// No `title` metadata here on purpose: each auth page sets its own title and the
// root layout's `%s | Jago Akademi` template wraps it exactly once. Declaring a
// bare `title.default: "Jago Akademi"` here caused the root template to double it
// into "Jago Akademi | Jago Akademi" (QA M-1).

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
            <Image src="/logo.png" alt="Jago Akademi" width={1037} height={190} priority className="h-8 w-auto" />
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
