/**
 * Shared helpers for the beta-feature E2E specs.
 *
 * These tests run with NO backend: every /api/* call the pages make is
 * intercepted per-test with page.route() and fulfilled with the standard
 * response envelope { success, data, error?, meta? } (packages/types).
 * The web pages call the API both via the absolute NEXT_PUBLIC_API_URL
 * origin (http://localhost:4000/api/…) and via same-origin relative paths
 * (/api/…, proxied by the Next rewrite) — the "**\/api\/…" glob patterns
 * used in the specs match both forms.
 *
 * Not a spec file: the default testMatch (*.spec.ts) ignores it.
 */
import type { Page } from "@playwright/test";

/** Build a Playwright fulfill() payload carrying a JSON success envelope. */
export function okEnvelope(data: unknown, meta?: Record<string, unknown>, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({ success: true, data, ...(meta ? { meta } : {}) }),
  };
}

/** Build a Playwright fulfill() payload carrying a JSON error envelope. */
export function errorEnvelope(status: number, code: string, message: string) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: { code, message } }),
  };
}

export type ConsoleErrorCollector = { errors: string[] };

/**
 * Collect page console messages of type "error" so each test can assert zero
 * console errors at the end. `allow` patterns (matched against both message
 * text and the reporting URL) exist only for errors a test intentionally
 * provokes — e.g. the browser's "Failed to load resource … 404" log when a
 * test mocks an API 404 on purpose. Prefer an empty allowlist.
 */
export function collectConsoleErrors(page: Page, allow: RegExp[] = []): ConsoleErrorCollector {
  const collector: ConsoleErrorCollector = { errors: [] };
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    const url = msg.location().url ?? "";
    if (allow.some((re) => re.test(text) || re.test(url))) return;
    collector.errors.push(text || url);
  });
  return collector;
}

/**
 * Dummy JWT for pages that read the access token from web storage before
 * calling the (mocked) API. Payload is base64url of {"sub":"e2e-user"} with
 * NO exp claim, so lib/auth/token.ts#isTokenExpired treats it as non-expiring
 * and getValidToken() returns it without hitting /api/auth/refresh.
 * Never verified server-side — every API response is mocked.
 */
export const E2E_DUMMY_JWT = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJlMmUtdXNlciJ9.e2e-signature";

/** Seed the dummy token into the storages lib/auth/token.ts reads. */
export async function seedAuthToken(page: Page): Promise<void> {
  await page.addInitScript((token) => {
    window.sessionStorage.setItem("access_token", token);
    window.localStorage.setItem("jg_access_token", token);
  }, E2E_DUMMY_JWT);
}
