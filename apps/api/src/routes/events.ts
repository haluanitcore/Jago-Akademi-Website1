import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../db/prisma.js";
import { successResponse, errorResponse, AppError } from "../types/index.js";
import { z } from "zod";

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const type = req.query.type as string | undefined;
    const featured = req.query.featured === "true";

    const where = {
      status: "published",
      ...(type && { type }),
      ...(featured && { isFeatured: true }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startDate: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          startDate: true,
          endDate: true,
          location: true,
          venue: true,
          price: true,
          salePrice: true,
          quota: true,
          totalSold: true,
          coverUrl: true,
          speakerName: true,
          isFeatured: true,
        },
      }),
      prisma.event.count({ where }),
    ]);

    return res.json(successResponse(events, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { slug: req.params.slug as string } });
    if (!event || event.status !== "published") throw new AppError(404, "Event tidak ditemukan.");
    return res.json(successResponse(event));
  } catch (err) {
    next(err);
  }
});

// ─── Authenticated ────────────────────────────────────────────────────────────

router.get("/:slug/registration", authenticate, async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { slug: req.params.slug as string } });
    if (!event) throw new AppError(404, "Event tidak ditemukan.");

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: req.user!.id } },
    });

    return res.json(successResponse(registration));
  } catch (err) {
    next(err);
  }
});

// ─── Dashboard: my tickets ────────────────────────────────────────────────────

router.get("/my/tickets", authenticate, async (req, res, next) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.user!.id },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
            type: true,
            startDate: true,
            endDate: true,
            location: true,
            venue: true,
            coverUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(successResponse(registrations));
  } catch (err) {
    next(err);
  }
});

// ─── Admin ────────────────────────────────────────────────────────────────────

const eventSchema = z.object({
  slug: z.string().min(2).max(100),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  type: z.enum(["online", "offline", "hybrid"]).default("online"),
  status: z.enum(["draft", "published", "cancelled"]).default("draft"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  venue: z.string().optional(),
  price: z.number().min(0).default(0),
  salePrice: z.number().min(0).optional(),
  quota: z.number().int().min(1).optional(),
  coverUrl: z.string().url().optional(),
  speakerName: z.string().optional(),
  speakerBio: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

router.get("/admin/all", authenticate, async (req, res, next) => {
  try {
    if (!req.user!.roles.includes("super_admin" as never)) throw new AppError(403, "Akses ditolak.");

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { _count: { select: { registrations: true } } },
      }),
      prisma.event.count(),
    ]);

    return res.json(successResponse(events, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

router.post("/admin", authenticate, async (req, res, next) => {
  try {
    if (!req.user!.roles.includes("super_admin" as never)) throw new AppError(403, "Akses ditolak.");

    const body = eventSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
    }

    const existing = await prisma.event.findUnique({ where: { slug: body.data.slug } });
    if (existing) throw new AppError(400, "Slug sudah digunakan.");

    const event = await prisma.event.create({
      data: {
        ...body.data,
        price: body.data.price,
        startDate: new Date(body.data.startDate),
        endDate: body.data.endDate ? new Date(body.data.endDate) : null,
      },
    });

    return res.status(201).json(successResponse(event));
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/:id", authenticate, async (req, res, next) => {
  try {
    if (!req.user!.roles.includes("super_admin" as never)) throw new AppError(403, "Akses ditolak.");

    const eventId = req.params.id as string;
    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) throw new AppError(404, "Event tidak ditemukan.");

    const body = eventSchema.partial().safeParse(req.body);
    if (!body.success) {
      return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...body.data,
        startDate: body.data.startDate ? new Date(body.data.startDate) : undefined,
        endDate: body.data.endDate ? new Date(body.data.endDate) : undefined,
      },
    });

    return res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/:id", authenticate, async (req, res, next) => {
  try {
    if (!req.user!.roles.includes("super_admin" as never)) throw new AppError(403, "Akses ditolak.");

    const eventId = req.params.id as string;
    await prisma.event.delete({ where: { id: eventId } });
    return res.json(successResponse({ id: eventId }));
  } catch (err) {
    next(err);
  }
});

// ─── Admin: check-in ─────────────────────────────────────────────────────────

router.get("/admin/:id/registrations", authenticate, async (req, res, next) => {
  try {
    if (!req.user!.roles.includes("super_admin" as never)) throw new AppError(403, "Akses ditolak.");

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id as string },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.json(successResponse(registrations));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/checkin", authenticate, async (req, res, next) => {
  try {
    if (!req.user!.roles.includes("super_admin" as never)) throw new AppError(403, "Akses ditolak.");

    const { ticketCode } = req.body as { ticketCode: string };
    if (!ticketCode) throw new AppError(400, "ticketCode diperlukan.");

    const reg = await prisma.eventRegistration.findUnique({ where: { ticketCode } });
    if (!reg) throw new AppError(404, "Tiket tidak ditemukan.");
    if (reg.attendedAt) throw new AppError(400, "Tiket sudah pernah di-scan.");
    if (reg.status !== "confirmed") throw new AppError(400, "Tiket belum confirmed.");

    const updated = await prisma.eventRegistration.update({
      where: { ticketCode },
      data: { status: "attended", attendedAt: new Date() },
      include: { user: { select: { name: true, email: true } }, event: { select: { title: true } } },
    });

    return res.json(successResponse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
