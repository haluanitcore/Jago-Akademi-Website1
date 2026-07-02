import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategoryBySlug,
  getTopicBySlug,
  getLessonBySlug,
  getAllLessonParams,
} from "@/lib/e-course/utils";
import { features } from "@/lib/features";
import { LessonHero } from "@/components/e-course/lesson/LessonHero";
import { VideoChapterList } from "@/components/e-course/lesson/VideoChapterList";
import { SubscriptionLock } from "@/components/e-course/shared/SubscriptionLock";
import { ProgressBar } from "@/components/e-course/shared/ProgressBar";

type Props = {
  params: Promise<{ kategori: string; topik: string; materi: string }>;
};

// Gated behind the Learning Path feature (TASK-090, not yet built).
export const dynamicParams = false;

export function generateStaticParams() {
  return features.learningPath ? getAllLessonParams() : [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori, topik, materi } = await params;
  const category = getCategoryBySlug(kategori);
  const topic = getTopicBySlug(kategori, topik);
  const lesson = getLessonBySlug(kategori, topik, materi);
  if (!category || !topic || !lesson) return { title: "Not Found" };
  return {
    title: `${lesson.title} | ${topic.title} — Jago Akademi`,
    description: `Pelajari ${lesson.title} dalam topik ${topic.title}. ${lesson.chapterCount} bab video pembelajaran.`,
  };
}

// Replace with auth session check when available
const IS_LOCKED = true;

export default async function MateriPage({ params }: Props) {
  const { kategori, topik, materi } = await params;
  const category = getCategoryBySlug(kategori);
  const topic = getTopicBySlug(kategori, topik);
  const lesson = getLessonBySlug(kategori, topik, materi);
  if (!category || !topic || !lesson) notFound();

  return (
    <>
      <LessonHero lesson={lesson} topic={topic} category={category} />

      <section className="py-10">
        <div className="max-w-[1152px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main: chapter list */}
            <div className="lg:col-span-2">
              <SubscriptionLock isLocked={IS_LOCKED}>
                <VideoChapterList
                  chapters={lesson.chapters}
                  lessonTitle={lesson.title}
                />
              </SubscriptionLock>
            </div>

            {/* Sidebar: progress */}
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 flex flex-col gap-4 shadow-e1">
                <h3 className="text-[#1D1D1F] font-semibold text-sm">Progress Belajar</h3>
                <ProgressBar percent={0} />
                <div className="text-[#6E6E73] text-xs flex flex-col gap-1">
                  <span>0 dari {lesson.chapters.length} video selesai</span>
                  <span className="text-[#AEAEB2]">Berlangganan untuk mulai belajar</span>
                </div>
              </div>

              {/* Lesson stats */}
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-e1">
                <h3 className="text-[#1D1D1F] font-semibold text-sm mb-3">Statistik Materi</h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Total Bab</span>
                    <span className="text-[#636366]">{lesson.chapterCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Total Pelajar</span>
                    <span className="text-[#636366]">{lesson.studentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Rating</span>
                    <span className="text-yellow-600">{lesson.rating.toFixed(2)} ★</span>
                  </div>
                  {lesson.isPortfolioProject && (
                    <div className="mt-2 pt-2 border-t border-[#EFEFEF]">
                      <span className="text-[10px] font-semibold px-2 py-1 rounded bg-[rgba(204,0,82,0.08)] border border-[rgba(204,0,82,0.2)] text-[#CC0052]">
                        Portfolio Project
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
