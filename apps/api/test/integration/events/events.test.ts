import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    event: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    eventRegistration: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../../src/middleware/authenticate.js", () => ({
  authenticate: vi.fn((req, _res, next) => {
    req.user = { id: "user-1", email: "user@test.com", name: "Test", roles: ["super_admin"] };
    next();
  }),
}));

const { prisma } = await import("../../../src/db/prisma.js");

const mockEvent = {
  id: "event-1",
  slug: "workshop-ui-ux",
  title: "Workshop UI/UX",
  description: "Belajar UI/UX",
  type: "online",
  status: "published",
  startDate: new Date("2026-07-01"),
  endDate: null,
  location: null,
  venue: null,
  price: "150000",
  salePrice: null,
  quota: 100,
  totalSold: 10,
  coverUrl: null,
  speakerName: "Budi Santoso",
  speakerBio: null,
  isFeatured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.event.findMany).mockResolvedValue([mockEvent] as never);
  vi.mocked(prisma.event.findUnique).mockResolvedValue(mockEvent as never);
  vi.mocked(prisma.event.count).mockResolvedValue(1);
});

describe("GET /api/events", () => {
  it("returns list of published events", async () => {
    const res = await request(app).get("/api/events");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBe(1);
  });

  it("accepts type filter", async () => {
    const res = await request(app).get("/api/events?type=online");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("accepts featured filter", async () => {
    vi.mocked(prisma.event.findMany).mockResolvedValue([{ ...mockEvent, isFeatured: true }] as never);

    const res = await request(app).get("/api/events?featured=true");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /api/events/:slug", () => {
  it("returns event detail for published event", async () => {
    const res = await request(app).get("/api/events/workshop-ui-ux");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe("workshop-ui-ux");
  });

  it("returns 404 for non-existent slug", async () => {
    vi.mocked(prisma.event.findUnique).mockResolvedValue(null);

    const res = await request(app).get("/api/events/tidak-ada");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for draft event", async () => {
    vi.mocked(prisma.event.findUnique).mockResolvedValue({ ...mockEvent, status: "draft" } as never);

    const res = await request(app).get("/api/events/workshop-ui-ux");

    expect(res.status).toBe(404);
  });
});

describe("GET /api/events/my/tickets", () => {
  it("returns user registrations", async () => {
    vi.mocked(prisma.eventRegistration.findMany).mockResolvedValue([
      {
        id: "reg-1",
        eventId: "event-1",
        userId: "user-1",
        ticketCode: "TKT-001",
        status: "confirmed",
        event: { id: "event-1", slug: "workshop-ui-ux", title: "Workshop UI/UX", type: "online", startDate: new Date(), endDate: null, location: null, venue: null, coverUrl: null },
      },
    ] as never);

    const res = await request(app).get("/api/events/my/tickets");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("POST /api/events/admin", () => {
  it("creates event when admin", async () => {
    vi.mocked(prisma.event.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.event.create).mockResolvedValue({ ...mockEvent, id: "event-new" } as never);

    const res = await request(app).post("/api/events/admin").send({
      slug: "workshop-ui-ux",
      title: "Workshop UI/UX",
      type: "online",
      status: "published",
      startDate: "2026-07-01T09:00:00.000Z",
      price: 150000,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("returns 400 when slug already exists", async () => {
    vi.mocked(prisma.event.findUnique).mockResolvedValue(mockEvent as never);

    const res = await request(app).post("/api/events/admin").send({
      slug: "workshop-ui-ux",
      title: "Workshop UI/UX",
      type: "online",
      status: "published",
      startDate: "2026-07-01T09:00:00.000Z",
      price: 150000,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Slug");
  });

  it("returns 400 when required fields missing", async () => {
    const res = await request(app).post("/api/events/admin").send({ title: "Missing slug" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/events/admin/checkin", () => {
  it("marks ticket as attended", async () => {
    vi.mocked(prisma.eventRegistration.findUnique).mockResolvedValue({
      id: "reg-1",
      eventId: "event-1",
      userId: "user-1",
      ticketCode: "TKT-001",
      status: "confirmed",
      attendedAt: null,
    } as never);
    vi.mocked(prisma.eventRegistration.update).mockResolvedValue({
      id: "reg-1",
      status: "attended",
      attendedAt: new Date(),
      user: { name: "Test", email: "test@test.com" },
      event: { title: "Workshop" },
    } as never);

    const res = await request(app).post("/api/events/admin/checkin").send({ ticketCode: "TKT-001" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("attended");
  });

  it("returns 404 for invalid ticket code", async () => {
    vi.mocked(prisma.eventRegistration.findUnique).mockResolvedValue(null);

    const res = await request(app).post("/api/events/admin/checkin").send({ ticketCode: "INVALID" });

    expect(res.status).toBe(404);
  });

  it("returns 400 when ticket already scanned", async () => {
    vi.mocked(prisma.eventRegistration.findUnique).mockResolvedValue({
      id: "reg-1",
      status: "attended",
      attendedAt: new Date(),
    } as never);

    const res = await request(app).post("/api/events/admin/checkin").send({ ticketCode: "TKT-001" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("sudah pernah");
  });

  it("returns 400 when ticket not confirmed", async () => {
    vi.mocked(prisma.eventRegistration.findUnique).mockResolvedValue({
      id: "reg-1",
      status: "pending",
      attendedAt: null,
    } as never);

    const res = await request(app).post("/api/events/admin/checkin").send({ ticketCode: "TKT-001" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("belum confirmed");
  });
});
