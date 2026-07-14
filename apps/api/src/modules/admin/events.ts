import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { successResponse } from "../../types/index.js";

const router = Router();

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

export default router;
