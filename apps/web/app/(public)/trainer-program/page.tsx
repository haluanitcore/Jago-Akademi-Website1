import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = {
  title: "Trainer Program | Jago Akademi",
  description: "Program sertifikasi trainer profesional Jago Akademi — segera hadir.",
};

export default function TrainerProgramPage() {
  return (
    <ComingSoon
      title="Trainer Program Segera Hadir"
      description="Jadilah trainer profesional bersertifikat: ikuti program, lulus asesmen, dan mulai berbagi keahlianmu bersama Jago Akademi."
    />
  );
}
