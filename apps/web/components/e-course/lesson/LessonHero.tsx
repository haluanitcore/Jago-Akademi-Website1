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
    <section className="bg-gradient-to-b from-[#001a20] to-[#0d0d0d] border-b border-[#00d4ff]/10">
      <div className="max-w-[1152px] mx-auto px-8 py-10">

        {/* Breadcrumb */}
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
            <span className="flex items-center gap-1.5 text-xs text-[#00d4ff] bg-[#00d4ff]/8 border border-[#00d4ff]/20 px-3 py-1 rounded-full">
              <BookOpen size={11} />
              {lesson.chapterCount} Bab
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#00d4ff] bg-[#00d4ff]/8 border border-[#00d4ff]/20 px-3 py-1 rounded-full">
              <Video size={11} />
              {lesson.chapters.length} Video
            </span>
            {lesson.isPortfolioProject && (
              <span className="flex items-center gap-1.5 text-xs text-[#ff0066] bg-[#ff0066]/8 border border-[#ff0066]/20 px-3 py-1 rounded-full">
                Portfolio Project
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold font-display text-[#f5f5f5] leading-tight">
            {lesson.title}
          </h1>

          <p className="text-[#525252] text-sm">
            Materi {lesson.number} dari{" "}
            <span className="text-[#a3a3a3]">{topic.title}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
