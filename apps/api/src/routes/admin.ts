import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validateBody.js";
import { prisma } from "../db/prisma.js";
import { AppError, successResponse } from "../types/index.js";

const router = Router();

// All admin routes require authentication + super_admin role
function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const isAdmin = req.user?.roles.includes("super_admin" as never);
  if (!isAdmin) return next(new AppError(403, "Akses ditolak. Hanya super admin."));
  next();
}

router.use(authenticate, requireAdmin);

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

const UserListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

// GET /api/admin/users — paginated user list
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = UserListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          roles: { select: { role: true } },
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json(
      successResponse(users, {
        total,
        page,
        limit,
      })
    );
  } catch (err) {
    next(err);
  }
});

const UpdateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

// PATCH /api/admin/users/:id/status — activate or deactivate a user
router.patch(
  "/users/:id/status",
  validateBody(UpdateUserStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!user) return next(new AppError(404, "Pengguna tidak ditemukan."));

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: req.body.isActive },
        select: { id: true, name: true, email: true, isActive: true },
      });

      res.json(successResponse(updated));
    } catch (err) {
      next(err);
    }
  }
);

const CourseListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().optional(),
});

// GET /api/admin/courses — course list for admin
router.get("/courses", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search } = CourseListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          price: true,
          totalEnrolled: true,
          publishedAt: true,
          createdAt: true,
          trainer: { select: { id: true, name: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.json(successResponse(courses, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/courses/:id/approve — publish a course
router.patch("/courses/:id/approve", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return next(new AppError(404, "Kursus tidak ditemukan."));
    if (course.status === "published") return next(new AppError(400, "Kursus sudah dipublikasikan."));

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: { status: "published", publishedAt: new Date() },
      select: { id: true, title: true, status: true, publishedAt: true },
    });

    res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/courses/:id/reject — revert course to draft
router.patch("/courses/:id/reject", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return next(new AppError(404, "Kursus tidak ditemukan."));

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: { status: "draft", publishedAt: null },
      select: { id: true, title: true, status: true },
    });

    res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

const TxListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "paid", "failed", "expired"]).optional(),
  search: z.string().optional(),
});

// GET /api/admin/transactions — paginated order list
router.get("/transactions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search } = TxListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search } },
              { user: { name: { contains: search, mode: "insensitive" as const } } },
              { user: { email: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { select: { itemType: true, itemTitle: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json(successResponse(orders, { total, page, limit }));
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
