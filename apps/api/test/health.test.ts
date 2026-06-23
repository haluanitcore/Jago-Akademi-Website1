import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("GET /api/health", () => {
  it("returns 200 with healthy status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.service).toContain("Jago Akademi");
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.version).toBe("1.0.0");
  });

  it("returns valid ISO timestamp", async () => {
    const res = await request(app).get("/api/health");
    const ts = new Date(res.body.timestamp as string);

    expect(ts.toISOString()).toBe(res.body.timestamp);
  });

  it("returns JSON content-type", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});
