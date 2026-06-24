import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    paymentTransaction: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    courseEnrollment: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("../../../src/services/payment/dokuService.js", () => ({
  verifyDokuWebhook: vi.fn().mockReturnValue(true),
}));

vi.mock("../../../src/services/notification/emailService.js", () => ({
  sendPaymentSuccess: vi.fn().mockResolvedValue(undefined),
  sendOrderInvoice: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../src/services/notification/whatsappService.js", () => ({
  notifyPaymentSuccess: vi.fn().mockResolvedValue(undefined),
}));

const { prisma } = await import("../../../src/db/prisma.js");

const mockTransaction = {
  id: "tx-1",
  orderId: "order-1",
  gatewayTxId: "JA-ORDER1",
};

const mockOrder = {
  id: "order-1",
  userId: "user-1",
  finalAmount: 299000,
  items: [{ itemType: "course", itemId: "course-1", itemTitle: "Kursus Test" }],
  user: { name: "Test User", email: "test@test.com", profile: null },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.paymentTransaction.findFirst).mockResolvedValue(mockTransaction as never);
  vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as never);
  vi.mocked(prisma.order.update).mockResolvedValue({} as never);
  vi.mocked(prisma.paymentTransaction.update).mockResolvedValue({} as never);
  vi.mocked(prisma.courseEnrollment.upsert).mockResolvedValue({} as never);
});

const webhookHeaders = {
  "client-id": "CLIENT-123",
  "request-id": "req-123",
  "request-timestamp": new Date().toISOString(),
  signature: "mock-signature",
};

describe("POST /api/webhooks/doku", () => {
  it("handles SUCCESS payment and grants enrollment", async () => {
    const res = await request(app)
      .post("/api/webhooks/doku")
      .set(webhookHeaders)
      .send({
        order: { invoice_number: "JA-ORDER1" },
        transaction: { status: "SUCCESS" },
        channel: { id: "VIRTUAL_ACCOUNT_BCA" },
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "paid" }) })
    );
    expect(prisma.courseEnrollment.upsert).toHaveBeenCalled();
  });

  it("handles FAILED payment", async () => {
    const res = await request(app)
      .post("/api/webhooks/doku")
      .set(webhookHeaders)
      .send({
        order: { invoice_number: "JA-ORDER1" },
        transaction: { status: "FAILED" },
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "failed" }) })
    );
    expect(prisma.courseEnrollment.upsert).not.toHaveBeenCalled();
  });

  it("handles EXPIRED payment", async () => {
    const res = await request(app)
      .post("/api/webhooks/doku")
      .set(webhookHeaders)
      .send({
        order: { invoice_number: "JA-ORDER1" },
        transaction: { status: "EXPIRED" },
      });

    expect(res.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "expired" }) })
    );
  });

  it("returns 401 when signature is invalid", async () => {
    const { verifyDokuWebhook } = await import("../../../src/services/payment/dokuService.js");
    vi.mocked(verifyDokuWebhook).mockReturnValueOnce(false);

    const res = await request(app)
      .post("/api/webhooks/doku")
      .set(webhookHeaders)
      .send({
        order: { invoice_number: "JA-FAKE" },
        transaction: { status: "SUCCESS" },
      });

    expect(res.status).toBe(401);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("gracefully handles unknown invoice number", async () => {
    vi.mocked(prisma.paymentTransaction.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post("/api/webhooks/doku")
      .set(webhookHeaders)
      .send({
        order: { invoice_number: "JA-UNKNOWN" },
        transaction: { status: "SUCCESS" },
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});
