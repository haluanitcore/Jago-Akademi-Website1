import { BookOpen, Video } from "lucide-react";
import { Breadcrumb } from "@/components/e-course/shared/Breadcrumb";
import type { Lesson, Topic, Category } from "@/lib/e-course/types";

type LessonHeroProps = {
  lesson: Lesson;
  topic: Topic;
  category: Category;
};

export function LessonHero({ lesson, topic, category }: LessonHeroProps) {
  return (
    <section className="bg-gradient-to-b from-[rgba(0,119,168,0.05)] to-[#F5F5F7] border-b border-[#E5E5E5]">
      <div className="max-w-[1152px] mx-auto px-8 py-10">

        <Breadcrumb
          items={[
            { label: "E-Course", href: "/e-course" },
            { label: category.title, href: `/e-course/${category.slug}` },
            { label: topic.title, href: `/e-course/${category.slug}/${topic.slug}` },
            { label: lesson.title },
          ]}
        />

        <div className="mt-6 flex flex-col gap-4 max-w-2xl">
          <div className="flex gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-[#0077A8] bg-[rgba(0,119,168,0.07)] border border-[rgba(0,119,168,0.2)] px-3 py-1 rounded-full">
              <BookOpen size={11} />
              {lesson.chapterCount} Bab
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#0077A8] bg-[rgba(0,119,168,0.07)] border border-[rgba(0,119,168,0.2)] px-3 py-1 rounded-full">
              <Video size={11} />
              {lesson.chapters.length} Video
            </span>
            {lesson.isPortfolioProject && (
              <span className="flex items-center gap-1.5 text-xs text-[#CC0052] bg-[rgba(204,0,82,0.07)] border border-[rgba(204,0,82,0.2)] px-3 py-1 rounded-full">
                Portfolio Project
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold font-display leading-tight">
            {lesson.title}
          </h1>

          <p className="text-[#6E6E73] text-sm">
            Materi {lesson.number} dari{" "}
            <span className="text-[#636366]">{topic.title}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
