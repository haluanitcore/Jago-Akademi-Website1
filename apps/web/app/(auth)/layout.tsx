import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Jago Akademi", template: "%s | Jago Akademi" },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#1D1D1F] hover:text-[#0077A8] transition-colors">
            <img src="/logo.svg" alt="Jago Akademi" className="h-8 w-auto" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5EA] p-8">
          {children}
        </div>
        <p className="text-center text-xs text-[#6E6E73] mt-6">
          &copy; {new Date().getFullYear()} Jago Akademi. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
