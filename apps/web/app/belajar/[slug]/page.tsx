"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getEnrollment } from "../../../lib/api/enrollment";

export default function CoursePlayerEntryPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) { router.replace("/masuk"); return; }

    // Find the course by slug then get enrollment, redirect to first lesson
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

    fetch(`${API}/api/courses/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then(async (body) => {
        if (!body.success) throw new Error(body.error);
        const course = body.data;
        const firstSection = course.sections?.[0];
        const firstLesson = firstSection?.lessons?.[0];
        if (firstLesson) {
          router.replace(`/belajar/${slug}/${firstLesson.id}`);
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/dashboard"));
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <span className="h-8 w-8 rounded-full border-2 border-[#0077A8] border-t-transparent animate-spin" aria-label="Memuat kursus…" />
    </div>
  );
}
