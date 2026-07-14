import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../../middleware/validateBody.js";
import { prisma } from "../../db/prisma.js";
import { AppError, successResponse } from "../../types/index.js";

const router = Router();

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

export default router;
