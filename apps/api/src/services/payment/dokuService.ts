import { createHmac, createHash } from "node:crypto";
import { env } from "../../config/env.js";

const SANDBOX_URL = "https://api-sandbox.doku.com";
const PRODUCTION_URL = "https://api.doku.com";

function baseUrl() {
  return env.DOKU_IS_PRODUCTION ? PRODUCTION_URL : SANDBOX_URL;
}

function sign(clientId: string, requestId: string, timestamp: string, body: string, secretKey: string): string {
  const bodyHash = createHash("sha256").update(body, "utf8").digest("base64");
  const components = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${timestamp}`,
    `Request-Body:${bodyHash}`,
  ].join("\n");
  return createHmac("sha256", secretKey).update(components).digest("base64");
}

export type DokuOrderItem = {
  name: string;
  price: number;
  quantity: number;
};

export type DokuCreateOrderResult = {
  invoiceNumber: string;
  paymentUrl: string;
};

export async function createDokuOrder(
  invoiceNumber: string,
  items: DokuOrderItem[],
  totalAmount: number,
  callbackUrl: string,
  customerName: string,
  customerEmail: string
): Promise<DokuCreateOrderResult> {
  if (!env.DOKU_CLIENT_ID || !env.DOKU_SECRET_KEY) {
    // Dev fallback: return a mock payment URL
    return {
      invoiceNumber,
      paymentUrl: `${env.WEB_URL}/payment/success?order=${invoiceNumber}&mock=1`,
    };
  }

  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const body = JSON.stringify({
    order: {
      invoice_number: invoiceNumber,
      line_items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      amount: totalAmount,
      currency: "IDR",
      callback_url: callbackUrl,
      auto_redirect: true,
    },
    payment: { payment_due_date: 60 },
    customer: {
      name: customerName,
      email: customerEmail,
    },
  });

  const signature = sign(env.DOKU_CLIENT_ID, requestId, timestamp, body, env.DOKU_SECRET_KEY);

  const res = await fetch(`${baseUrl()}/checkout/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": env.DOKU_CLIENT_ID,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      Signature: signature,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DOKU API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { payment: { url: string } };
  return { invoiceNumber, paymentUrl: data.payment.url };
}

export function verifyDokuWebhook(
  clientId: string,
  requestId: string,
  timestamp: string,
  rawBody: string,
  receivedSignature: string
): boolean {
  if (!env.DOKU_SECRET_KEY) return true; // dev mode: trust all
  const expected = sign(clientId, requestId, timestamp, rawBody, env.DOKU_SECRET_KEY);
  return expected === receivedSignature;
}
