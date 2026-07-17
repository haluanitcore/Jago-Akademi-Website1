import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validateBody.js";
import { prisma } from "../db/prisma.js";
import { AppError, successResponse } from "../types/index.js";

const router = Router();
router.use(authenticate);

function requireTrainer(req: Request, _res: Response, next: NextFunction) {
  const roles = req.user?.roles ?? [];
  if (!roles.includes("trainer" as never) && !roles.includes("super_admin" as never)) {
    return next(new AppError(403, "Akses ditolak. Hanya trainer."));
  }
  next();
}

// GET /api/trainer/dashboard — trainer stats
router.get("/dashboard", requireTrainer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.id;

    const courses = await prisma.course.findMany({
      where: { trainerId },
      select: {
        id: true, title: true, status: true, price: true,
        _count: { select: { enrollments: true } },
      },
    });

    const courseIds = courses.map((c) => c.id);

    const [totalEnrollments, revenueAgg, pendingPayouts] = await Promise.all([
      prisma.courseEnrollment.count({ where: { courseId: { in: courseIds } } }),
      prisma.orderItem.aggregate({
        _sum: { totalPrice: true },
        where: { itemType: "course", itemId: { in: courseIds }, order: { status: "paid" } },
      }),
      prisma.trainerPayout.count({ where: { trainerId, status: "pending" } }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalPrice ?? 0);
    const netRevenue = totalRevenue * 0.7; // 70% trainer share

    return res.json(successResponse({
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === "published").length,
      totalEnrollments,
      totalRevenue,
      netRevenue,
      pendingPayouts,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        price: Number(c.price),
        enrollments: c._count.enrollments,
      })),
    }));
  } catch (err) {
    next(err);
  }
});

// GET /api/trainer/courses/:courseId/analytics — per-course analytics
router.get("/courses/:courseId/analytics", requireTrainer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.id;
    const { courseId } = req.params;

    const course = await prisma.course.findFirst({
      where: { id: courseId, trainerId },
      include: {
        sections: { include: { lessons: true } },
        enrollments: {
          select: { userId: true, enrolledAt: true, completedAt: true },
          orderBy: { enrolledAt: "desc" },
          take: 50,
        },
      },
    });
    if (!course) throw new AppError(404, "Kursus tidak ditemukan.");

    const totalLessons = course.sections.reduce((sum, sec) => sum + sec.lessons.length, 0);

    const [revenueAgg, reviewAgg] = await Promise.all([
      prisma.orderItem.aggregate({
        _sum: { totalPrice: true },
        where: { itemType: "course", itemId: courseId, order: { status: "paid" } },
      }),
      prisma.review.aggregate({
        _avg: { rating: true },
        _count: { id: true },
        where: { itemType: "course", itemId: courseId, status: "published" },
      }),
    ]);

    const completedCount = course.enrollments.filter((e) => e.completedAt != null).length;

    // Calculate lesson watch stats and drop-off rate
    const lessonStats = [];
    const totalEnrolled = course.enrollments.length;
    for (const sec of course.sections) {
      for (const les of sec.lessons) {
        const stats = await prisma.courseLessonProgress.aggregate({
          _avg: { watchedPct: true },
          where: { lessonId: les.id },
        });
        const completedLessonsCount = await prisma.courseLessonProgress.count({
          where: { lessonId: les.id, isCompleted: true },
        });

        const dropOffRate = totalEnrolled > 0
          ? Math.round(((totalEnrolled - completedLessonsCount) / totalEnrolled) * 100)
          : 0;

        lessonStats.push({
          lessonId: les.id,
          title: les.title,
          sectionTitle: sec.title,
          avgWatchPct: Number(stats._avg.watchedPct ?? 0),
          completedCount: completedLessonsCount,
          dropOffRate,
        });
      }
    }

    return res.json(successResponse({
      courseId,
      title: course.title,
      totalLessons,
      totalEnrollments: totalEnrolled,
      completedCount,
      completionRate: totalEnrolled > 0
        ? Math.round((completedCount / totalEnrolled) * 100)
        : 0,
      grossRevenue: Number(revenueAgg._sum.totalPrice ?? 0),
      netRevenue: Number(revenueAgg._sum.totalPrice ?? 0) * 0.7,
      avgRating: Number(reviewAgg._avg.rating ?? 0),
      reviewCount: reviewAgg._count.id,
      adminFeedback: course.adminFeedback,
      liveZoomLink: course.liveZoomLink,
      liveSchedule: course.liveSchedule ? course.liveSchedule.toISOString() : null,
      status: course.status,
      lessons: lessonStats,
    }));
  } catch (err) {
    next(err);
  }
});

