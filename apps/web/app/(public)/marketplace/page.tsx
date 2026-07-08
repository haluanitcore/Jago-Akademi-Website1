import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = {
  title: "Marketplace Materi",
  description: "Marketplace rekaman & modul pasca-event Jago Akademi — segera hadir.",
};

export default function MarketplacePage() {
  return (
    <ComingSoon
      title="Marketplace Materi Segera Hadir"
      description="Beli rekaman event, modul, dan materi eksklusif dari trainer dan kreator Jago Akademi. Kami sedang menyiapkannya untukmu."
    />
  );
}
