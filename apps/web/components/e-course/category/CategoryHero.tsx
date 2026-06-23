import { BookOpen, Video, Award, Quote } from "lucide-react";
import { ProgressBar } from "@/components/e-course/shared/ProgressBar";
import { ActionButtons } from "@/components/e-course/shared/ActionButtons";
import type { Category } from "@/lib/e-course/types";

type CategoryHeroProps = {
  category: Category;
};

export function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <section className="bg-gradient-to-b from-[#001a20] to-[#0d0d0d] border-b border-[#00d4ff]/10">
      <div className="max-w-[1152px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left: Visual + tutor quote */}
          <div className="flex flex-col gap-6">
            {/* Course illustration */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#001a20] to-[#0d1a1f] border border-[#00d4ff]/15">
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#00d4ff]/8 blur-3xl" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
                  <BookOpen size={32} className="text-[#00d4ff]" />
                </div>
                <div className="text-center">
                  <p className="text-[#f5f5f5] font-bold font-display text-xl">{category.title}</p>
                  <p className="text-[#525252] text-sm mt-1">Learning Path</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[#00d4ff] font-bold text-lg">{category.topicCount}</p>
                    <p className="text-[#525252] text-xs">Topik</p>
                  </div>
                  <div className="w-px bg-[#262626]" />
                  <div className="text-center">
                    <p className="text-[#00d4ff] font-bold text-lg">{category.materialCount}</p>
                    <p className="text-[#525252] text-xs">Materi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tutor quote */}
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
              <Quote size={16} className="text-[#00d4ff] mb-2" />
              <p className="text-[#a3a3a3] text-sm leading-relaxed italic">
                &ldquo;{category.tutorQuote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1f1f1f]">
                <div className="w-8 h-8 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center flex-none">
                  <span className="text-[#00d4ff] text-xs font-bold">
                    {category.tutorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-[#f5f5f5] text-xs font-semibold">{category.tutorName}</p>
                  <p className="text-[#525252] text-[10px]">{category.tutorRole}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Course info + progress */}
          <div className="flex flex-col gap-6">
            {/* Meta pills */}
            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-[#00d4ff] bg-[#00d4ff]/8 border border-[#00d4ff]/20 px-3 py-1 rounded-full">
                <BookOpen size={11} />
                {category.topicCount} Topik
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#00d4ff] bg-[#00d4ff]/8 border border-[#00d4ff]/20 px-3 py-1 rounded-full">
                <Video size={11} />
                {category.materialCount} Materi
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#ff0066] bg-[#ff0066]/8 border border-[#ff0066]/20 px-3 py-1 rounded-full">
                <Award size={11} />
                Bersertifikat
              </span>
            </div>

            {/* Title */}
            <div>
              <p className="text-[#525252] text-xs uppercase tracking-widest mb-1">Learning Path</p>
              <h1 className="text-3xl font-bold font-display text-[#f5f5f5] leading-tight">
                {category.title}
              </h1>
            </div>

            {/* Description */}
            <p className="text-[#a3a3a3] text-sm leading-relaxed">
              {category.description}
            </p>

            {/* Progress */}
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4">
              <ProgressBar percent={0} />
            </div>

            {/* Action buttons */}
            <ActionButtons isLocked />
          </div>
        </div>
      </div>
    </section>
  );
}
