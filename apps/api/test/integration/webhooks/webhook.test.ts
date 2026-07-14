import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    paymentTransaction: { findFirst: vi.fn(), update: vi.fn() },
    order: { findUnique: vi.fn(), update: vi.fn() },
    courseEnrollment: { upsert: vi.fn() },
    eventRegistration: { upsert: vi.fn() },
    event: { update: vi.fn() },
    affiliate: { findFirst: vi.fn(), update: vi.fn() },
    affiliateCommission: { create: vi.fn() },
    coupon: { update: vi.fn() },
    $transaction: vi.fn(),
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
  vi.mocked(prisma.eventRegistration.upsert).mockResolvedValue({} as never);
  vi.mocked(prisma.event.update).mockResolvedValue({} as never);
  vi.mocked(prisma.affiliate.findFirst).mockResolvedValue(null as never);
  vi.mocked(prisma.affiliate.update).mockResolvedValue({} as never);
  vi.mocked(prisma.affiliateCommission.create).mockResolvedValue({} as never);
  vi.mocked(prisma.coupon.update).mockResolvedValue({} as never);
  // Fulfillment now runs inside prisma.$transaction(cb); execute the callback
  // with the mocked prisma as the transaction client so tx.* calls are asserted.
  vi.mocked(prisma.$transaction).mockImplementation((cb: unknown) =>
    (cb as (tx: typeof prisma) => Promise<unknown>)(prisma),
  );
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

  it("is idempotent: skips fulfillment when the order is already paid", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ ...mockOrder, status: "paid" } as never);

    const res = await request(app)
      .post("/api/webhooks/doku")
      .set(webhookHeaders)
      .send({
        order: { invoice_number: "JA-ORDER1" },
        transaction: { status: "SUCCESS" },
        channel: { id: "VIRTUAL_ACCOUNT_BCA" },
      });

    expect(res.status).toBe(200);
    // No re-processing → no duplicate enrollment/commission/notification.
    expect(prisma.order.update).not.toHaveBeenCalled();
    expect(prisma.courseEnrollment.upsert).not.toHaveBeenCalled();
  });

  it("grants event registration and increments sold for event items", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...mockOrder,
      items: [{ itemType: "event", itemId: "event-1", itemTitle: "Webinar" }],
      user: { name: "T", email: "t@t.com", profile: { phone: "628123" } },
    } as never);

    const res = await request(app)
      .post("/api/webhooks/doku")
      .set(webhookHeaders)
      .send({ order: { invoice_number: "JA-ORDER1" }, transaction: { status: "SUCCESS" } });

    expect(res.status).toBe(200);
    expect(prisma.eventRegistration.upsert).toHaveBeenCalled();
    expect(prisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ totalSold: { increment: 1 } }) }),
    );
  });

  it("records an affiliate commission when the order has a referral code", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...mockOrder,
      referralCode: "REF10",
    } as never);
    vi.mocked(prisma.affiliate.findFirst).mockResolvedValue({
      id: "aff-1",
      code: "REF10",
      status: "active",
      commissionRate: 10,
    } as never);

    const res = await request(app)
      .post("/api/webhooks/doku")
      .set(webhookHeaders)
      .send({ order: { invoice_number: "JA-ORDER1" }, transaction: { status: "SUCCESS" } });

    expect(res.status).toBe(200);
    expect(prisma.affiliateCommission.create).toHaveBeenCalled();
    expect(prisma.affiliate.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ totalConversions: { increment: 1 } }) }),
    );
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
