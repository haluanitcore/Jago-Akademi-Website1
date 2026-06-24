import Link from "next/link";
import { Star, Users, BookOpen } from "lucide-react";
import type { Lesson } from "@/lib/e-course/types";

type LessonCardProps = {
  lesson: Lesson;
  categorySlug: string;
  topicSlug: string;
};

export function LessonCard({ lesson, categorySlug, topicSlug }: LessonCardProps) {
  return (
    <Link
      href={`/e-course/${categorySlug}/${topicSlug}/${lesson.slug}`}
      className="group relative flex-none w-52 bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-e1 hover:border-[rgba(0,119,168,0.25)] hover:shadow-e2 transition-all duration-200"
    >
      {/* Number badge */}
      <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white border border-[#E5E5E5] shadow-e1 flex items-center justify-center">
        <span className="text-[#0077A8] text-[10px] font-bold">{lesson.number}</span>
      </div>

      {/* Portfolio badge */}
      {lesson.isPortfolioProject && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[rgba(204,0,82,0.08)] border border-[rgba(204,0,82,0.2)] text-[#CC0052]">
            Portfolio
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-[rgba(0,119,168,0.06)] to-[rgba(0,119,168,0.02)] flex items-center justify-center border-b border-[#E5E5E5]">
        <BookOpen size={24} className="text-[#0077A8] opacity-25" />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <h4 className="text-[#1D1D1F] text-xs font-semibold leading-snug line-clamp-2 group-hover:text-[#0077A8] transition-colors">
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 text-[#6E6E73] text-[10px]">
          <span className="flex items-center gap-1">
            <BookOpen size={9} />
            {lesson.chapterCount} Bab
          </span>
          <span className="flex items-center gap-1">
            <Users size={9} />
            {lesson.studentCount}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Star size={9} className="text-yellow-500 fill-yellow-500" />
            {lesson.rating.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
