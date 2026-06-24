import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    course: {
      findUnique: vi.fn(),
    },
    courseEnrollment: {
      findUnique: vi.fn(),
    },
    coupon: {
      findUnique: vi.fn(),
    },
    order: {
      create: vi.fn(),
      update: vi.fn(),
    },
    paymentTransaction: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../../../src/middleware/authenticate.js", () => ({
  authenticate: vi.fn((req, _res, next) => {
    req.user = { id: "user-1", email: "user@test.com", name: "Test User", roles: ["student"] };
    next();
  }),
}));

vi.mock("../../../src/services/payment/dokuService.js", () => ({
  createDokuOrder: vi.fn().mockResolvedValue({
    invoiceNumber: "JA-TEST123",
    paymentUrl: "http://localhost:3000/payment/success?order=JA-TEST123&mock=1",
  }),
}));

vi.mock("../../../src/services/notification/emailService.js", () => ({
  sendPaymentPending: vi.fn().mockResolvedValue(undefined),
  sendPaymentSuccess: vi.fn().mockResolvedValue(undefined),
  sendOrderInvoice: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../src/services/coupon/couponService.js", () => ({
  validateCoupon: vi.fn(),
  incrementCouponUsage: vi.fn().mockResolvedValue(undefined),
}));

const { prisma } = await import("../../../src/db/prisma.js");
const { validateCoupon } = await import("../../../src/services/coupon/couponService.js");

const mockCourse = {
  id: "course-1",
  title: "Kursus Test",
  slug: "kursus-test",
  price: 299000,
  coverUrl: null,
};

const mockOrder = {
  id: "order-1",
  status: "pending",
  finalAmount: 299000,
  user: { name: "Test User", email: "user@test.com" },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as never);
  vi.mocked(prisma.courseEnrollment.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.order.create).mockResolvedValue(mockOrder as never);
  vi.mocked(prisma.paymentTransaction.create).mockResolvedValue({} as never);
});

describe("POST /api/checkout", () => {
  it("creates order and returns paymentUrl for course", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .send({ itemType: "course", itemId: "course-1" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentUrl).toBeDefined();
    expect(res.body.data.orderId).toBe("order-1");
  });

  it("returns 400 when itemType is invalid", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .send({ itemType: "invalid", itemId: "course-1" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when course not found", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post("/api/checkout")
      .send({ itemType: "course", itemId: "nonexistent" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when user already enrolled", async () => {
    vi.mocked(prisma.courseEnrollment.findUnique).mockResolvedValue({ id: "enroll-1" } as never);

    const res = await request(app)
      .post("/api/checkout")
      .send({ itemType: "course", itemId: "course-1" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("sudah terdaftar");
  });

  it("applies coupon when valid coupon code is provided", async () => {
    vi.mocked(validateCoupon).mockResolvedValue({
      couponId: "coupon-1",
      code: "DISKON10",
      discountAmount: 29900,
      finalAmount: 269100,
    });

    vi.mocked(prisma.order.create).mockResolvedValue({
      ...mockOrder,
      finalAmount: 269100,
    } as never);

    const res = await request(app)
      .post("/api/checkout")
      .send({ itemType: "course", itemId: "course-1", couponCode: "DISKON10" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.finalAmount).toBe(269100);
  });

  it("returns 400 when itemId is missing", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .send({ itemType: "course" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
