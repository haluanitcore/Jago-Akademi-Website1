import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Marketplace E-Book & Modul — Jago Akademi",
  description:
    "Temukan koleksi e-book, modul, dan materi digital eksklusif dari trainer dan kreator terbaik Jago Akademi. Beli sekali, akses seumur hidup.",
  openGraph: {
    title: "Marketplace Jago Akademi — E-Book & Modul Digital",
    description:
      "E-book, modul, dan materi digital premium dari praktisi berpengalaman. Download PDF, akses kapan saja.",
    type: "website",
  },
};

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
