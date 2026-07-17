import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../../middleware/validateBody.js";
import { prisma } from "../../db/prisma.js";
import { AppError, successResponse } from "../../types/index.js";

const router = Router();

// ─── Stats ────────────────────────────────────────────────────────────────────
// GET /api/admin/payouts/stats — aggregate KPI for trainer + affiliate payouts
router.get("/payouts/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [trainerPending, trainerApproved, trainerPaid, trainerPendingSum,
           affPending, affApproved, affPaid, affPendingSum] = await Promise.all([
      prisma.trainerPayout.count({ where: { status: "pending" } }),
      prisma.trainerPayout.count({ where: { status: "approved" } }),
      prisma.trainerPayout.count({ where: { status: "paid" } }),
      prisma.trainerPayout.aggregate({ _sum: { amount: true }, where: { status: "pending" } }),
      prisma.affiliateWithdrawal.count({ where: { status: "pending" } }),
      prisma.affiliateWithdrawal.count({ where: { status: "approved" } }),
      prisma.affiliateWithdrawal.count({ where: { status: "paid" } }),
      prisma.affiliateWithdrawal.aggregate({ _sum: { amount: true }, where: { status: "pending" } }),
    ]);

    res.json(successResponse({
      trainer: {
        pending: trainerPending,
        approved: trainerApproved,
        paid: trainerPaid,
        pendingAmount: Number(trainerPendingSum._sum.amount ?? 0),
      },
      affiliate: {
        pending: affPending,
        approved: affApproved,
        paid: affPaid,
        pendingAmount: Number(affPendingSum._sum.amount ?? 0),
      },
    }));
  } catch (err) {
    next(err);
  }
});

// ─── Trainer Payouts ──────────────────────────────────────────────────────────

const TrainerPayoutListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "approved", "rejected", "paid"]).optional(),
  search: z.string().optional(),
});

// GET /api/admin/payouts/trainer
router.get("/payouts/trainer", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search } = TrainerPayoutListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.trainer = {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    const [payouts, total] = await Promise.all([
      prisma.trainerPayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: "desc" },
        include: {
          trainer: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.trainerPayout.count({ where }),
    ]);

    res.json(successResponse({ payouts, total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/payouts/trainer/:id — update status
const PayoutUpdateSchema = z.object({
  status: z.enum(["approved", "rejected", "paid"]),
  note: z.string().optional(),
});

router.patch("/payouts/trainer/:id", validateBody(PayoutUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body as z.infer<typeof PayoutUpdateSchema>;

    const existing = await prisma.trainerPayout.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Payout tidak ditemukan.");

    const updated = await prisma.trainerPayout.update({
      where: { id },
      data: {
        status,
        note: note ?? null,
        processedAt: new Date(),
        processedBy: req.user!.id,
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

// ─── Affiliate Withdrawals ────────────────────────────────────────────────────

const AffiliateWithdrawalListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "approved", "rejected", "paid"]).optional(),
  search: z.string().optional(),
});

// GET /api/admin/payouts/affiliate
router.get("/payouts/affiliate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search } = AffiliateWithdrawalListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.affiliate = {
        user: {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        },
      };
    }

    const [withdrawals, total] = await Promise.all([
      prisma.affiliateWithdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: "desc" },
        include: {
          affiliate: {
            select: {
              id: true,
              code: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.affiliateWithdrawal.count({ where }),
    ]);

    res.json(successResponse({ withdrawals, total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/payouts/affiliate/:id — update status
router.patch("/payouts/affiliate/:id", validateBody(PayoutUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body as z.infer<typeof PayoutUpdateSchema>;

    const existing = await prisma.affiliateWithdrawal.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Withdrawal tidak ditemukan.");

    const updated = await prisma.affiliateWithdrawal.update({
      where: { id },
      data: {
        status,
        note: note ?? null,
        processedAt: new Date(),
        processedBy: req.user!.id,
      },
      include: {
        affiliate: {
          select: {
            id: true,
            code: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
