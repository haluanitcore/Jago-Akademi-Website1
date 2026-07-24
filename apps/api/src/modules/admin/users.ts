import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../../middleware/validateBody.js";
import { prisma } from "../../db/prisma.js";
import { AppError, successResponse } from "../../types/index.js";
import { csvCell, CSV_EXPORT_MAX_ROWS } from "../../lib/csv.js";

const router = Router();

const UserListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  // The /admin/pengguna UI sends a role dropdown; it was previously parsed
  // nowhere, so every value returned the full list. Constrain to known roles.
  role: z.enum(["student", "trainer", "affiliate", "super_admin"]).optional(),
});

// GET /api/admin/users — paginated user list
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, role } = UserListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(role ? { roles: { some: { role } } } : {}),
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
// GET /api/admin/users/export — export all active users as CSV
router.get("/users/export", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      // Hard cap (see CSV_EXPORT_MAX_ROWS): keep the export bounded in memory.
      take: CSV_EXPORT_MAX_ROWS,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        roles: { select: { role: true } },
      },
    });

    const csvHeaders = "ID,Nama,Email,Active,Verified,Role,Bergabung\n";
    // csvCell handles quote-escaping AND formula-injection (M2) for every
    // string cell — name/email are user-controlled input.
    const csvRows = users.map((u) => {
      const roles = u.roles.map((r) => r.role).join("; ");
      const joinedDate = u.createdAt.toISOString();
      return [
        csvCell(u.id),
        csvCell(u.name),
        csvCell(u.email),
        u.isActive,
        u.isVerified,
        csvCell(roles),
        joinedDate,
      ].join(",");
    }).join("\n");

    const csvContent = csvHeaders + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="users-export.csv"');
    return res.send(csvContent);
  } catch (err) {
    next(err);
  }
});

export default router;
