import { Router } from "express";
import { verifyDokuWebhook } from "../services/payment/dokuService.js";
import { enqueueWebhook } from "../jobs/queues.js";

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

    // Fulfillment (DB update, enrollment, affiliate, notifications) is offloaded
    // to the webhook queue so DOKU gets a fast ack; it is processed idempotently.
    // With Redis disabled (dev/test) it runs inline within this await.
    if (invoiceNumber && txStatus) {
      await enqueueWebhook({ invoiceNumber, txStatus, channelId: payload?.channel?.id });
    }

    return res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

export default router;
