import {
  sendPaymentSuccess,
  sendPaymentPending,
  sendOrderInvoice,
} from "../../services/notification/emailService.js";
import { notifyPaymentSuccess } from "../../services/notification/whatsappService.js";
import type { EmailJob } from "../types.js";

/** Send a transactional notification (email or WhatsApp). Leaf processor. */
export async function processEmail(job: EmailJob): Promise<void> {
  switch (job.type) {
    case "payment-success":
      await sendPaymentSuccess(job.to, job.name, job.orderId, job.courseName, job.amount);
      return;
    case "payment-pending":
      await sendPaymentPending(job.to, job.name, job.orderId, job.amount, job.paymentUrl);
      return;
    case "order-invoice":
      await sendOrderInvoice(job.to, job.name, job.orderId);
      return;
    case "wa-payment-success":
      await notifyPaymentSuccess(job.phone, job.name, job.courseName);
      return;
  }
}
