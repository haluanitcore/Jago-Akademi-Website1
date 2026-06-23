import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategoryBySlug,
  getTopicBySlug,
  getLessonBySlug,
  getAllLessonParams,
} from "@/lib/e-course/utils";
import { LessonHero } from "@/components/e-course/lesson/LessonHero";
import { VideoChapterList } from "@/components/e-course/lesson/VideoChapterList";
import { SubscriptionLock } from "@/components/e-course/shared/SubscriptionLock";
import { ProgressBar } from "@/components/e-course/shared/ProgressBar";

type Props = {
  params: Promise<{ kategori: string; topik: string; materi: string }>;
};

export function generateStaticParams() {
  return getAllLessonParams();
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
              <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-[#f5f5f5] font-semibold text-sm">Progress Belajar</h3>
                <ProgressBar percent={0} />
                <div className="text-[#525252] text-xs flex flex-col gap-1">
                  <span>0 dari {lesson.chapters.length} video selesai</span>
                  <span className="text-[#3a3a3a]">Berlangganan untuk mulai belajar</span>
                </div>
              </div>

              {/* Lesson stats */}
              <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-5">
                <h3 className="text-[#f5f5f5] font-semibold text-sm mb-3">Statistik Materi</h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Total Bab</span>
                    <span className="text-[#a3a3a3]">{lesson.chapterCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Total Pelajar</span>
                    <span className="text-[#a3a3a3]">{lesson.studentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Rating</span>
                    <span className="text-yellow-400">{lesson.rating.toFixed(2)} ★</span>
                  </div>
                  {lesson.isPortfolioProject && (
                    <div className="mt-2 pt-2 border-t border-[#1f1f1f]">
                      <span className="text-[10px] font-semibold px-2 py-1 rounded bg-[#ff0066]/10 border border-[#ff0066]/20 text-[#ff0066]">
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
