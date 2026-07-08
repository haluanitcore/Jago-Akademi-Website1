import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = {
  title: "Kolaborasi",
  description: "Peluang kolaborasi kreator, komunitas, dan mitra dengan Jago Akademi — segera hadir.",
};

export default function KolaborasiPage() {
  return (
    <ComingSoon
      title="Kolaborasi Segera Hadir"
      description="Kami membuka peluang kolaborasi untuk kreator, komunitas, dan mitra event. Program kemitraan sedang kami siapkan."
    />
  );
}
