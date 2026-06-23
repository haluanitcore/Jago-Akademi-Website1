import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LessonCard } from "./LessonCard";
import type { Topic } from "@/lib/e-course/types";

type CategorySectionRowProps = {
  topic: Topic;
  categorySlug: string;
};

export function CategorySectionRow({ topic, categorySlug }: CategorySectionRowProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[#f5f5f5] font-semibold text-base">{topic.title}</h3>
          <p className="text-[#525252] text-xs mt-0.5">
            {topic.lessonCount} Materi · {topic.videoCount} Video
          </p>
        </div>
        <Link
          href={`/e-course/${categorySlug}/${topic.slug}`}
          className="flex-none flex items-center gap-1 text-xs text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
        >
          Selengkapnya
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Horizontal scroll of lesson cards */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {topic.lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            categorySlug={categorySlug}
            topicSlug={topic.slug}
          />
        ))}
      </div>
    </div>
  );
}
