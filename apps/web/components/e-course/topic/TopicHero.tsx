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
    <section className="bg-gradient-to-b from-[rgba(0,119,168,0.05)] to-[#F5F5F7] border-b border-[#E5E5E5]">
      <div className="max-w-[1152px] mx-auto px-8 py-10">

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
              <span className="flex items-center gap-1.5 text-xs text-[#0077A8] bg-[rgba(0,119,168,0.07)] border border-[rgba(0,119,168,0.2)] px-3 py-1 rounded-full">
                <BookOpen size={11} />
                {topic.lessonCount} Materi
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#0077A8] bg-[rgba(0,119,168,0.07)] border border-[rgba(0,119,168,0.2)] px-3 py-1 rounded-full">
                <Video size={11} />
                {topic.videoCount} Video
              </span>
            </div>

            <h1 className="text-2xl font-bold font-display leading-tight">
              {topic.title}
            </h1>

            <p className="text-[#6E6E73] text-sm">
              Bagian dari Learning Path{" "}
              <span className="text-[#0077A8]">{category.title}</span>
            </p>
          </div>

          {/* Right: progress + actions */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-e1">
              <ProgressBar percent={0} />
            </div>
            <ActionButtons isLocked />
          </div>
        </div>
      </div>
    </section>
  );
}
