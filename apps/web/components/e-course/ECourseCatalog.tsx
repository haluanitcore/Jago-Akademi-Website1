"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ProgramCard } from "@/components/ui/ProgramCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";

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

/**
 * Real catalog (TASK-052). Fetches published courses from the API — no
 * hardcoded sample courses. Restyled to the design system (ProgramCard +
 * skeleton + EmptyState); the fetch logic is unchanged.
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
    <Section>
      <SectionHeader
        eyebrow="Katalog"
        title={
          <>
            Materi <span className="text-accent">terkurasi</span> untukmu
          </>
        }
        lede="Dirancang instruktur berpengalaman — pilih yang sesuai tujuan kariermu."
      />

      {courses === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card overflow-hidden !p-0">
              <div className="skeleton aspect-video !rounded-none" />
              <div className="flex flex-col gap-2.5 p-5">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Katalog kursus segera hadir"
          description="Kami sedang menyiapkan materi terbaik untukmu. Gabung early access agar jadi yang pertama tahu saat rilis."
          action={
            <Link href="/early-access" className="btn btn-primary">
              Gabung Early Access
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const rating = Number(course.avgRating ?? 0);
            const hours = course.totalDuration ? Math.round(course.totalDuration / 60) : 0;
            return (
              <ProgramCard
                key={course.id}
                href={`/kursus/${course.slug}`}
                title={course.title}
                description={course.trainer?.name ? `Bersama ${course.trainer.name}` : undefined}
                unitLabel="E-Course"
                unitIcon={BookOpen}
                media={<MediaPlaceholder type="foto" ratio="16:9" showRatio={false} />}
                meta={{
                  rating: rating > 0 ? rating : undefined,
                  level: course.level ?? undefined,
                  duration: hours > 0 ? `${hours} jam` : undefined,
                  count: (course.totalEnrolled ?? 0) > 0 ? `${course.totalEnrolled} peserta` : undefined,
                }}
              />
            );
          })}
        </div>
      )}
    </Section>
  );
}
