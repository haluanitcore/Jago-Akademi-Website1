import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { successResponse } from "../../types/index.js";

const router = Router();

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

export default router;
