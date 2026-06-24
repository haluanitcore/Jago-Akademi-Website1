import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";

// Mock Prisma to avoid requiring a live database
vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { prisma } from "../../../src/db/prisma.js";

const mockPrisma = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  auditLog: { create: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

const validPayload = {
  name: "Budi Santoso",
  email: "budi@example.com",
  password: "SecurePass123",
  consent: true,
};

describe("POST /api/auth/register", () => {
  it("returns 201 on valid registration", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "uuid-1",
      email: validPayload.email,
      name: validPayload.name,
    });

    const res = await request(app).post("/api/auth/register").send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe("uuid-1");
  });

  it("returns 409 when email already exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

    const res = await request(app).post("/api/auth/register").send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when consent is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validPayload, consent: false });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when password is too short", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validPayload, password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when email is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validPayload, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: validPayload.email, password: validPayload.password, consent: true });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
