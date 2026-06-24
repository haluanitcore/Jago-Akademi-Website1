import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    course: { findMany: vi.fn(), count: vi.fn() },
    courseCategory: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock("../../../src/services/search/meilisearch.js", () => ({
  searchCourses: vi.fn().mockResolvedValue([]),
  indexCourse: vi.fn().mockResolvedValue(undefined),
  deleteCourseFromIndex: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "../../../src/db/prisma.js";
import { searchCourses } from "../../../src/services/search/meilisearch.js";

const mockPrisma = prisma as unknown as {
  course: { findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
};
const mockSearch = searchCourses as ReturnType<typeof vi.fn>;

const fakeCourse = {
  id: "c1",
  slug: "marketing-101",
  title: "Marketing 101",
  shortDesc: null,
  price: "99000",
  salePrice: null,
  status: "published",
  level: "beginner",
  thumbnailUrl: null,
  totalDuration: 0,
  totalLessons: 0,
  totalEnrolled: 0,
  avgRating: "0",
  totalReviews: 0,
  isFeatured: false,
  publishedAt: null,
  createdAt: new Date().toISOString(),
  category: null,
  trainer: { id: "t1", name: "Trainer", avatarUrl: null },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.course.findMany.mockResolvedValue([fakeCourse]);
  mockPrisma.course.count.mockResolvedValue(1);
});

describe("GET /api/search", () => {
  it("returns empty array for missing query", async () => {
    const res = await request(app).get("/api/search");
    expect(res.status).toBe(200);
    expect(res.body.data.courses).toHaveLength(0);
  });

  it("returns empty array for query shorter than 2 chars", async () => {
    const res = await request(app).get("/api/search?q=a");
    expect(res.status).toBe(200);
    expect(res.body.data.courses).toHaveLength(0);
  });

  it("falls back to Prisma search when Meilisearch returns empty", async () => {
    mockSearch.mockResolvedValue([]);
    const res = await request(app).get("/api/search?q=marketing");
    expect(res.status).toBe(200);
    expect(res.body.data.courses).toHaveLength(1);
    expect(res.body.data.q).toBe("marketing");
  });

  it("returns Meilisearch results when available", async () => {
    mockSearch.mockResolvedValue([{ id: "c1", slug: "marketing-101", title: "Marketing 101" }]);
    mockPrisma.course.findMany.mockResolvedValue([fakeCourse]);
    const res = await request(app).get("/api/search?q=marketing");
    expect(res.status).toBe(200);
    expect(res.body.data.courses).toHaveLength(1);
  });

  it("includes pagination metadata", async () => {
    const res = await request(app).get("/api/search?q=marketing&page=1&limit=10");
    expect(res.body.data).toHaveProperty("page");
    expect(res.body.data).toHaveProperty("limit");
    expect(res.body.data).toHaveProperty("total");
  });
});
