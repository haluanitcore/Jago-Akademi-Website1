import { BookOpen, Video } from "lucide-react";
import { Breadcrumb } from "@/components/e-course/shared/Breadcrumb";
import { ProgressBar } from "@/components/e-course/shared/ProgressBar";
import { ActionButtons } from "@/components/e-course/shared/ActionButtons";
import type { Topic, Category } from "@/lib/e-course/types";

type TopicHeroProps = {
  topic: Topic;
  category: Category;
};

export function TopicHero({ topic, category }: TopicHeroProps) {
  return (
    <section className="bg-gradient-to-b from-[#001a20] to-[#0d0d0d] border-b border-[#00d4ff]/10">
      <div className="max-w-[1152px] mx-auto px-8 py-10">

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "E-Course", href: "/e-course" },
            { label: category.title, href: `/e-course/${category.slug}` },
            { label: topic.title },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-[#00d4ff] bg-[#00d4ff]/8 border border-[#00d4ff]/20 px-3 py-1 rounded-full">
                <BookOpen size={11} />
                {topic.lessonCount} Materi
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#00d4ff] bg-[#00d4ff]/8 border border-[#00d4ff]/20 px-3 py-1 rounded-full">
                <Video size={11} />
                {topic.videoCount} Video
              </span>
            </div>

            <h1 className="text-2xl font-bold font-display text-[#f5f5f5] leading-tight">
              {topic.title}
            </h1>

            <p className="text-[#a3a3a3] text-sm">
              Bagian dari Learning Path{" "}
              <span className="text-[#00d4ff]">{category.title}</span>
            </p>
          </div>

          {/* Right: progress + actions */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4">
              <ProgressBar percent={0} />
            </div>
            <ActionButtons isLocked />
          </div>
        </div>
      </div>
    </section>
  );
}
