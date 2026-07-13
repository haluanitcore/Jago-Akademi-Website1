import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../db/prisma.js";
import { validateCoupon, incrementCouponUsage } from "../services/coupon/couponService.js";
import { createDokuOrder } from "../services/payment/dokuService.js";
import { enqueueEmail } from "../jobs/queues.js";
import { successResponse, errorResponse, AppError } from "../types/index.js";
import { env } from "../config/env.js";
import { z } from "zod";

const router = Router();

const checkoutSchema = z.object({
  itemType: z.enum(["course", "ebook", "event"]),
  itemId: z.string().min(1),
  couponCode: z.string().optional(),
  referralCode: z.string().optional(),
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const body = checkoutSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", body.error.issues[0]?.message ?? "Validasi gagal."));
    }
    const { itemType, itemId, couponCode, referralCode } = body.data;
    const userId = req.user!.id;

    // Get item details
    let itemTitle = "";
    let price = 0;
    /** Slug of the purchased item — used to build the failure redirect URL */
    let itemSlug = "";

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
      itemSlug = course.slug;
    } else if (itemType === "ebook") {
      const ebook = await prisma.eBook.findUnique({ where: { id: itemId } });
      if (!ebook || ebook.status !== "published") throw new AppError(404, "E-Book tidak ditemukan.");
      itemTitle = ebook.title;
      price = ebook.salePrice ? Number(ebook.salePrice) : Number(ebook.price);
      itemSlug = ebook.slug;
    } else {
      const event = await prisma.event.findUnique({ where: { id: itemId } });
      if (!event || event.status !== "published") throw new AppError(404, "Event tidak ditemukan.");

      const alreadyRegistered = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: itemId, userId } },
      });
      if (alreadyRegistered) throw new AppError(400, "Anda sudah terdaftar di event ini.");

      if (event.quota && event.totalSold >= event.quota) {
        throw new AppError(400, "Kapasitas event sudah penuh.");
      }

      itemTitle = event.title;
      price = event.salePrice ? Number(event.salePrice) : Number(event.price);
      itemSlug = event.slug;

      if (price === 0) {
        // Free event — register immediately, skip payment
        await prisma.eventRegistration.create({
          data: { eventId: itemId, userId, status: "confirmed" },
        });
        return res.json(successResponse({ orderId: null, paymentUrl: null, finalAmount: 0, free: true }));
      }
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
    // Validate referral code
    let resolvedReferralCode: string | undefined;
    if (referralCode) {
      const affiliate = await prisma.affiliate.findFirst({
        where: { code: referralCode, status: "active" },
      });
      if (affiliate && affiliate.userId !== userId) {
        resolvedReferralCode = referralCode;
        await prisma.affiliate.update({
          where: { id: affiliate.id },
          data: { totalClicks: { increment: 1 } },
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: price,
        discountAmount,
        finalAmount,
        status: "pending",
        couponId: couponId ?? null,
        referralCode: resolvedReferralCode ?? null,
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

    // Build a failure URL so DOKU can redirect the user back to the checkout
    // page (with context) when payment is cancelled or fails.
    let failureUrl: string | undefined;
    if (itemSlug) {
      const returnPath =
        itemType === "event"
          ? `/checkout/${itemSlug}?type=event&itemId=${itemId}`
          : `/checkout/${itemSlug}`;
      failureUrl = `${env.WEB_URL}/payment/failed?orderId=${order.id}&returnUrl=${encodeURIComponent(returnPath)}`;
    }

    const { paymentUrl } = await createDokuOrder(
      invoiceNumber,
      [{ name: itemTitle, price: Math.round(finalAmount), quantity: 1 }],
      Math.round(finalAmount),
      callbackUrl,
      order.user.name,
      order.user.email,
      failureUrl
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

    // Non-blocking notification (queued in prod, inline in dev/test).
    await enqueueEmail({
      type: "payment-pending",
      to: order.user.email,
      name: order.user.name,
      orderId: order.id,
      amount: finalAmount,
      paymentUrl,
    });

    return res.json(successResponse({ orderId: order.id, paymentUrl, finalAmount }));
  } catch (err) {
    next(err);
  }
});

export default router;
