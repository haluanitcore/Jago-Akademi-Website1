"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "../../../../components/player/VideoPlayer";
import CourseSidebar, { type SidebarSection } from "../../../../components/player/CourseSidebar";
import QuizInterface from "../../../../components/player/QuizInterface";
import { getVideoUrl, getQuiz, updateProgress } from "../../../../lib/api/enrollment";
import { getValidToken } from "@/lib/auth/token";

type Lesson = {
  id: string;
  title: string;
  type: string;
  duration: number;
  contentUrl: string | null;
  contentText: string | null;
  sortOrder: number;
  isPreview: boolean;
};

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  sections: (SidebarSection & { lessons: Lesson[] })[];
};

type QuizData = {
  id: string;
  passMark: number;
  questions: { id: string; question: string; options: string[]; sortOrder: number }[];
} | null;

export default function LessonPlayerPage() {
  const router = useRouter();
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();

  const [token, setToken] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizData>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    // Finding #2: reset lesson-specific state on every lessonId change so the
    // previous lesson's video/quiz never lingers, and use an `ignore` flag to
    // drop stale responses when navigation outpaces an in-flight fetch.
    let ignore = false;
    setLoading(true);
    setVideoUrl(null);
    setQuiz(null);
    setLesson(null);
    setError(null);

    async function load() {
      // Finding #2: refresh-aware token read (avoids Bearer null / expired token).
      const t = await getValidToken();
      if (ignore) return;
      if (!t) { router.replace("/masuk"); return; }
      setToken(t);

      try {
        // Load course + enrollment in parallel
        const [courseRes, enrollRes] = await Promise.all([
          fetch(`${API}/api/courses/${slug}`, {
            headers: { Authorization: `Bearer ${t}` },
            credentials: "include",
          }).then((r) => r.json()),
          fetch(`${API}/api/enrollments/${encodeURIComponent(slug)}`, {
            headers: { Authorization: `Bearer ${t}` },
            credentials: "include",
          }).then((r) => r.json()),
        ]);
        if (ignore) return;

        if (!courseRes.success) throw new Error("Kursus tidak ditemukan.");
        const courseData: CourseDetail = courseRes.data;
        setCourse(courseData);

        if (enrollRes.success) {
          setEnrollmentId(enrollRes.data.id);
          const done = new Set<string>(
            enrollRes.data.progress.filter((p: { isCompleted: boolean; lessonId: string }) => p.isCompleted).map((p: { lessonId: string }) => p.lessonId)
          );
          setCompletedIds(done);
        }

        // Find current lesson
        const allLessons: Lesson[] = courseData.sections.flatMap((s) => s.lessons);
        const currentLesson = allLessons.find((l) => l.id === lessonId);
        if (!currentLesson) throw new Error("Materi tidak ditemukan.");
        setLesson(currentLesson);

        // Load video URL for video lessons
        if (currentLesson.type === "video" && t) {
          try {
            const urlData = await getVideoUrl(lessonId, t);
            if (!ignore) setVideoUrl(urlData.url);
          } catch {
            if (!ignore) setVideoUrl(currentLesson.contentUrl);
          }
        }

        // Load quiz for quiz lessons
        if (currentLesson.type === "quiz" && t) {
          try {
            const quizData = await getQuiz(lessonId, t);
            if (!ignore) setQuiz(quizData);
          } catch {
            // No quiz found
          }
        }
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [slug, lessonId, router, API]);

  const handleVideoProgress = useCallback(
    async (pct: number) => {
      if (!token || !enrollmentId) return;
      try {
        await updateProgress(enrollmentId, lessonId, pct, token);
        if (pct >= 90) {
          setCompletedIds((prev) => new Set([...prev, lessonId]));
        }
      } catch {
        // Silently ignore progress sync errors
      }
    },
    [token, enrollmentId, lessonId]
  );

  function handleQuizPassed() {
    setCompletedIds((prev) => new Set([...prev, lessonId]));
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!course || !token) return;
    setReviewSubmitting(true);
    setReviewError(null);
    // Finding #3: only mark the review done when the request actually succeeds;
    // previously the unchecked fetch reported success even on failure.
    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemType: "course", itemId: course.id, rating: reviewRating, content: reviewContent }),
      });
      const body = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !body.success) {
        throw new Error(body.error?.message ?? "Gagal mengirim ulasan. Coba lagi.");
      }
      setReviewDone(true);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Gagal mengirim ulasan. Coba lagi.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  // Navigate to next lesson
  function goToNext() {
    if (!course) return;
    const allLessons = course.sections.flatMap((s) => s.lessons);
    const idx = allLessons.findIndex((l) => l.id === lessonId);
    const nextLesson = idx >= 0 ? allLessons[idx + 1] : undefined;
    if (nextLesson) {
      router.push(`/belajar/${slug}/${nextLesson.id}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-[#0077A8] border-t-transparent animate-spin" aria-label="Memuat materi…" />
      </div>
    );
  }

  if (error || !course || !lesson) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-[#1D1D1F] font-semibold">{error ?? "Materi tidak ditemukan."}</p>
        <Link href="/dashboard" className="btn-primary px-4 py-2 text-sm">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const hasNext = currentIdx >= 0 && currentIdx < allLessons.length - 1;
  const isFinalLesson = !hasNext;
  const courseCompleted = allLessons.length > 0 && completedIds.size === allLessons.length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white border-r border-[#E5E5EA] shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E5EA]">
          <Link
            href="/dashboard"
            aria-label="Kembali ke Dashboard"
            className="text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-semibold text-[#1D1D1F] truncate">{course.title}</h1>
        </div>
        <CourseSidebar
          courseSlug={slug}
          sections={course.sections}
          currentLessonId={lessonId}
          completedLessonIds={completedIds}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile back bar */}
        <div className="lg:hidden bg-white border-b border-[#E5E5EA] px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-[#6E6E73]">
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-semibold text-[#1D1D1F] truncate">{course.title}</span>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Lesson title */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#6E6E73] font-semibold mb-1">
              {lesson.type === "quiz" ? "Quiz" : "Video"}
            </p>
            <h2 className="text-2xl font-bold text-[#1D1D1F]">{lesson.title}</h2>
          </div>

          {/* Video player */}
          {lesson.type === "video" && videoUrl && (
            <VideoPlayer
              src={videoUrl}
              title={lesson.title}
              onProgress={handleVideoProgress}
            />
          )}

          {/* Text lesson */}
          {lesson.type === "text" && lesson.contentText && (
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <div className="prose prose-sm max-w-none text-[#3C3C43] whitespace-pre-wrap">
                {lesson.contentText}
              </div>
            </div>
          )}

          {/* Quiz */}
          {lesson.type === "quiz" && quiz && token && (
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <QuizInterface
                lessonId={lessonId}
                passMark={quiz.passMark}
                questions={quiz.questions}
                token={token}
                onPassed={handleQuizPassed}
              />
            </div>
          )}

          {/* Course completion review prompt */}
          {courseCompleted && !reviewDone && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🎉</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1D1D1F] mb-1">Selamat! Anda telah menyelesaikan kursus ini</h3>
                  <p className="text-sm text-[#6E6E73] mb-4">Bagikan pengalaman belajar Anda untuk membantu peserta lain.</p>
                  <form onSubmit={submitReview} className="space-y-3">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button key={r} type="button" onClick={() => setReviewRating(r)}
                          className={`text-2xl transition-transform hover:scale-110 ${r <= reviewRating ? "text-amber-400" : "text-[#E5E5EA]"}`}>
                          ⭐
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Ceritakan pengalaman belajar Anda di kursus ini..."
                      rows={3}
                      className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0077A8]"
                    />
                    {reviewError && (
                      <p role="alert" className="text-sm text-red-600">{reviewError}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <button type="submit" disabled={reviewSubmitting} className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87] disabled:opacity-50">
                        {reviewSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                      </button>
                      <button type="button" onClick={() => setReviewDone(true)} className="text-sm text-[#6E6E73] hover:text-[#1D1D1F]">
                        Lewati
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {courseCompleted && reviewDone && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-green-800">Terima kasih atas ulasan Anda!</p>
                <p className="text-sm text-green-700 mt-0.5">Ulasan Anda membantu peserta lain memilih kursus terbaik.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] flex items-center gap-1 transition-colors"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Sebelumnya
            </button>

            {hasNext && (
              <button
                type="button"
                onClick={goToNext}
                className="btn-primary px-5 py-2 text-sm flex items-center gap-1"
              >
                Materi Berikutnya
                <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
