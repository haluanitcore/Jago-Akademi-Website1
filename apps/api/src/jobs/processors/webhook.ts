import { prisma } from "../../db/prisma.js";
import { logger } from "../../lib/logger.js";
import { processEmail } from "./email.js";
import type { WebhookJob } from "../types.js";

/** Best-effort notification: a failed email/WA must not fail payment fulfillment. */
async function safeNotify(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    logger.warn("webhook notification failed", { err: String(err) });
  }
}

/**
 * DOKU payment fulfillment (TASK-022). Extracted from the webhook route so it can
 * run on the worker. Idempotent: a SUCCESS for an already-paid order returns early,
 * which prevents duplicate enrollments, affiliate commissions, and notifications
 * when DOKU retries the same webhook (fixes a prior double-counting bug).
 */
export async function processWebhookPayment(job: WebhookJob): Promise<void> {
  const { invoiceNumber, txStatus, channelId } = job;

  const transaction = await prisma.paymentTransaction.findFirst({
    where: { gatewayTxId: invoiceNumber },
  });
  if (!transaction) return;

  const order = await prisma.order.findUnique({
    where: { id: transaction.orderId },
    include: {
      user: { select: { name: true, email: true, profile: { select: { phone: true } } } },
      items: true,
    },
  });
  if (!order) return;

  if (txStatus === "SUCCESS") {
    // Idempotency guard — already fulfilled, nothing more to do.
    if (order.status === "paid") return;

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid", paidAt: new Date(), paymentMethod: channelId ?? "doku" },
    });
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: "success" },
    });

    // Grant access to purchased items.
    for (const item of order.items) {
      if (item.itemType === "course") {
        await prisma.courseEnrollment.upsert({
          where: { courseId_userId: { courseId: item.itemId, userId: order.userId } },
          create: { courseId: item.itemId, userId: order.userId },
          update: {},
        });
      } else if (item.itemType === "event") {
        await prisma.eventRegistration.upsert({
          where: { eventId_userId: { eventId: item.itemId, userId: order.userId } },
          create: { eventId: item.itemId, userId: order.userId, orderId: order.id, status: "confirmed" },
          update: { status: "confirmed", orderId: order.id },
        });
        await prisma.event.update({
          where: { id: item.itemId },
          data: { totalSold: { increment: 1 } },
        });
      }
    }

    // Affiliate commission (now safe from double-count thanks to the guard above).
    if (order.referralCode) {
      const affiliate = await prisma.affiliate.findFirst({
        where: { code: order.referralCode, status: "active" },
      });
      if (affiliate) {
        const commissionPct = Number(affiliate.commissionRate);
        const commissionAmt = (Number(order.finalAmount) * commissionPct) / 100;
        await prisma.affiliateCommission.create({
          data: {
            affiliateId: affiliate.id,
            orderId: order.id,
            referredUserId: order.userId,
            commissionPct: affiliate.commissionRate,
            grossAmount: order.finalAmount,
            commissionAmt,
            status: "pending",
          },
        });
        await prisma.affiliate.update({
          where: { id: affiliate.id },
          data: {
            totalConversions: { increment: 1 },
            totalEarnings: { increment: commissionAmt },
            balance: { increment: commissionAmt },
          },
        });
      }
    }

    // Notifications — best-effort so they never fail fulfillment.
    const courseName = order.items[0]?.itemTitle ?? "produk";
    await safeNotify(() =>
      processEmail({
        type: "payment-success",
        to: order.user.email,
        name: order.user.name,
        orderId: order.id,
        courseName,
        amount: Number(order.finalAmount),
      }),
    );
    await safeNotify(() =>
      processEmail({ type: "order-invoice", to: order.user.email, name: order.user.name, orderId: order.id }),
    );
    const phone = order.user.profile?.phone;
    if (phone) {
      await safeNotify(() =>
        processEmail({ type: "wa-payment-success", phone, name: order.user.name, courseName }),
      );
    }
  } else if (txStatus === "FAILED" || txStatus === "EXPIRED") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: txStatus === "FAILED" ? "failed" : "expired" },
    });
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: "failed" },
    });
  }
}
