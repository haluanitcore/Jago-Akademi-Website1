import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../../middleware/validateBody.js";
import { prisma } from "../../db/prisma.js";
import { AppError, successResponse } from "../../types/index.js";

const router = Router();

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

export default router;
