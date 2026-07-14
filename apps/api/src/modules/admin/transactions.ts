import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { successResponse } from "../../types/index.js";

const router = Router();

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

export default router;
