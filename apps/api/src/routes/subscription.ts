import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validateBody.js";
import { prisma } from "../db/prisma.js";
import { AppError, successResponse } from "../types/index.js";

const router = Router();

// GET /api/subscription/me — current subscription status
router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) return res.json(successResponse(null));

    const isExpired = new Date(sub.expiresAt) < new Date();
    return res.json(successResponse({ ...sub, isExpired, isActive: sub.status === "active" && !isExpired }));
  } catch (err) {
    next(err);
  }
});

const subscribeSchema = z.object({
  planType: z.enum(["monthly", "annual"]),
  orderId: z.string().optional(),
});

// POST /api/subscription — create or renew subscription (called after payment)
router.post("/", authenticate, validateBody(subscribeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { planType, orderId } = req.body as z.infer<typeof subscribeSchema>;

    const durationDays = planType === "annual" ? 365 : 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const sub = await prisma.subscription.upsert({
      where: { userId },
      create: { userId, planType, expiresAt, orderId, status: "active" },
      update: { planType, expiresAt, orderId, status: "active", startedAt: now },
    });

    return res.status(201).json(successResponse(sub));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/subscription/cancel — cancel subscription
router.patch("/cancel", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new AppError(404, "Anda belum berlangganan.");

    const updated = await prisma.subscription.update({
      where: { userId },
      data: { status: "cancelled" },
    });
    return res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

// GET /api/subscription/plans — available plans with pricing
router.get("/plans", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = [
      {
        id: "monthly",
        name: "Bulanan",
        price: 199000,
        durationDays: 30,
        features: [
          "Akses semua kursus (500+ kursus)",
          "Sertifikat penyelesaian",
          "Akses komunitas eksklusif",
          "Tanya jawab dengan mentor",
        ],
        badge: null,
      },
      {
        id: "annual",
        name: "Tahunan",
        price: 1499000,
        durationDays: 365,
        pricePerMonth: Math.round(1499000 / 12),
        savings: 199000 * 12 - 1499000,
        features: [
          "Semua fitur paket Bulanan",
          "Hemat 37% dibanding bulanan",
          "Akses materi baru seumur hidup plan",
          "1 sesi mentoring 1-on-1 per kuartal",
        ],
        badge: "Terpopuler",
      },
    ];
    return res.json(successResponse(plans));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/subscription/:userId — admin manage subscription
router.patch("/:userId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.roles.includes("super_admin" as never);
    if (!isAdmin) throw new AppError(403, "Akses ditolak.");

    const { userId } = req.params;
    const { status, expiresAt } = req.body as { status?: string; expiresAt?: string };

    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new AppError(404, "Subscription tidak ditemukan.");

    const updated = await prisma.subscription.update({
      where: { userId },
      data: {
        ...(status && { status }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      },
    });
    return res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
