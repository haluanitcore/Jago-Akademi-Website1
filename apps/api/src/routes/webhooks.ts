import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { verifyDokuWebhook } from "../services/payment/dokuService.js";
import { sendPaymentSuccess } from "../services/notification/emailService.js";
import { notifyPaymentSuccess } from "../services/notification/whatsappService.js";
import { sendOrderInvoice } from "../services/notification/emailService.js";

const router = Router();

router.post("/doku", async (req, res, next) => {
  try {
    const clientId = req.headers["client-id"] as string;
    const requestId = req.headers["request-id"] as string;
    const timestamp = req.headers["request-timestamp"] as string;
    const signature = req.headers["signature"] as string;

    const rawBody: Buffer | undefined = (req as unknown as { rawBody?: Buffer }).rawBody;
    const bodyStr = rawBody ? rawBody.toString("utf8") : JSON.stringify(req.body);

    if (!verifyDokuWebhook(clientId, requestId, timestamp, bodyStr, signature)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const payload = req.body as {
      order?: { invoice_number?: string };
      transaction?: { status?: string; date?: string };
      channel?: { id?: string };
    };

    const invoiceNumber = payload?.order?.invoice_number;
    const txStatus = payload?.transaction?.status;

    if (!invoiceNumber) return res.json({ received: true });

    // Find order by gatewayTxId
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { gatewayTxId: invoiceNumber },
    });

    if (!transaction) return res.json({ received: true });

    const order = await prisma.order.findUnique({
      where: { id: transaction.orderId },
      include: {
        user: { select: { name: true, email: true, profile: { select: { phone: true } } } },
        items: true,
      },
    });

    if (!order) return res.json({ received: true });

    if (txStatus === "SUCCESS") {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "paid", paidAt: new Date(), paymentMethod: payload?.channel?.id ?? "doku" },
      });

      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: "success" },
      });

      // Grant access to purchased items
      for (const item of order.items) {
        if (item.itemType === "course") {
          await prisma.courseEnrollment.upsert({
            where: { courseId_userId: { courseId: item.itemId, userId: order.userId } },
            create: { courseId: item.itemId, userId: order.userId },
            update: {},
          });
        }
      }

      // Notifications (fire and forget)
      const courseName = order.items[0]?.itemTitle ?? "produk";
      sendPaymentSuccess(order.user.email, order.user.name, order.id, courseName, Number(order.finalAmount)).catch(() => {});
      sendOrderInvoice(order.user.email, order.user.name, order.id).catch(() => {});
      const phone = order.user.profile?.phone;
      if (phone) {
        notifyPaymentSuccess(phone, order.user.name, courseName).catch(() => {});
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

    return res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

export default router;
