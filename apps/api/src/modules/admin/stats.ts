import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../../db/prisma.js";
import { successResponse } from "../../types/index.js";

const router = Router();

router.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenueAgg,
      pendingCourses,
      activeSubscriptions,
      totalRefundedOrders,
      totalPaidOrders,
      avgRatingAgg,
      retailOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.course.count(),
      prisma.courseEnrollment.count(),
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { status: "paid" },
      }),
      prisma.course.count({ where: { status: "draft" } }),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.order.count({ where: { status: "refunded" } }),
      prisma.order.count({ where: { status: { in: ["paid", "refunded"] } } }),
      prisma.review.aggregate({
        _avg: { rating: true },
      }),
      prisma.order.findMany({
        where: {
          status: "paid",
          items: {
            none: { itemType: "subscription" }
          }
        },
        select: { finalAmount: true }
      }),
    ]);

    const totalRevenue = Number(totalRevenueAgg._sum.finalAmount ?? 0);
    const refundRate = totalPaidOrders > 0 ? Number(((totalRefundedOrders / totalPaidOrders) * 100).toFixed(2)) : 0;
    const avgRating = Number(avgRatingAgg._avg.rating ?? 0).toFixed(1);
    const retailRevenue = retailOrders.reduce((sum, o) => sum + Number(o.finalAmount), 0);

    res.json(
      successResponse({
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        pendingCourses,
        activeSubscriptions,
        refundRate,
        avgRating: Number(avgRating),
        retailRevenue,
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
