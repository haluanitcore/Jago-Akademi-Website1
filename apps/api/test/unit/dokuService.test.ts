import { describe, it, expect, vi } from "vitest";
import { createHmac, createHash } from "node:crypto";

vi.mock("../../src/config/env.js", () => ({
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    JWT_SECRET: "test-jwt-secret-must-be-at-least-32-chars!!",
    JWT_REFRESH_SECRET: "test-refresh-must-be-32-chars!!!!!!!!",
    WEB_URL: "http://localhost:3004",
    DOKU_CLIENT_ID: "CLIENT-TEST",
    DOKU_SECRET_KEY: "shh-test-secret-key",
    DOKU_IS_PRODUCTION: false,
  },
}));

const { verifyDokuWebhook } = await import("../../src/services/payment/dokuService.js");

/** Mirrors dokuService's private sign() — DOKU's documented signature scheme. */
function referenceSign(clientId: string, requestId: string, timestamp: string, body: string, secretKey: string) {
  const bodyHash = createHash("sha256").update(body, "utf8").digest("base64");
  const components = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${timestamp}`,
    `Request-Body:${bodyHash}`,
  ].join("\n");
  return createHmac("sha256", secretKey).update(components).digest("base64");
}

describe("verifyDokuWebhook (TASK-030 — non-payment technical verification)", () => {
  const clientId = "CLIENT-TEST";
  const requestId = "req-abc-123";
  const timestamp = "2026-07-02T10:00:00Z";
  const body = JSON.stringify({ order: { invoice_number: "JA-1" }, transaction: { status: "SUCCESS" } });
  const secret = "shh-test-secret-key";

  it("accepts a correctly-signed webhook (matches DOKU's HMAC-SHA256 scheme)", () => {
    const signature = referenceSign(clientId, requestId, timestamp, body, secret);
    expect(verifyDokuWebhook(clientId, requestId, timestamp, body, signature)).toBe(true);
  });

  it("rejects a tampered body (signature no longer matches)", () => {
    const signature = referenceSign(clientId, requestId, timestamp, body, secret);
    const tamperedBody = JSON.stringify({ order: { invoice_number: "JA-1" }, transaction: { status: "FAILED" } });
    expect(verifyDokuWebhook(clientId, requestId, timestamp, tamperedBody, signature)).toBe(false);
  });

  it("rejects a signature signed with the wrong secret", () => {
    const forgedSignature = referenceSign(clientId, requestId, timestamp, body, "attacker-guessed-secret");
    expect(verifyDokuWebhook(clientId, requestId, timestamp, body, forgedSignature)).toBe(false);
  });

  it("rejects a replayed signature with a different request-id (defeats naive replay)", () => {
    const signature = referenceSign(clientId, requestId, timestamp, body, secret);
    expect(verifyDokuWebhook(clientId, "req-different", timestamp, body, signature)).toBe(false);
  });

  it("rejects an empty/missing signature", () => {
    expect(verifyDokuWebhook(clientId, requestId, timestamp, body, "")).toBe(false);
  });
});
