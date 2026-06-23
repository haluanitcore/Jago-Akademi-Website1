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
      className="group relative flex-none w-52 bg-[#141414] border border-[#262626] rounded-xl overflow-hidden hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/3 transition-all duration-200"
    >
      {/* Number badge */}
      <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#0d0d0d] border border-[#262626] flex items-center justify-center">
        <span className="text-[#00d4ff] text-[10px] font-bold">{lesson.number}</span>
      </div>

      {/* Portfolio badge */}
      {lesson.isPortfolioProject && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#ff0066]/20 border border-[#ff0066]/30 text-[#ff0066]">
            Portfolio
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-[#0d1a1f] to-[#1a1a1a] flex items-center justify-center">
        <BookOpen size={24} className="text-[#00d4ff] opacity-30" />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <h4 className="text-[#f5f5f5] text-xs font-semibold leading-snug line-clamp-2 group-hover:text-[#00d4ff] transition-colors">
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 text-[#525252] text-[10px]">
          <span className="flex items-center gap-1">
            <BookOpen size={9} />
            {lesson.chapterCount} Bab
          </span>
          <span className="flex items-center gap-1">
            <Users size={9} />
            {lesson.studentCount}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Star size={9} className="text-yellow-400 fill-yellow-400" />
            {lesson.rating.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
