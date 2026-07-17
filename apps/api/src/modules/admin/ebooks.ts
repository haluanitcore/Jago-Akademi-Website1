import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../../middleware/validateBody.js";
import { prisma } from "../../db/prisma.js";
import { AppError, successResponse } from "../../types/index.js";

const router = Router();

const EbookListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

// GET /api/admin/ebooks — list all ebooks for admin
router.get("/ebooks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status } = EbookListSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { author: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [ebooks, total] = await Promise.all([
      prisma.eBook.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.eBook.count({ where }),
    ]);

    res.json(successResponse(ebooks, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/ebooks/:id — get single ebook detail
router.get("/ebooks/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ebook = await prisma.eBook.findUnique({
      where: { id: req.params.id },
    });
    if (!ebook) throw new AppError(404, "E-Book tidak ditemukan.");
    res.json(successResponse(ebook));
  } catch (err) {
    next(err);
  }
});

const ebookSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).nullable().optional(),
  fileUrl: z.string().min(1),
  coverUrl: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  pages: z.coerce.number().int().positive().nullable().optional(),
  category: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

// POST /api/admin/ebooks — create ebook
router.post("/ebooks", validateBody(ebookSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as z.infer<typeof ebookSchema>;
    
    // Check if slug is unique
    const exists = await prisma.eBook.findUnique({ where: { slug: data.slug } });
    if (exists) throw new AppError(400, "Slug e-book sudah digunakan.");

    const ebook = await prisma.eBook.create({
      data: {
        ...data,
        description: data.description || null,
        coverUrl: data.coverUrl || null,
        author: data.author || null,
        category: data.category || null,
        pages: data.pages || null,
        salePrice: data.salePrice || null,
      },
    });
    res.status(201).json(successResponse(ebook));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/ebooks/:id — update ebook
router.patch("/ebooks/:id", validateBody(ebookSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.eBook.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "E-Book tidak ditemukan.");

    const data = req.body as Partial<z.infer<typeof ebookSchema>>;
    
    if (data.slug && data.slug !== existing.slug) {
      const exists = await prisma.eBook.findUnique({ where: { slug: data.slug } });
      if (exists) throw new AppError(400, "Slug e-book sudah digunakan.");
    }

    const updated = await prisma.eBook.update({
      where: { id },
      data,
    });
    res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/ebooks/:id — delete ebook
router.delete("/ebooks/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.eBook.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "E-Book tidak ditemukan.");

    await prisma.eBook.delete({ where: { id } });
    res.json(successResponse({ message: "E-Book berhasil dihapus." }));
  } catch (err) {
    next(err);
  }
});

export default router;
