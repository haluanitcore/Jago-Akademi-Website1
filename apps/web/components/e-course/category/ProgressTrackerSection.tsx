import Link from "next/link";
import { BookOpen, Clock, Flame, ChevronRight, Lock } from "lucide-react";
import type { Category } from "@/lib/e-course/types";
import { ProgressBar } from "@/components/e-course/shared/ProgressBar";

type ProgressTrackerSectionProps = {
  category: Category;
  totalLessons?: number;
};

type Stat = {
  icon: typeof BookOpen;
  value: string;
  label: string;
};

export function ProgressTrackerSection({ category, totalLessons }: ProgressTrackerSectionProps) {
  const lessonTotal =
    totalLessons ?? category.topics.reduce((sum, topic) => sum + topic.lessonCount, 0);

  const stats: Stat[] = [
    { icon: BookOpen, value: "0", label: `Materi Selesai dari ${lessonTotal}` },
    { icon: Clock, value: "0 jam", label: "Waktu Belajar" },
    { icon: Flame, value: "0 hari", label: "Streak Belajar" },
  ];

  return (
    <section className="bg-[#FAFAFA] border-b border-[#E5E5E5] py-10">
      <div className="max-w-[1152px] mx-auto px-8 flex flex-col gap-8">
        <header className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold font-display text-[#1D1D1F]">
            Progres Belajarmu
          </h2>
          <p className="text-[#6E6E73] text-sm">
            Mulai belajar dan pantau perkembanganmu di sini
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white border border-[#E5E5E5] rounded-2xl shadow-e1 p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,119,168,0.2)] flex items-center justify-center flex-none">
                  <Icon size={18} className="text-[#0077A8]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#0077A8] font-bold text-xl leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-[#6E6E73] text-xs leading-snug">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-e1 overflow-hidden">
          {category.topics.map((topic, index) => (
            <div
              key={topic.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                index > 0 ? "border-t border-[#EFEFEF]" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] border border-[#E5E5E5] flex items-center justify-center flex-none">
                <Lock size={14} className="text-[#AEAEB2]" />
              </div>

              <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[#1D1D1F] font-semibold text-sm truncate">
                    {topic.title}
                  </h3>
                  <span className="text-[#6E6E73] text-xs flex-none">
                    {topic.lessonCount} materi
                  </span>
                </div>
                <ProgressBar percent={0} label="Belum dimulai" />
              </div>

              <Link
                href={`/e-course/${category.slug}/${topic.slug}`}
                className="flex-none inline-flex items-center gap-0.5 text-[#0077A8] text-sm font-semibold hover:gap-1.5 transition-all duration-200"
              >
                Mulai
                <ChevronRight size={15} />
              </Link>
            </div>
          ))}
        </div>

        <div>
          <Link href={`/e-course/${category.slug}`} className="btn btn-primary">
            Mulai Belajar Sekarang
          </Link>
        </div>
      </div>
    </section>
  );
}
