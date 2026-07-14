import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import jwt from "jsonwebtoken";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    user: { findUnique: vi.fn(), count: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    course: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    courseEnrollment: { count: vi.fn() },
    order: { aggregate: vi.fn() },
  },
}));

const { prisma } = await import("../../../src/db/prisma.js");

const VALID_ADMIN = {
  id: "admin-1",
  email: "admin@jago.id",
  isActive: true,
  deletedAt: null,
  roles: [{ role: "super_admin" }],
};

const VALID_USER = {
  id: "user-1",
  email: "user@jago.id",
  isActive: true,
  deletedAt: null,
  roles: [{ role: "student" }],
};

const ADMIN_TOKEN = jwt.sign(
  { sub: "admin-1", email: "admin@jago.id", roles: ["super_admin"] },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);

const USER_TOKEN = jwt.sign(
  { sub: "user-1", email: "user@jago.id", roles: ["student"] },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);

const ADMIN_AUTH = { Authorization: `Bearer ${ADMIN_TOKEN}` };
const USER_AUTH = { Authorization: `Bearer ${USER_TOKEN}` };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/stats", () => {
  it("returns stats for super_admin", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.user.count).mockResolvedValue(42);
    vi.mocked(prisma.course.count).mockResolvedValue(10);
    vi.mocked(prisma.courseEnrollment.count).mockResolvedValue(200);
    vi.mocked(prisma.order.aggregate).mockResolvedValue({ _sum: { finalAmount: 5000000 } } as never);

    const res = await request(app).get("/api/admin/stats").set(ADMIN_AUTH);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBe(42);
  });

  it("returns 403 for non-admin users", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_USER as never);

    const res = await request(app).get("/api/admin/stats").set(USER_AUTH);
    expect(res.status).toBe(403);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/admin/users", () => {
  it("returns paginated users", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.user.findMany).mockResolvedValue([VALID_ADMIN] as never);
    vi.mocked(prisma.user.count).mockResolvedValue(1);

    const res = await request(app).get("/api/admin/users").set(ADMIN_AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });
});

describe("PATCH /api/admin/users/:id", () => {
  it("deactivates a user", async () => {
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(VALID_ADMIN as never)
      .mockResolvedValueOnce(VALID_USER as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...VALID_USER, isActive: false } as never);

    const res = await request(app)
      .patch("/api/admin/users/user-1")
      .set(ADMIN_AUTH)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it("returns 400 with invalid payload", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);

    const res = await request(app)
      .patch("/api/admin/users/user-1")
      .set(ADMIN_AUTH)
      .send({ isActive: "yes" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/admin/courses", () => {
  it("returns course list", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.course.findMany).mockResolvedValue([
      { id: "c-1", title: "Test Course", status: "draft" },
    ] as never);
    vi.mocked(prisma.course.count).mockResolvedValue(1);

    const res = await request(app).get("/api/admin/courses").set(ADMIN_AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe("PATCH /api/admin/courses/:id", () => {
  it("publishes a draft course", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: "c-1", status: "draft" } as never);
    vi.mocked(prisma.course.update).mockResolvedValue({
      id: "c-1",
      title: "Test",
      status: "published",
      publishedAt: new Date(),
    } as never);

    const res = await request(app)
      .patch("/api/admin/courses/c-1")
      .set(ADMIN_AUTH)
      .send({ status: "published" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("published");
  });

  it("reverts a course to draft", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: "c-1", status: "published" } as never);
    vi.mocked(prisma.course.update).mockResolvedValue({
      id: "c-1",
      title: "Test",
      status: "draft",
    } as never);

    const res = await request(app)
      .patch("/api/admin/courses/c-1")
      .set(ADMIN_AUTH)
      .send({ status: "draft" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("draft");
  });

  it("returns 400 with invalid status", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);

    const res = await request(app)
      .patch("/api/admin/courses/c-1")
      .set(ADMIN_AUTH)
      .send({ status: "bogus" });

    expect(res.status).toBe(400);
  });
});
