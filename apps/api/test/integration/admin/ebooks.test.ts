import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import jwt from "jsonwebtoken";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    eBook: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
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

const ADMIN_TOKEN = jwt.sign(
  { sub: "admin-1", email: "admin@jago.id", roles: ["super_admin"] },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);

const ADMIN_AUTH = { Authorization: `Bearer ${ADMIN_TOKEN}` };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/ebooks", () => {
  it("returns paginated ebooks list", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.eBook.findMany).mockResolvedValue([{ id: "eb-1", title: "Test Ebook", slug: "test-ebook" }] as never);
    vi.mocked(prisma.eBook.count).mockResolvedValue(1);

    const res = await request(app).get("/api/admin/ebooks").set(ADMIN_AUTH);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });
});

describe("POST /api/admin/ebooks", () => {
  it("creates a new ebook", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.eBook.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.eBook.create).mockResolvedValue({ id: "eb-1", title: "New Ebook", slug: "new-ebook" } as never);

    const res = await request(app)
      .post("/api/admin/ebooks")
      .set(ADMIN_AUTH)
      .send({
        slug: "new-ebook",
        title: "New Ebook",
        price: 150000,
        fileUrl: "https://jago.id/ebook.pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe("new-ebook");
  });
});

describe("PATCH /api/admin/ebooks/:id", () => {
  it("updates an existing ebook", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.eBook.findUnique).mockResolvedValue({ id: "eb-1", slug: "old-slug" } as never);
    vi.mocked(prisma.eBook.update).mockResolvedValue({ id: "eb-1", title: "Updated Ebook" } as never);

    const res = await request(app)
      .patch("/api/admin/ebooks/eb-1")
      .set(ADMIN_AUTH)
      .send({
        title: "Updated Ebook",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Updated Ebook");
  });
});

describe("DELETE /api/admin/ebooks/:id", () => {
  it("deletes an ebook", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_ADMIN as never);
    vi.mocked(prisma.eBook.findUnique).mockResolvedValue({ id: "eb-1" } as never);
    vi.mocked(prisma.eBook.delete).mockResolvedValue({ id: "eb-1" } as never);

    const res = await request(app).delete("/api/admin/ebooks/eb-1").set(ADMIN_AUTH);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
