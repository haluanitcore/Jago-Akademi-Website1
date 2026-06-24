import type { Metadata } from "next";
import { ECourseHero } from "@/components/e-course/ECourseHero";
import { ECourseTestimonials } from "@/components/e-course/ECourseTestimonials";
import { ECourseFeatures } from "@/components/e-course/ECourseFeatures";
import { ECourseCatalog } from "@/components/e-course/ECourseCatalog";
import { LeaderboardSection } from "@/components/e-course/LeaderboardSection";
import { ECourseLearningPaths } from "@/components/e-course/ECourseLearningPaths";

export const metadata: Metadata = {
  title: "E-Course — Pelajari 1.000+ Skill Profesional & Bersertifikat | Jago Akademi",
  description:
    "Kuasai ratusan skill profesional dengan akses materi sekali bayar. Belajar fleksibel, dapatkan sertifikat resmi, bergabung komunitas, dan buka peluang karier impianmu bersama Jago Akademi.",
  openGraph: {
    title: "E-Course Jago Akademi — 1.000+ Materi Profesional & Bersertifikat",
    description:
      "Platform e-learning terlengkap untuk Digital Marketing, Data Science, UI/UX, Product Management, Web Development, dan banyak lagi.",
    type: "website",
  },
};

export default function ECoursePage() {
  return (
    <>
      <ECourseHero />
      <ECourseTestimonials />
      <ECourseFeatures />
      <ECourseCatalog />
      <LeaderboardSection />
      <ECourseLearningPaths />
    </>
  );
}
