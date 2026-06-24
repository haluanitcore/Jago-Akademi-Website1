import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    lmsUserInvite: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    lmsBatchMember: {
      upsert: vi.fn(),
    },
    lmsCourseAssignment: {
      findMany: vi.fn(),
    },
    lmsEnrollment: {
      upsert: vi.fn(),
    },
    userRole: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("../../../src/middleware/authenticate.js", () => ({
  authenticate: vi.fn((req, _res, next) => {
    req.user = { id: "user-1", email: "user@test.com", name: "User", roles: ["student"] };
    next();
  }),
}));

const { prisma } = await import("../../../src/db/prisma.js");

const mockInvite = {
  id: "invite-1",
  tenantId: "tenant-1",
  email: "user@test.com",
  batchId: "batch-1",
  status: "pending",
  token: "test-token-abc",
  expiresAt: new Date(Date.now() + 7 * 86400000),
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.lmsUserInvite.create).mockResolvedValue(mockInvite as never);
  vi.mocked(prisma.lmsUserInvite.findUnique).mockResolvedValue(mockInvite as never);
  vi.mocked(prisma.lmsUserInvite.update).mockResolvedValue({ ...mockInvite, status: "accepted" } as never);
  vi.mocked(prisma.lmsBatchMember.upsert).mockResolvedValue({} as never);
  vi.mocked(prisma.lmsCourseAssignment.findMany).mockResolvedValue([]);
  vi.mocked(prisma.lmsEnrollment.upsert).mockResolvedValue({} as never);
  vi.mocked(prisma.userRole.findFirst).mockResolvedValue({ role: "super_admin" } as never);
});

describe("POST /api/lms/tenants/:tenantId/invites", () => {
  it("creates bulk invites", async () => {
    const res = await request(app)
      .post("/api/lms/tenants/tenant-1/invites")
      .send({ emails: ["user@test.com", "other@test.com"], batchId: "batch-1" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.created).toContain("user@test.com");
  });

  it("returns 400 when emails array is empty", async () => {
    const res = await request(app)
      .post("/api/lms/tenants/tenant-1/invites")
      .send({ emails: [] });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/lms/invite/:token/accept", () => {
  it("accepts a valid invite and adds to batch", async () => {
    const res = await request(app).post("/api/lms/invite/test-token-abc/accept");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tenantId).toBe("tenant-1");
    expect(prisma.lmsBatchMember.upsert).toHaveBeenCalled();
  });

  it("returns 404 for unknown token", async () => {
    vi.mocked(prisma.lmsUserInvite.findUnique).mockResolvedValue(null);
    const res = await request(app).post("/api/lms/invite/bad-token/accept");
    expect(res.status).toBe(404);
  });

  it("returns 400 for already accepted invite", async () => {
    vi.mocked(prisma.lmsUserInvite.findUnique).mockResolvedValue({
      ...mockInvite,
      status: "accepted",
    } as never);
    const res = await request(app).post("/api/lms/invite/test-token-abc/accept");
    expect(res.status).toBe(400);
  });

  it("returns 403 when email does not match", async () => {
    vi.mocked(prisma.lmsUserInvite.findUnique).mockResolvedValue({
      ...mockInvite,
      email: "other@test.com",
    } as never);
    const res = await request(app).post("/api/lms/invite/test-token-abc/accept");
    expect(res.status).toBe(403);
  });

  it("returns 400 when invite is expired", async () => {
    vi.mocked(prisma.lmsUserInvite.findUnique).mockResolvedValue({
      ...mockInvite,
      expiresAt: new Date(Date.now() - 1000),
    } as never);
    const res = await request(app).post("/api/lms/invite/test-token-abc/accept");
    expect(res.status).toBe(400);
  });
});
