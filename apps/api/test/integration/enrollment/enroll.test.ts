import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import jwt from "jsonwebtoken";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    course: { findUnique: vi.fn() },
    courseEnrollment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = await import("../../../src/db/prisma.js");

const VALID_USER = { id: "user-1", email: "a@b.com", isActive: true, deletedAt: null, roles: [{ role: "student" }] };

const ACCESS_TOKEN = jwt.sign(
  { sub: "user-1", email: "a@b.com", roles: ["student"] },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);

const AUTH = { Authorization: `Bearer ${ACCESS_TOKEN}` };

const COURSE_ID = "00000000-0000-0000-0000-000000000001";
const COURSE = {
  id: COURSE_ID,
  title: "Test Course",
  slug: "test-course",
  status: "published",
  deletedAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_USER as never);
});

describe("POST /api/enrollments", () => {
  it("returns 201 on successful enrollment", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(COURSE as never);
    vi.mocked(prisma.courseEnrollment.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.courseEnrollment.create).mockResolvedValue({
      id: "enr-1",
      courseId: COURSE_ID,
      userId: "user-1",
      course: COURSE,
    } as never);

    const res = await request(app)
      .post("/api/enrollments")
      .set(AUTH)
      .send({ courseId: COURSE_ID });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("enr-1");
  });

  it("returns 409 when already enrolled", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(COURSE as never);
    vi.mocked(prisma.courseEnrollment.findUnique).mockResolvedValue({ id: "enr-1" } as never);

    const res = await request(app)
      .post("/api/enrollments")
      .set(AUTH)
      .send({ courseId: COURSE_ID });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for non-existent course", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post("/api/enrollments")
      .set(AUTH)
      .send({ courseId: "00000000-0000-0000-0000-000000000000" });

    expect(res.status).toBe(404);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).post("/api/enrollments").send({ courseId: COURSE_ID });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid courseId", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .set(AUTH)
      .send({ courseId: "not-a-uuid" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/enrollments", () => {
  it("returns enrolled courses list", async () => {
    vi.mocked(prisma.courseEnrollment.findMany).mockResolvedValue([
      { id: "enr-1", courseId: COURSE_ID, userId: "user-1", course: COURSE, progress: [] },
    ] as never);

    const res = await request(app).get("/api/enrollments").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/enrollments");
    expect(res.status).toBe(401);
  });
});