// GET /api/trainer/payouts — payout history
router.get("/payouts", requireTrainer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.id;
    const payouts = await prisma.trainerPayout.findMany({
      where: { trainerId },
      orderBy: { requestedAt: "desc" },
    });
    return res.json(successResponse(payouts));
  } catch (err) {
    next(err);
  }
});

const payoutSchema = z.object({
  amount: z.number().positive(),
  bankName: z.string().min(1),
  accountNo: z.string().min(1),
  accountName: z.string().min(1),
});

// POST /api/trainer/payouts — request payout
router.post("/payouts", requireTrainer, validateBody(payoutSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.id;
    const { amount, bankName, accountNo, accountName } = req.body as z.infer<typeof payoutSchema>;

    // M-trainer: reject payouts that exceed the trainer's available balance.
    // Compute net revenue exactly like /dashboard (70% share of paid order items
    // for the trainer's courses), then subtract payouts already requested/paid
    // (everything except rejected ones) so a trainer cannot withdraw more than
    // they have earned or double-withdraw the same revenue.
    const courses = await prisma.course.findMany({
      where: { trainerId },
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);

    const [revenueAgg, payoutAgg] = await Promise.all([
      prisma.orderItem.aggregate({
        _sum: { totalPrice: true },
        where: { itemType: "course", itemId: { in: courseIds }, order: { status: "paid" } },
      }),
      prisma.trainerPayout.aggregate({
        _sum: { amount: true },
        where: { trainerId, status: { not: "rejected" } },
      }),
    ]);

    const netRevenue = Number(revenueAgg._sum.totalPrice ?? 0) * 0.7;
    const committedPayouts = Number(payoutAgg._sum.amount ?? 0);
    const availableBalance = netRevenue - committedPayouts;

    if (amount > availableBalance) {
      throw new AppError(400, "Jumlah melebihi saldo yang tersedia.");
    }

    const payout = await prisma.trainerPayout.create({
      data: { trainerId, amount, bankName, accountNo, accountName },
    });
    return res.status(201).json(successResponse(payout));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/trainer/payouts/:payoutId — admin approve/reject
router.patch("/payouts/:payoutId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.roles.includes("super_admin" as never);
    if (!isAdmin) throw new AppError(403, "Akses ditolak.");

    const { payoutId } = req.params;
    const { status, note } = req.body as { status: string; note?: string };
    if (!["approved", "rejected", "paid"].includes(status)) {
      throw new AppError(400, "Status tidak valid.");
    }

    const payout = await prisma.trainerPayout.update({
      where: { id: payoutId },
      data: { status, note, processedAt: new Date(), processedBy: req.user!.id },
    });
    return res.json(successResponse(payout));
  } catch (err) {
    next(err);
  }
});

// GET /api/trainer/reviews — reviews of trainer's courses
router.get("/reviews", requireTrainer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.id;
    const courses = await prisma.course.findMany({
      where: { trainerId },
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);

    const reviews = await prisma.review.findMany({
      where: { itemType: "course", itemId: { in: courseIds } },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    return res.json(successResponse(reviews));
  } catch (err) {
    next(err);
  }
});

const liveSessionSchema = z.object({
  liveZoomLink: z.string().nullable().optional(),
  liveSchedule: z.string().nullable().optional(),
});

// PATCH /api/trainer/courses/:courseId/live — set Zoom link and live schedule
router.patch("/courses/:courseId/live", requireTrainer, validateBody(liveSessionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.id;
    const { courseId } = req.params;

    const course = await prisma.course.findFirst({
      where: { id: courseId, trainerId },
    });
    if (!course) throw new AppError(404, "Kursus tidak ditemukan.");

    const { liveZoomLink, liveSchedule } = req.body as z.infer<typeof liveSessionSchema>;
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        liveZoomLink: liveZoomLink || null,
        liveSchedule: liveSchedule ? new Date(liveSchedule) : null,
      },
    });

    return res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

const statusUpdateSchema = z.object({
  status: z.enum(["draft", "pending", "published", "archived", "rejected"]),
});

// PATCH /api/trainer/courses/:courseId/status — toggle status (active, draft, archived, pending)
router.patch("/courses/:courseId/status", requireTrainer, validateBody(statusUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.id;
    const { courseId } = req.params;

    const course = await prisma.course.findFirst({
      where: { id: courseId, trainerId },
    });
    if (!course) throw new AppError(404, "Kursus tidak ditemukan.");

    const { status } = req.body as z.infer<typeof statusUpdateSchema>;
    
    // Clear admin feedback if submitting for review again
    const data: Record<string, any> = { status };
    if (status === "pending") {
      data.adminFeedback = null;
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data,
    });

    return res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
