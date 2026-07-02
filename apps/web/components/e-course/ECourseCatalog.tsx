"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Star, Users, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Course = {
  id: string;
  slug: string;
  title: string;
  level?: string | null;
  avgRating?: number | string;
  totalReviews?: number;
  totalEnrolled?: number;
  totalDuration?: number;
  trainer?: { name?: string } | null;
  category?: { slug?: string; name?: string } | null;
};

const levelColors: Record<string, string> = {
  Pemula: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Menengah: "text-[#0077A8] bg-[rgba(0,119,168,0.07)] border-[rgba(0,119,168,0.2)]",
  Lanjutan: "text-[#CC0052] bg-[rgba(204,0,82,0.07)] border-[rgba(204,0,82,0.2)]",
};

/**
 * Real catalog (TASK-052). Fetches published courses from the API — no more
 * hardcoded sample courses. Shows an honest empty-state when the catalog is
 * still empty (which it is pre-launch).
 */
export function ECourseCatalog() {
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    fetch(`${API}/api/courses?limit=8`)
      .then((r) => r.json())
      .then((d) => setCourses(d?.success ? (d.data?.data ?? []) : []))
      .catch(() => setCourses([]));
  }, []);

  return (
    <section className="py-16 border-t border-[#E5E5E5]">
      <div className="max-w-[1152px] mx-auto px-8">
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold font-display">
            Katalog <span className="text-gradient-brand">E-Course</span>
          </h2>
        </div>
        <p className="text-center text-[#636366] text-sm mb-8">
          Materi profesional rancangan instruktur berpengalaman Jago Akademi
        </p>

        {courses === null ? (
          <p className="text-center text-[#6E6E73] py-12">Memuat katalog…</p>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#D2D2D7] rounded-2xl">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-[#1D1D1F] font-semibold">Katalog kursus segera hadir</p>
            <p className="text-[#6E6E73] text-sm mt-1">
              Kami sedang menyiapkan materi terbaik untukmu.
            </p>
            <Link href="/early-access" className="btn btn-primary btn-lg mt-6 inline-flex">
              Gabung Early Access
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((course) => {
                const rating = Number(course.avgRating ?? 0);
                const hours = course.totalDuration ? Math.round(course.totalDuration / 60) : 0;
                const level = course.level ?? "";
                return (
                  <Link
                    key={course.id}
                    href={`/kursus/${course.slug}`}
                    className="group bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col gap-3 shadow-e1 hover:border-[rgba(0,119,168,0.25)] hover:shadow-e2 transition-all duration-200"
                  >
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-[rgba(0,119,168,0.06)] to-[rgba(0,119,168,0.02)] border border-[#E5E5E5] flex items-center justify-center">
                      <p className="text-[#0077A8] text-xs font-mono opacity-40">PREVIEW</p>
                    </div>
                    {level && (
                      <span
                        className={[
                          "self-start text-[10px] font-medium px-2 py-0.5 rounded border",
                          levelColors[level] ?? levelColors.Menengah,
                        ].join(" ")}
                      >
                        {level}
                      </span>
                    )}
                    <h3 className="text-[#1D1D1F] text-sm font-semibold leading-snug group-hover:text-[#0077A8] transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    {course.trainer?.name && <p className="text-[#6E6E73] text-xs">{course.trainer.name}</p>}
                    <div className="flex items-center gap-3 text-[#6E6E73] text-xs mt-auto pt-2 border-t border-[#E5E5E5]">
                      {rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={10} className="text-yellow-500 fill-yellow-500" />
                          {rating.toFixed(1)}
                        </span>
                      )}
                      {(course.totalEnrolled ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {course.totalEnrolled}
                        </span>
                      )}
                      {hours > 0 && (
                        <span className="flex items-center gap-1 ml-auto">
                          <Clock size={10} />
                          {hours} jam
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
