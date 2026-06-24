import Link from "next/link";
import { Star, Users, BookOpen } from "lucide-react";
import type { Lesson } from "@/lib/e-course/types";

type LessonCardLargeProps = {
  lesson: Lesson;
  categorySlug: string;
  topicSlug: string;
};

export function LessonCardLarge({ lesson, categorySlug, topicSlug }: LessonCardLargeProps) {
  return (
    <Link
      href={`/e-course/${categorySlug}/${topicSlug}/${lesson.slug}`}
      className="group relative bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-e1 hover:border-[rgba(0,119,168,0.25)] hover:shadow-e2 transition-all duration-200"
    >
      {/* Number badge */}
      <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white border border-[#E5E5E5] shadow-e1 flex items-center justify-center">
        <span className="text-[#0077A8] text-xs font-bold">{lesson.number}</span>
      </div>

      {/* Portfolio badge */}
      {lesson.isPortfolioProject && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[rgba(204,0,82,0.08)] border border-[rgba(204,0,82,0.2)] text-[#CC0052]">
            Portfolio Project
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-[rgba(0,119,168,0.06)] to-[rgba(0,119,168,0.02)] flex items-center justify-center border-b border-[#E5E5E5]">
        <BookOpen size={28} className="text-[#0077A8] opacity-20" />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2.5">
        <h4 className="text-[#1D1D1F] text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[#0077A8] transition-colors">
          {lesson.title}
        </h4>

        <div className="flex items-center gap-3 text-[#6E6E73] text-[10px] flex-wrap">
          <span className="flex items-center gap-1">
            <BookOpen size={10} />
            {lesson.chapterCount} Bab
          </span>
          <span className="flex items-center gap-1">
            <Users size={10} />
            {lesson.studentCount}
          </span>
          <span className="flex items-center gap-1">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            {lesson.rating.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
