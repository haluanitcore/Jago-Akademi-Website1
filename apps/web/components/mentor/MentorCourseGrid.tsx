import Link from "next/link";
import { ArrowRight, BookOpen, Video } from "lucide-react";
import type { Mentor, Topic, Category } from "@/lib/e-course/types";

type MentorCourseGridProps = {
  mentor: Mentor;
  topics: Array<{ topic: Topic; category: Category }>;
};

export function MentorCourseGrid({ mentor, topics }: MentorCourseGridProps) {
  if (topics.length === 0) return null;

  return (
    <section className="py-10">
      <div className="max-w-[1152px] mx-auto px-8">
        <h2 className="text-lg font-bold font-display text-[#f5f5f5] mb-6">
          Topik yang Diajarkan{" "}
          <span className="text-gradient-brand">{mentor.name}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(({ topic, category }) => (
            <Link
              key={topic.id}
              href={`/e-course/${category.slug}/${topic.slug}`}
              className="group bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col gap-3 hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/3 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center flex-none">
                  <BookOpen size={16} className="text-[#00d4ff]" />
                </div>
                <ArrowRight size={14} className="text-[#3a3a3a] group-hover:text-[#00d4ff] transition-colors mt-1" />
              </div>

              <div>
                <p className="text-[10px] text-[#525252] uppercase tracking-wider mb-1">
                  {category.title}
                </p>
                <h3 className="text-[#f5f5f5] font-semibold text-sm leading-snug group-hover:text-[#00d4ff] transition-colors">
                  {topic.title}
                </h3>
              </div>

              <div className="flex gap-3 text-[#525252] text-xs mt-auto">
                <span className="flex items-center gap-1">
                  <BookOpen size={10} />
                  {topic.lessonCount} Materi
                </span>
                <span className="flex items-center gap-1">
                  <Video size={10} />
                  {topic.videoCount} Video
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
