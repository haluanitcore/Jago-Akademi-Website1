import { prisma } from "../../db/prisma.js";
import { AppError } from "../../types/index.js";
import { issueCertificate } from "../certificate/certificateService.js";

export async function enrollInCourse(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "published") {
    throw new AppError(404, "Kursus tidak ditemukan.");
  }
  if (course.deletedAt) throw new AppError(404, "Kursus tidak ditemukan.");

  const existing = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  if (existing) throw new AppError(409, "Anda sudah terdaftar di kursus ini.");

  return prisma.courseEnrollment.create({
    data: { courseId, userId },
    include: { course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } } },
  });
}

export async function getMyEnrollments(userId: string) {
  return prisma.courseEnrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          level: true,
          trainer: { select: { name: true } },
          _count: { select: { sections: true } },
        },
      },
      progress: { select: { isCompleted: true } },
    },
  });
}

export async function getEnrollment(userId: string, courseId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
    include: {
      course: {
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: {
              lessons: {
                orderBy: { sortOrder: "asc" },
                select: { id: true, title: true, type: true, duration: true, sortOrder: true, isPreview: true },
              },
            },
          },
        },
      },
      progress: true,
    },
  });
  if (!enrollment) throw new AppError(404, "Enrollment tidak ditemukan.");
  return enrollment;
}

export async function updateLessonProgress(
  userId: string,
  enrollmentId: string,
  lessonId: string,
  watchedPct: number
) {
  const enrollment = await prisma.courseEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.userId !== userId) {
    throw new AppError(404, "Enrollment tidak ditemukan.");
  }

  const isCompleted = watchedPct >= 90;
  const completedAt = isCompleted ? new Date() : null;

  const progress = await prisma.courseLessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    update: { watchedPct, isCompleted, ...(isCompleted ? { completedAt } : {}) },
    create: { enrollmentId, lessonId, watchedPct, isCompleted, ...(isCompleted ? { completedAt } : {}) },
  });

  await recalculateCourseProgress(enrollmentId);
  return progress;
}

async function recalculateCourseProgress(enrollmentId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: { sections: { include: { lessons: { select: { id: true } } } } },
      },
      progress: { select: { isCompleted: true } },
    },
  });
  if (!enrollment) return;

  const totalLessons = enrollment.course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  if (totalLessons === 0) return;

  const completedCount = enrollment.progress.filter((p) => p.isCompleted).length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);
  const isCompleted = progressPct >= 80;

  const justCompleted = isCompleted && !enrollment.isCompleted;

  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPct,
      isCompleted,
      ...(justCompleted ? { completedAt: new Date() } : {}),
    },
  });

  if (justCompleted) {
    issueCertificate(enrollment.userId, enrollment.courseId).catch(() => {
      // Certificate generation is non-blocking; errors logged server-side
    });
  }
}
