import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../db/prisma.js";
import { validateCoupon, incrementCouponUsage } from "../services/coupon/couponService.js";
import { createDokuOrder } from "../services/payment/dokuService.js";
import { sendPaymentPending } from "../services/notification/emailService.js";
import { successResponse, errorResponse, AppError } from "../types/index.js";
import { env } from "../config/env.js";
import { z } from "zod";

const router = Router();

const checkoutSchema = z.object({
  itemType: z.enum(["course", "ebook"]),
  itemId: z.string().min(1),
  couponCode: z.string().optional(),
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const body = checkoutSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
    }
    const { itemType, itemId, couponCode } = body.data;
    const userId = req.user!.id;

    // Get item details
    let itemTitle = "";
    let price = 0;

    if (itemType === "course") {
      const course = await prisma.course.findUnique({ where: { id: itemId } });
      if (!course) throw new AppError(404, "Kursus tidak ditemukan.");
      if (course.price === null) throw new AppError(400, "Kursus ini gratis, tidak perlu checkout.");

      const alreadyEnrolled = await prisma.courseEnrollment.findUnique({
        where: { courseId_userId: { courseId: itemId, userId } },
      });
      if (alreadyEnrolled) throw new AppError(400, "Anda sudah terdaftar di kursus ini.");

      itemTitle = course.title;
      price = Number(course.price);
    } else {
      const ebook = await prisma.eBook.findUnique({ where: { id: itemId } });
      if (!ebook || ebook.status !== "published") throw new AppError(404, "E-Book tidak ditemukan.");
      itemTitle = ebook.title;
      price = ebook.salePrice ? Number(ebook.salePrice) : Number(ebook.price);
    }

    // Apply coupon
    let couponId: string | undefined;
    let discountAmount = 0;
    let finalAmount = price;

    if (couponCode) {
      const validation = await validateCoupon(couponCode, price);
      couponId = validation.couponId;
      discountAmount = validation.discountAmount;
      finalAmount = validation.finalAmount;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: price,
        discountAmount,
        finalAmount,
        status: "pending",
        couponId: couponId ?? null,
        expiredAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        items: {
          create: {
            itemType,
            itemId,
            itemTitle,
            quantity: 1,
            unitPrice: price,
            totalPrice: price,
          },
        },
      },
      include: { user: { select: { name: true, email: true } } },
    });

    // Increment coupon usage
    if (couponId) await incrementCouponUsage(couponId);

    // Create DOKU payment
    const invoiceNumber = `JA-${order.id.slice(0, 8).toUpperCase()}`;
    const callbackUrl = `${env.WEB_URL}/payment/success?orderId=${order.id}`;

    const { paymentUrl } = await createDokuOrder(
      invoiceNumber,
      [{ name: itemTitle, price: Math.round(finalAmount), quantity: 1 }],
      Math.round(finalAmount),
      callbackUrl,
      order.user.name,
      order.user.email
    );

    // Store transaction record
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        gateway: "doku",
        gatewayTxId: invoiceNumber,
        amount: finalAmount,
        status: "pending",
      },
    });

    // Non-blocking notification
    sendPaymentPending(order.user.email, order.user.name, order.id, finalAmount, paymentUrl).catch(() => {});

    return res.json(successResponse({ orderId: order.id, paymentUrl, finalAmount }));
  } catch (err) {
    next(err);
  }
});

export default router;
