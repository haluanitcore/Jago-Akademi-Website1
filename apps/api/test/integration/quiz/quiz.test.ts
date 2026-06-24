import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import jwt from "jsonwebtoken";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    quiz: { findUnique: vi.fn() },
    quizSubmission: { create: vi.fn() },
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

const QUIZ = {
  id: "quiz-1",
  lessonId: "lesson-1",
  passMark: 70,
  questions: [
    { id: "q-1", question: "2 + 2?", options: ["3", "4", "5", "6"], sortOrder: 0, answer: 1 },
    { id: "q-2", question: "Capital of Indonesia?", options: ["Bandung", "Jakarta", "Surabaya"], sortOrder: 1, answer: 1 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.user.findUnique).mockResolvedValue(VALID_USER as never);
});

describe("GET /api/quiz/:lessonId", () => {
  it("returns quiz without answer field", async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(QUIZ as never);

    const res = await request(app).get("/api/quiz/lesson-1").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.questions[0]).not.toHaveProperty("answer");
  });

  it("returns 404 for missing quiz", async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);
    const res = await request(app).get("/api/quiz/no-lesson").set(AUTH);
    expect(res.status).toBe(404);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/quiz/lesson-1");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/quiz/:lessonId/submit", () => {
  it("scores correctly and marks passed when above pass mark", async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(QUIZ as never);
    vi.mocked(prisma.quizSubmission.create).mockResolvedValue({
      id: "sub-1",
      score: 100,
      isPassed: true,
    } as never);

    const res = await request(app)
      .post("/api/quiz/lesson-1/submit")
      .set(AUTH)
      .send({ answers: { "q-1": 1, "q-2": 1 } });

    expect(res.status).toBe(200);
    expect(res.body.data.score).toBe(100);
    expect(res.body.data.isPassed).toBe(true);
    expect(res.body.data.correct).toBe(2);
  });

  it("marks as failed when score below pass mark", async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(QUIZ as never);
    vi.mocked(prisma.quizSubmission.create).mockResolvedValue({
      id: "sub-2",
      score: 50,
      isPassed: false,
    } as never);

    const res = await request(app)
      .post("/api/quiz/lesson-1/submit")
      .set(AUTH)
      .send({ answers: { "q-1": 0, "q-2": 1 } });

    expect(res.status).toBe(200);
    expect(res.body.data.isPassed).toBe(false);
    expect(res.body.data.score).toBe(50);
  });

  it("returns 400 for missing answers", async () => {
    const res = await request(app)
      .post("/api/quiz/lesson-1/submit")
      .set(AUTH)
      .send({});
    expect(res.status).toBe(400);
  });
});
