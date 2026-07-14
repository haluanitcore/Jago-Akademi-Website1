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

// PATCH /api/admin/users/:id — update user (isActive and/or isVerified)
const AdminUserUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

router.patch("/users/:id", validateBody(AdminUserUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!user) return next(new AppError(404, "Pengguna tidak ditemukan."));

    const { isActive, isVerified } = req.body as z.infer<typeof AdminUserUpdateSchema>;
    const data: Record<string, boolean> = {};
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (typeof isVerified === "boolean") data.isVerified = isVerified;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, isActive: true, isVerified: true },
    });

    res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

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

// PATCH /api/admin/courses/:id — generic course update (status, isFeatured)
const AdminCourseUpdateSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
});

router.patch("/courses/:id", validateBody(AdminCourseUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return next(new AppError(404, "Kursus tidak ditemukan."));

    const { status, isFeatured } = req.body as z.infer<typeof AdminCourseUpdateSchema>;
    const data: Record<string, unknown> = {};
    if (status === "published") { data.status = "published"; data.publishedAt = new Date(); }
    else if (status === "draft") { data.status = "draft"; data.publishedAt = null; }
    else if (status === "archived") { data.status = "archived"; }
    if (typeof isFeatured === "boolean") data.isFeatured = isFeatured;

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data,
      select: { id: true, title: true, status: true, isFeatured: true, publishedAt: true },
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

// ─── Admin: Leads CRM ─────────────────────────────────────────────────────────

const LeadListSchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  q:      z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
});

// GET /api/admin/leads — paginated leads with optional filters
router.get("/leads", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, q, source, status } = LeadListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      ...(source ? { source } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name:  { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { company: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          message: true,
          source: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.lead.count({ where }),
    ]);

    res.json(successResponse(leads, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/leads/:id — update lead status
router.patch("/leads/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    const VALID_STATUSES = ["new", "contacted", "qualified", "converted", "archived"];
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: { message: `Status harus salah satu dari: ${VALID_STATUSES.join(", ")}.` } });
    }
    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
    return res.json(successResponse(lead));
  } catch (err) {
    next(err);
  }
});

// ─── Admin: Orders (alias for transactions) ──────────────────────────────────

// GET /api/admin/orders — alias for /transactions to match frontend
router.get("/orders", async (req: Request, res: Response, next: NextFunction) => {
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

// ─── Admin: Events ────────────────────────────────────────────────────────────

const EventListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
});

// GET /api/admin/events
router.get("/events", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search } = EventListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "desc" },
      }),
      prisma.event.count({ where }),
    ]);

    res.json(successResponse(events, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/events/:id
router.patch("/events/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status?: string };
    const data: Record<string, unknown> = {};
    if (status) data.status = status;

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
    });
    res.json(successResponse(event));
  } catch (err) {
    next(err);
  }
});

// ─── Admin: Blog ──────────────────────────────────────────────────────────────

const BlogListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
});

// GET /api/admin/blog
router.get("/blog", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search } = BlogListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, slug: true, title: true, excerpt: true,
          coverUrl: true, category: true, status: true,
          publishedAt: true, createdAt: true,
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json(successResponse(posts, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/blog/:id
router.patch("/blog/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status?: string };
    const data: Record<string, unknown> = {};
    if (status === "published") { data.status = "published"; data.publishedAt = new Date(); }
    else if (status) { data.status = status; data.publishedAt = null; }

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data,
      select: { id: true, title: true, status: true, publishedAt: true },
    });
    res.json(successResponse(post));
  } catch (err) {
    next(err);
  }
});

// ─── Admin: Reviews ───────────────────────────────────────────────────────────

const ReviewListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  approved: z.string().optional(),
});

// GET /api/admin/reviews
router.get("/reviews", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, approved } = ReviewListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      ...(approved === "true" ? { status: "published" } : {}),
      ...(approved === "false" ? { status: "hidden" } : {}),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    res.json(successResponse(reviews, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/reviews/:id — moderate (isApproved → status)
router.patch("/reviews/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isApproved } = req.body as { isApproved?: boolean };
    const status = isApproved ? "published" : "hidden";

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(successResponse(review));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/reviews/:id
router.delete("/reviews/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json(successResponse({ message: "Review dihapus." }));
  } catch (err) {
    next(err);
  }
});

// ─── Admin: Coupons ───────────────────────────────────────────────────────────

const AdminCouponSchema = z.object({
  code: z.string().min(3).max(50).transform((v) => v.toUpperCase()),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  maxDiscount: z.number().positive().optional(),
  minPurchase: z.number().min(0).default(0),
  // Frontend sends maxUses/expiresAt — map to usageLimit/endDate
  maxUses: z.number().int().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/coupons
router.get("/coupons", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.coupon.count(),
    ]);
    res.json(successResponse(coupons, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/coupons
router.post("/coupons", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AdminCouponSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(400, parsed.error.issues[0]?.message ?? "Validasi gagal."));

    const { maxUses, expiresAt, usageLimit, endDate, ...rest } = parsed.data;
    const coupon = await prisma.coupon.create({
      data: {
        ...rest,
        usageLimit: usageLimit ?? maxUses ?? undefined,
        endDate: endDate ?? (expiresAt ? new Date(expiresAt) : undefined),
      },
    });
    res.status(201).json(successResponse(coupon));
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return next(new AppError(409, "Kode kupon sudah digunakan."));
    }
    next(err);
  }
});

// PATCH /api/admin/coupons/:id
router.patch("/coupons/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AdminCouponSchema.partial().safeParse(req.body);
    if (!parsed.success) return next(new AppError(400, parsed.error.issues[0]?.message ?? "Validasi gagal."));

    const { maxUses, expiresAt, usageLimit, endDate, ...rest } = parsed.data;
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(usageLimit !== undefined || maxUses !== undefined ? { usageLimit: usageLimit ?? maxUses } : {}),
        ...(endDate !== undefined || expiresAt !== undefined ? { endDate: endDate ?? (expiresAt ? new Date(expiresAt) : null) } : {}),
      },
    });
    res.json(successResponse(coupon));
  } catch (err) {
    next(err);
  }
});

export default router;
