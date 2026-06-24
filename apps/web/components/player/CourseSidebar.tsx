"use client";

import { useState } from "react";
import Link from "next/link";

export type SidebarSection = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: SidebarLesson[];
};

export type SidebarLesson = {
  id: string;
  title: string;
  type: string;
  duration: number;
  sortOrder: number;
  isCompleted?: boolean;
};

type Props = {
  courseSlug: string;
  sections: SidebarSection[];
  currentLessonId: string;
  completedLessonIds: Set<string>;
};

export default function CourseSidebar({
  courseSlug,
  sections,
  currentLessonId,
  completedLessonIds,
}: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id))
  );

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatDuration(seconds: number) {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    return `${m} mnt`;
  }

  function getLessonIcon(type: string, isCompleted: boolean) {
    if (isCompleted) {
      return (
        <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    }
    if (type === "quiz") {
      return (
        <span className="w-5 h-5 shrink-0 text-[#0077A8]">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      );
    }
    return (
      <span className="w-5 h-5 shrink-0 text-[#6E6E73]">
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
    );
  }

  return (
    <nav aria-label="Daftar materi kursus" className="h-full overflow-y-auto">
      <div className="py-2 space-y-1">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          const doneInSection = section.lessons.filter((l) => completedLessonIds.has(l.id)).length;

          return (
            <div key={section.id} className="border-b border-[#E5E5EA] last:border-0">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F5F5F7] transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm text-[#1D1D1F]">{section.title}</p>
                  <p className="text-xs text-[#6E6E73]">
                    {doneInSection}/{section.lessons.length} selesai
                  </p>
                </div>
                <svg
                  aria-hidden="true"
                  className={`w-4 h-4 text-[#6E6E73] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <ul className="pb-2">
                  {section.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const isDone = completedLessonIds.has(lesson.id);

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/belajar/${courseSlug}/${lesson.id}`}
                          className={`flex items-start gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isCurrent
                              ? "bg-[#E8F4FB] text-[#0077A8] font-medium"
                              : "hover:bg-[#F5F5F7] text-[#3C3C43]"
                          }`}
                          aria-current={isCurrent ? "page" : undefined}
                        >
                          {getLessonIcon(lesson.type, isDone)}
                          <div className="flex-1 min-w-0">
                            <p className="leading-tight truncate">{lesson.title}</p>
                            {lesson.duration > 0 && (
                              <p className="text-xs text-[#6E6E73] mt-0.5">{formatDuration(lesson.duration)}</p>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
