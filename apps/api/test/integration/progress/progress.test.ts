import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import jwt from "jsonwebtoken";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    courseEnrollment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    courseLessonProgress: { upsert: vi.fn() },
    course: { findUnique: vi.fn() },
  },
}));

const { prisma } = await import("../../../src/db/prisma.js");

const VALID_USER = { id: "user-1", email: "a@b.com", isActive: true, deletedAt: null, roles: [{ role: "student" }] };

const TOKEN = jwt.sign(
  { sub: "user-1", email: "a@b.com", roles: ["student"] },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);
const AUTH = { Authorization: `Bearer ${TOKEN}` };

const ENROLLMENT = {
  id: "enr-1",
  userId: "user-1",
  courseId: "course-1",
  isCompleted: false,
  progressPct: 0,
  course: {
    sections: [
      { lessons: [{ id: "lesson-1" }, { id: "lesson-2" }] },
    ],
  },
  progress: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_USER as never);
});

describe("POST /api/progress", () => {
  it("returns 200 on valid progress update", async () => {
    vi.mocked(prisma.courseEnrollment.findUnique).mockResolvedValue(ENROLLMENT as never);
    vi.mocked(prisma.courseLessonProgress.upsert).mockResolvedValue({
      id: "prog-1",
      enrollmentId: "enr-1",
      lessonId: "00000000-0000-0000-0000-000000000001",
      watchedPct: 50,
      isCompleted: false,
    } as never);
    vi.mocked(prisma.courseEnrollment.update).mockResolvedValue(ENROLLMENT as never);

    const res = await request(app)
      .post("/api/progress")
      .set(AUTH)
      .send({
        enrollmentId: "00000000-0000-0000-0000-000000000001",
        lessonId: "00000000-0000-0000-0000-000000000002",
        watchedPct: 50,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 400 for watchedPct > 100", async () => {
    const res = await request(app)
      .post("/api/progress")
      .set(AUTH)
      .send({
        enrollmentId: "00000000-0000-0000-0000-000000000001",
        lessonId: "00000000-0000-0000-0000-000000000002",
        watchedPct: 150,
      });
    expect(res.status).toBe(400);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/progress")
      .send({ enrollmentId: "e", lessonId: "l", watchedPct: 50 });
    expect(res.status).toBe(401);
  });
});
