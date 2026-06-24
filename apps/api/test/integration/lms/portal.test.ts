import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    lmsTenant: {
      findUnique: vi.fn(),
    },
    lmsBatchMember: {
      findMany: vi.fn(),
    },
    lmsEnrollment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    lmsLesson: {
      findMany: vi.fn(),
    },
    lmsCourse: {
      findUnique: vi.fn(),
    },
    lmsProgress: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    lmsCertificate: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    lmsUserInvite: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    lmsCourseAssignment: {
      findMany: vi.fn(),
    },
    userRole: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("../../../src/middleware/authenticate.js", () => ({
  authenticate: vi.fn((req, _res, next) => {
    req.user = { id: "student-1", email: "student@test.com", name: "Student", roles: ["student"] };
    next();
  }),
}));

const { prisma } = await import("../../../src/db/prisma.js");

const mockTenant = {
  id: "tenant-1",
  slug: "perusahaan-abc",
  name: "PT ABC",
  isActive: true,
};

// Used for findUnique (separate queries — no nested includes needed)
const mockEnrollment = {
  id: "enroll-1",
  tenantId: "tenant-1",
  courseId: "course-1",
  userId: "student-1",
  enrolledAt: new Date(),
  completedAt: null,
};

// Used for findMany (enrolled-courses route still uses nested include)
const mockEnrollmentFull = {
  ...mockEnrollment,
  course: {
    id: "course-1",
    title: "Onboarding",
    description: "Kursus onboarding",
    lessons: [{ id: "lesson-1" }, { id: "lesson-2" }],
  },
  progress: [{ lessonId: "lesson-1" }],
  certificate: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.lmsTenant.findUnique).mockResolvedValue(mockTenant as never);
  vi.mocked(prisma.lmsBatchMember.findMany).mockResolvedValue([
    { batch: { tenant: mockTenant } },
  ] as never);
  vi.mocked(prisma.lmsEnrollment.findMany).mockResolvedValue([mockEnrollmentFull] as never);
  vi.mocked(prisma.lmsEnrollment.findUnique).mockResolvedValue(mockEnrollment as never);
  vi.mocked(prisma.lmsEnrollment.update).mockResolvedValue({} as never);
  vi.mocked(prisma.lmsLesson.findMany).mockResolvedValue([
    { id: "lesson-1", title: "Intro", isCompleted: false, quizzes: [] },
    { id: "lesson-2", title: "Lesson 2", isCompleted: false, quizzes: [] },
  ] as never);
  vi.mocked(prisma.lmsProgress.upsert).mockResolvedValue({} as never);
  vi.mocked(prisma.lmsProgress.findMany).mockResolvedValue([{ id: "p-1", lessonId: "lesson-1" }] as never);
  vi.mocked(prisma.lmsCourse.findUnique).mockResolvedValue({ title: "Onboarding" } as never);
  vi.mocked(prisma.lmsCertificate.findMany).mockResolvedValue([]);
  vi.mocked(prisma.lmsCertificate.upsert).mockResolvedValue({} as never);
  vi.mocked(prisma.lmsCourseAssignment.findMany).mockResolvedValue([]);
  vi.mocked(prisma.userRole.findFirst).mockResolvedValue(null);
});

describe("GET /api/lms/portal/me", () => {
  it("returns list of tenant memberships", async () => {
    const res = await request(app).get("/api/lms/portal/me");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("GET /api/lms/portal/:tenantSlug/courses", () => {
  it("returns enrolled courses with progress", async () => {
    const res = await request(app).get("/api/lms/portal/perusahaan-abc/courses");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].completionPct).toBe(50);
  });

  it("returns 404 when tenant not found", async () => {
    vi.mocked(prisma.lmsTenant.findUnique).mockResolvedValue(null);
    const res = await request(app).get("/api/lms/portal/nonexistent/courses");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/lms/portal/:tenantSlug/courses/:courseId/lessons", () => {
  it("returns lessons with completion status", async () => {
    const res = await request(app).get("/api/lms/portal/perusahaan-abc/courses/course-1/lessons");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 403 when not enrolled", async () => {
    vi.mocked(prisma.lmsEnrollment.findUnique).mockResolvedValue(null);
    const res = await request(app).get("/api/lms/portal/perusahaan-abc/courses/course-99/lessons");
    expect(res.status).toBe(403);
  });
});

describe("POST /api/lms/portal/:tenantSlug/courses/:courseId/lessons/:lessonId/complete", () => {
  it("marks lesson as complete", async () => {
    const res = await request(app).post(
      "/api/lms/portal/perusahaan-abc/courses/course-1/lessons/lesson-2/complete"
    );
    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(true);
    expect(prisma.lmsProgress.upsert).toHaveBeenCalled();
  });

  it("issues certificate when all lessons completed", async () => {
    // 1 total lesson, after upsert findMany returns 1 completed → certificate issued
    vi.mocked(prisma.lmsLesson.findMany).mockResolvedValue([{ id: "lesson-1" }] as never);
    vi.mocked(prisma.lmsProgress.findMany).mockResolvedValue([{ id: "p-1" }] as never);

    const res = await request(app).post(
      "/api/lms/portal/perusahaan-abc/courses/course-1/lessons/lesson-1/complete"
    );
    expect(res.status).toBe(200);
    expect(prisma.lmsCertificate.upsert).toHaveBeenCalled();
  });
});

describe("GET /api/lms/portal/:tenantSlug/certificates", () => {
  it("returns student certificates", async () => {
    vi.mocked(prisma.lmsCertificate.findMany).mockResolvedValue([
      { id: "cert-1", courseTitle: "Onboarding", issuedAt: new Date() },
    ] as never);
    const res = await request(app).get("/api/lms/portal/perusahaan-abc/certificates");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});
