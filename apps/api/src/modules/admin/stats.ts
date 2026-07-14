import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../../db/prisma.js";
import { successResponse } from "../../types/index.js";

const router = Router();

// GET /api/admin/stats — system-wide dashboard stats
router.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, totalRevenue, pendingCourses] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.course.count(),
      prisma.courseEnrollment.count(),
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { status: "paid" },
      }),
      prisma.course.count({ where: { status: "draft" } }),
    ]);

    res.json(
      successResponse({
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: Number(totalRevenue._sum.finalAmount ?? 0),
        pendingCourses,
      })
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/revenue — revenue summary by period
router.get("/revenue", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || "monthly";

    // Last 12 months or 30 days depending on period
    const since = new Date();
    if (period === "monthly") since.setMonth(since.getMonth() - 11);
    else since.setDate(since.getDate() - 29);

    const [totalRevenue, totalOrders, paidOrders, revenueByDay] = await Promise.all([
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { status: "paid" },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "paid" } }),
      prisma.order.findMany({
        where: { status: "paid", paidAt: { gte: since } },
        select: { paidAt: true, finalAmount: true },
        orderBy: { paidAt: "asc" },
      }),
    ]);

    // Group by date
    const grouped: Record<string, number> = {};
    for (const o of revenueByDay) {
      if (!o.paidAt) continue;
      const key = o.paidAt.toISOString().slice(0, period === "monthly" ? 7 : 10);
      grouped[key] = (grouped[key] ?? 0) + Number(o.finalAmount);
    }

    const chart = Object.entries(grouped).map(([date, amount]) => ({ date, amount }));

    res.json(
      successResponse({
        totalRevenue: Number(totalRevenue._sum.finalAmount ?? 0),
        totalOrders,
        paidOrders,
        conversionRate: totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0,
        chart,
      })
    );
  } catch (err) {
    next(err);
  }
});

export default router;
