"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getValidToken } from "@/lib/auth/token";

type Lesson = {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  durationMins: number | null;
  sortOrder: number;
  isCompleted: boolean;
  quizzes: { id: string; question: string; options: string[] }[];
};

export default function LmsCoursePlayerPage() {
  const { tenantSlug, courseId } = useParams<{ tenantSlug: string; courseId: string }>();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchLessons = useCallback(async () => {
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    const res = await fetch(`/api/lms/portal/${tenantSlug}/courses/${courseId}/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setLessons(data.data);
      if (!activeLesson && data.data.length > 0) {
        setActiveLesson(data.data.find((l: Lesson) => !l.isCompleted) ?? data.data[0]);
      }
    }
    setLoading(false);
  }, [tenantSlug, courseId, activeLesson, router]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  async function markComplete(lessonId: string) {
    setCompleting(true);
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    await fetch(`/api/lms/portal/${tenantSlug}/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchLessons();
    setCompleting(false);
    // Move to next lesson
    const idx = lessons.findIndex((l) => l.id === lessonId);
    const next = lessons[idx + 1];
    if (idx < lessons.length - 1 && next) setActiveLesson(next);
  }

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-3 flex items-center gap-4">
        <Link href={`/lms/${tenantSlug}`} className="text-sm text-[#0077A8] hover:underline">
          ← Portal
        </Link>
        <div className="flex-1">
          <div className="text-xs text-[#6E6E73] mb-1">{completedCount}/{lessons.length} pelajaran selesai</div>
          <div className="bg-[#E5E5EA] rounded-full h-1.5 w-48">
            <div className="bg-[#0077A8] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {pct === 100 && (
          <Link href={`/lms/${tenantSlug}/certificates`} className="text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
            🏆 Lihat Sertifikat
          </Link>
        )}
      </div>

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-[#E5E5EA] overflow-y-auto hidden md:block">
          <div className="p-3 space-y-1">
            {loading ? (
              <p className="text-xs text-[#6E6E73] p-2">Memuat...</p>
            ) : (
              lessons.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLesson(l)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-start gap-2 ${
                    activeLesson?.id === l.id
                      ? "bg-[#E8F4F9] text-[#0077A8]"
                      : "hover:bg-[#F5F5F7] text-[#3C3C43]"
                  }`}
                >
                  <span className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    l.isCompleted ? "bg-green-100 text-green-700" : "bg-[#E5E5EA] text-[#6E6E73]"
                  }`}>
                    {l.isCompleted ? "✓" : i + 1}
                  </span>
                  <span className="leading-snug">{l.title}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex-1 p-6 max-w-3xl">
          {!activeLesson ? (
            <div className="text-center py-12 text-[#6E6E73]">Pilih pelajaran dari sidebar.</div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-[#1D1D1F] mb-4">{activeLesson.title}</h2>

              {activeLesson.videoUrl && (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6">
                  <iframe
                    src={activeLesson.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={activeLesson.title}
                  />
                </div>
              )}

              {activeLesson.content && (
                <div className="prose prose-sm max-w-none text-[#3C3C43] mb-6 bg-white rounded-2xl border border-[#E5E5EA] p-5 whitespace-pre-wrap">
                  {activeLesson.content}
                </div>
              )}

              {activeLesson.durationMins && (
                <p className="text-xs text-[#6E6E73] mb-4">Estimasi waktu: {activeLesson.durationMins} menit</p>
              )}

              {!activeLesson.isCompleted ? (
                <button
                  onClick={() => markComplete(activeLesson.id)}
                  disabled={completing}
                  className="px-6 py-2.5 bg-[#0077A8] text-white rounded-xl text-sm font-medium hover:bg-[#005f87] disabled:opacity-50"
                >
                  {completing ? "Menyimpan..." : "✓ Tandai Selesai"}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</span>
                  Pelajaran ini sudah selesai
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
