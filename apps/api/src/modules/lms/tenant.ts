import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { prisma } from "../../db/prisma.js";
import { successResponse, errorResponse, AppError } from "../../types/index.js";
import { z } from "zod";
import { requireSuperAdmin, requireLmsAdmin } from "./guards.js";

const router = Router();

// ─── Super Admin: Tenant Management ──────────────────────────────────────────

const tenantSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().default("#2563eb"),
  customDomain: z.string().optional(),
  planType: z.enum(["trial", "starter", "pro", "enterprise"]).default("trial"),
  seatLimit: z.number().int().positive().default(50),
});

router.get("/tenants", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
    const [tenants, total] = await Promise.all([
      prisma.lmsTenant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { _count: { select: { batches: true, courses: true, enrollments: true } } },
      }),
      prisma.lmsTenant.count({ where }),
    ]);
    return res.json(successResponse(tenants, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

router.post("/tenants", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const body = tenantSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json(errorResponse("VALIDATION_ERROR", body.error.issues[0]?.message ?? "Validasi gagal."));
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const tenant = await prisma.lmsTenant.create({
      data: { ...body.data, trialEndsAt },
    });
    return res.status(201).json(successResponse(tenant));
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return res.status(409).json(errorResponse("CONFLICT", "Slug atau domain sudah digunakan."));
    }
    next(err);
  }
});

router.get("/tenants/:tenantId", authenticate, async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const isSuperAdmin = req.user?.roles.includes("super_admin" as never);
    if (!isSuperAdmin) {
      const role = await prisma.userRole.findFirst({
        where: { userId: req.user!.id, role: "lms_admin", tenantId },
      });
      if (!role) return res.status(403).json(errorResponse("FORBIDDEN", "Akses ditolak."));
    }
    const tenant = await prisma.lmsTenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: { select: { batches: true, courses: true, enrollments: true, invites: true } },
      },
    });
    if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");
    return res.json(successResponse(tenant));
  } catch (err) {
    next(err);
  }
});

router.patch("/tenants/:tenantId", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const body = tenantSchema.partial().safeParse(req.body);
    if (!body.success) return res.status(400).json(errorResponse("VALIDATION_ERROR", body.error.issues[0]?.message ?? "Validasi gagal."));
    const tenant = await prisma.lmsTenant.update({
      where: { id: req.params.tenantId },
      data: body.data,
    });
    return res.json(successResponse(tenant));
  } catch (err) {
    next(err);
  }
});

// Assign LMS admin role to a user
router.post("/tenants/:tenantId/admins", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId as string;
    const { userId } = req.body as { userId: string };
    if (!userId) return res.status(400).json(errorResponse("BAD_REQUEST", "userId diperlukan."));
    await prisma.userRole.upsert({
      where: { userId_role_tenantId: { userId, role: "lms_admin", tenantId } },
      create: { userId, role: "lms_admin", tenantId },
      update: {},
    });
    return res.json(successResponse({ message: "Admin LMS ditambahkan." }));
  } catch (err) {
    next(err);
  }
});


export default router;
