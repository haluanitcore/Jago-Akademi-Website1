"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ProgramCard } from "@/components/ui/ProgramCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { Reveal } from "@/components/ui/Reveal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Course = {
  id: string;
  slug: string;
  title: string;
  shortDesc?: string | null;
  price: string | number;
  salePrice?: string | number | null;
  level?: string | null;
  avgRating?: number | string;
  totalEnrolled?: number;
  totalDuration?: number;
  thumbnailUrl?: string | null;
  trainer?: { name?: string } | null;
};

/**
 * Fetches published courses and filters client-side for free ones (price == 0).
 * Falls back gracefully with EmptyState if no free courses are found.
 */
export function FreeCourseCatalog() {
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    fetch(`${API}/api/courses?limit=20`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) {
          const raw: Course[] = Array.isArray(d.data?.data)
            ? d.data.data
            : Array.isArray(d.data)
            ? d.data
            : [];

          // Filter courses where effective price is 0
          const free = raw.filter((c) => {
            const p = c.salePrice != null ? Number(c.salePrice) : Number(c.price);
            return p === 0;
          });
          setCourses(free);
        } else {
          setCourses([]);
        }
      })
      .catch(() => setCourses([]));
  }, []);

  return (
    <Section tone="sunken" id="kelas-gratis-catalog">
      <SectionHeader
        eyebrow="Mulai Gratis"
        title={
          <>
            Kelas yang bisa kamu{" "}
            <span className="text-accent">akses sekarang</span>
          </>
        }
        lede="Tidak perlu bayar — pilih kelas di bawah dan langsung mulai belajar."
        action={
          <Link href="/e-course" className="btn btn-ghost btn-sm gap-1">
            Semua kursus <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      {courses === null ? (
        /* Skeleton */
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
          title="Kelas gratis segera hadir"
          description="Kami sedang menyiapkan materi gratis terbaik untukmu. Sementara itu, daftar lewat form di atas agar kami kabari saat kelas gratis tersedia."
          action={
            <Link href="/e-course" className="btn btn-outline">
              Lihat Semua Kursus
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.slice(0, 8).map((course, i) => {
            const rating = Number(course.avgRating ?? 0);
            const hours = course.totalDuration ? Math.round(course.totalDuration / 60) : 0;
            return (
              <Reveal key={course.id} delay={(i % 4) * 0.05}>
                <div className="relative h-full">
                  {/* Free badge overlay */}
                  <span
                    className="absolute right-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{
                      background: "#16A34A",
                      color: "#fff",
                      boxShadow: "0 2px 6px rgba(22,163,74,0.35)",
                    }}
                  >
                    GRATIS
                  </span>
                  <ProgramCard
                    href={`/kursus/${course.slug}`}
                    title={course.title}
                    description={course.trainer?.name ? `Bersama ${course.trainer.name}` : (course.shortDesc ?? undefined)}
                    unitLabel="Kelas Gratis"
                    unitIcon={BookOpen}
                    media={
                      course.thumbnailUrl ? (
                        <div className="relative aspect-video w-full">
                          <Image
                            src={course.thumbnailUrl}
                            alt={course.title}
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <MediaPlaceholder type="foto" ratio="16:9" showRatio={false} />
                      )
                    }
                    meta={{
                      rating: rating > 0 ? rating : undefined,
                      level: course.level ?? undefined,
                      duration: hours > 0 ? `${hours} jam` : undefined,
                      count:
                        (course.totalEnrolled ?? 0) > 0
                          ? `${course.totalEnrolled} peserta`
                          : undefined,
                    }}
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
}
