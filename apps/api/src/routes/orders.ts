import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../db/prisma.js";
import { generateInvoicePDF } from "../services/invoice/invoiceService.js";
import { successResponse, errorResponse, AppError } from "../types/index.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user!.id },
        include: { items: true, coupon: { select: { code: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId: req.user!.id } }),
    ]);

    return res.json(successResponse(orders, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

router.get("/:orderId", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: {
        items: true,
        coupon: { select: { code: true } },
        transactions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!order) throw new AppError(404, "Order tidak ditemukan.");
    if (order.userId !== req.user!.id && !req.user!.roles.includes("super_admin" as never)) {
      throw new AppError(403, "Akses ditolak.");
    }

    return res.json(successResponse(order));
  } catch (err) {
    next(err);
  }
});

router.get("/:orderId/invoice", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        coupon: { select: { code: true } },
      },
    });

    if (!order) throw new AppError(404, "Order tidak ditemukan.");
    if (order.userId !== req.user!.id && !req.user!.roles.includes("super_admin" as never)) {
      throw new AppError(403, "Akses ditolak.");
    }
    if (order.status !== "paid") throw new AppError(400, "Invoice hanya tersedia untuk order yang sudah dibayar.");

    const pdf = await generateInvoicePDF(order as Parameters<typeof generateInvoicePDF>[0]);
    const filename = `invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(pdf);
  } catch (err) {
    next(err);
  }
});

export default router;
