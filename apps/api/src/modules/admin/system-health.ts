import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../../db/prisma.js";
import { successResponse } from "../../types/index.js";

const router = Router();

// ─── Helper: generate last N months labels ────────────────────────────────────
function getLastMonths(n: number): { label: string; start: Date; end: Date }[] {
  const months: { label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    months.push({
      label: `${yyyy}-${mm}`,
      start: d,
      end,
    });
  }
  return months;
}

// GET /api/admin/system-health — comprehensive system health data
router.get("/system-health", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const months = getLastMonths(12);
    const since = months[0]!.start;

    // ── Parallel queries ────────────────────────────────────────────────────
    const [
      // Revenue trend data
      revenueOrders,
      // User growth data
      allUsers,
      // Enrollment trend data
      allEnrollments,
      // Order distribution
      ordersPaid,
      ordersPending,
      ordersFailed,
      ordersExpired,
      ordersRefunded,
      ordersTotal,
      // Top courses
      topCourses,
      // Database counts
      dbUsers,
      dbCourses,
      dbOrders,
      dbReviews,
      dbBlogs,
      dbEvents,
      dbEbooks,
      dbEnrollments,
      dbLeads,
      dbPayouts,
      // Active users (logged in within 24h)
      activeToday,
      // Total revenue
      totalRevenueAgg,
    ] = await Promise.all([
      // Revenue — get paid orders since 12 months ago
      prisma.order.findMany({
        where: { status: "paid", paidAt: { gte: since } },
        select: { paidAt: true, finalAmount: true },
      }),
      // Users — created since 12 months ago
      prisma.user.findMany({
        where: { createdAt: { gte: since }, deletedAt: null },
        select: { createdAt: true },
      }),
      // Enrollments — enrolled since 12 months ago
      prisma.courseEnrollment.findMany({
        where: { enrolledAt: { gte: since } },
        select: { enrolledAt: true },
      }),
      // Order distribution
      prisma.order.count({ where: { status: "paid" } }),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "failed" } }),
      prisma.order.count({ where: { status: "expired" } }),
      prisma.order.count({ where: { status: "refunded" } }),
      prisma.order.count(),
      // Top 5 courses by enrollment
      prisma.course.findMany({
        orderBy: { totalEnrolled: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          totalEnrolled: true,
          avgRating: true,
          trainer: { select: { name: true } },
        },
      }),
      // DB overview counts
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.course.count(),
      prisma.order.count(),
      prisma.review.count(),
      prisma.blogPost.count(),
      prisma.event.count(),
      prisma.eBook.count(),
      prisma.courseEnrollment.count(),
      prisma.lead.count(),
      prisma.trainerPayout.count(),
      // Active users today
      prisma.user.count({
        where: {
          lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          deletedAt: null,
        },
      }),
      // Total revenue
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { status: "paid" },
      }),
    ]);

    // ── Revenue chart ─────────────────────────────────────────────────────
    const revenueChart = months.map((m) => {
      const amount = revenueOrders
        .filter((o) => o.paidAt && o.paidAt >= m.start && o.paidAt <= m.end)
        .reduce((sum, o) => sum + Number(o.finalAmount), 0);
      return { date: m.label, amount: Math.round(amount) };
    });

    // ── User growth chart ─────────────────────────────────────────────────
    const userChart = months.map((m) => {
      const count = allUsers.filter(
        (u) => u.createdAt >= m.start && u.createdAt <= m.end
      ).length;
      return { date: m.label, count };
    });

    // ── Enrollment chart ──────────────────────────────────────────────────
    const enrollmentChart = months.map((m) => {
      const count = allEnrollments.filter(
        (e) => e.enrolledAt >= m.start && e.enrolledAt <= m.end
      ).length;
      return { date: m.label, count };
    });

    // ── Order distribution ────────────────────────────────────────────────
    const orderDistribution = [
      { status: "paid", count: ordersPaid, color: "#10B981" },
      { status: "pending", count: ordersPending, color: "#F59E0B" },
      { status: "failed", count: ordersFailed, color: "#EF4444" },
      { status: "expired", count: ordersExpired, color: "#6B7280" },
      { status: "refunded", count: ordersRefunded, color: "#8B5CF6" },
    ];

    // ── Top courses ───────────────────────────────────────────────────────
    const topCoursesData = topCourses.map((c) => ({
      title: c.title,
      enrolled: c.totalEnrolled,
      rating: Number(c.avgRating),
      trainer: c.trainer.name,
    }));

    // ── Response ──────────────────────────────────────────────────────────
    res.json(
      successResponse({
        revenue: {
          chart: revenueChart,
          total: Number(totalRevenueAgg._sum.finalAmount ?? 0),
        },
        users: {
          chart: userChart,
          total: dbUsers,
          activeToday,
        },
        enrollments: {
          chart: enrollmentChart,
          total: dbEnrollments,
        },
        orders: {
          distribution: orderDistribution,
          total: ordersTotal,
        },
        topCourses: topCoursesData,
        dbOverview: {
          users: dbUsers,
          courses: dbCourses,
          orders: dbOrders,
          reviews: dbReviews,
          blogs: dbBlogs,
          events: dbEvents,
          ebooks: dbEbooks,
          enrollments: dbEnrollments,
          leads: dbLeads,
          payouts: dbPayouts,
        },
      })
    );
  } catch (err) {
    next(err);
  }
});

export default router;
