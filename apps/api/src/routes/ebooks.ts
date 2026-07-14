import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../db/prisma.js";
import { successResponse, errorResponse, AppError } from "../types/index.js";
import { z } from "zod";

const router = Router();

// List published ebooks
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const where = {
      status: "published",
      ...(category && { category }),
    };

    const [ebooks, total] = await Promise.all([
      prisma.eBook.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.eBook.count({ where }),
    ]);

    return res.json(successResponse(ebooks, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// GET /api/ebooks/my — list ebooks owned by authenticated user
router.get("/my", authenticate, async (req, res, next) => {
  try {
    // Find all ebook IDs from paid orders
    const orderItems = await prisma.orderItem.findMany({
      where: {
        itemType: "ebook",
        order: { userId: req.user!.id, status: "paid" },
      },
      select: { itemId: true },
    });

    const ebookIds = orderItems.map((oi) => oi.itemId);
    if (ebookIds.length === 0) return res.json(successResponse([]));

    const ebooks = await prisma.eBook.findMany({
      where: { id: { in: ebookIds } },
      orderBy: { createdAt: "desc" },
    });

    return res.json(successResponse(ebooks));
  } catch (err) {
    next(err);
  }
});

// Get single ebook detail
router.get("/:slug", async (req, res, next) => {
  try {
    const ebook = await prisma.eBook.findUnique({ where: { slug: req.params.slug } });
    if (!ebook || ebook.status !== "published") throw new AppError(404, "E-Book tidak ditemukan.");
    return res.json(successResponse(ebook));
  } catch (err) {
    next(err);
  }
});

// Get ebook file URL (requires ownership)
router.get("/:slug/file", authenticate, async (req, res, next) => {
  try {
    const ebook = await prisma.eBook.findUnique({ where: { slug: req.params.slug } });
    if (!ebook || ebook.status !== "published") throw new AppError(404, "E-Book tidak ditemukan.");

    // Check ownership: user has a paid order for this ebook
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        itemType: "ebook",
        itemId: ebook.id,
        order: { userId: req.user!.id, status: "paid" },
      },
    });

    if (!hasPurchased && !req.user!.roles.includes("super_admin" as never)) {
      throw new AppError(403, "Anda belum memiliki akses ke e-book ini.");
    }

    return res.json(successResponse({ fileUrl: ebook.fileUrl }));
  } catch (err) {
    next(err);
  }
});

// --- Admin ebook management ---
const ebookSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  fileUrl: z.union([z.string().url(), z.string().startsWith("/")]),
  coverUrl: z.string().optional(),
  author: z.string().optional(),
  pages: z.number().int().positive().optional(),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

function requireAdmin(req: Parameters<typeof authenticate>[0], res: Parameters<typeof authenticate>[1], next: Parameters<typeof authenticate>[2]) {
  if (!req.user?.roles.includes("super_admin" as never)) {
    return res.status(403).json(errorResponse("FORBIDDEN", "Akses ditolak."));
  }
  next();
}

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const body = ebookSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json(errorResponse("VALIDATION_ERROR", body.error.issues[0]?.message ?? "Validasi gagal."));
    const ebook = await prisma.eBook.create({ data: body.data });
    return res.status(201).json(successResponse(ebook));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const body = ebookSchema.partial().safeParse(req.body);
    if (!body.success) return res.status(400).json(errorResponse("VALIDATION_ERROR", body.error.issues[0]?.message ?? "Validasi gagal."));
    const ebook = await prisma.eBook.update({ where: { id: req.params.id }, data: body.data });
    return res.json(successResponse(ebook));
  } catch (err) {
    next(err);
  }
});

export default router;
