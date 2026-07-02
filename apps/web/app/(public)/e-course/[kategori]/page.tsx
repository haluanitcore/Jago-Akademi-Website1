import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { features } from "@/lib/features";
import { getCategoryBySlug, getAllCategoryParams } from "@/lib/e-course/utils";
import { CategoryHero } from "@/components/e-course/category/CategoryHero";
import { CategoryInfoCards } from "@/components/e-course/category/CategoryInfoCards";
import { CategorySectionRow } from "@/components/e-course/category/CategorySectionRow";
import { ProgressTrackerSection } from "@/components/e-course/category/ProgressTrackerSection";
import { CertificatePreview } from "@/components/e-course/category/CertificatePreview";

type Props = {
  params: Promise<{ kategori: string }>;
};

// Gated behind the Learning Path feature (TASK-090, not yet built) — no pages
// are generated while the flag is OFF, and on-demand requests 404 (see below).
export const dynamicParams = false;

export function generateStaticParams() {
  return features.learningPath ? getAllCategoryParams() : [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori } = await params;
  const category = getCategoryBySlug(kategori);
  if (!category) return { title: "Not Found" };
  return {
    title: `${category.title} — E-Course Jago Akademi`,
    description: category.description,
  };
}

export default async function KategoriPage({ params }: Props) {
  const { kategori } = await params;
  const category = getCategoryBySlug(kategori);
  if (!category) notFound();

  return (
    <>
      <CategoryHero category={category} />
      <CategoryInfoCards cards={category.infoCards} />
      <ProgressTrackerSection category={category} />

      {/* Topic sections */}
      <section className="py-10">
        <div className="max-w-[1152px] mx-auto px-8 flex flex-col gap-10">
          <h2 className="text-lg font-bold font-display text-[#1D1D1F]">
            Daftar Learning Path{" "}
            <span className="text-gradient-brand">{category.title}</span>
          </h2>
          {category.topics.map((topic) => (
            <CategorySectionRow
              key={topic.id}
              topic={topic}
              categorySlug={category.slug}
            />
          ))}
        </div>
      </section>

      <CertificatePreview category={category} />
    </>
  );
}
