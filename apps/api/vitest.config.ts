import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["node"],
  },
  test: {
    globals: true,
    environment: "node",
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      JWT_SECRET: "test-jwt-secret-must-be-at-least-32-chars!!",
      JWT_REFRESH_SECRET: "test-refresh-secret-must-be-32-chars!!!!!",
      GOOGLE_CLIENT_ID: "test-google-client-id",
      GOOGLE_CLIENT_SECRET: "test-google-secret",
      GOOGLE_CALLBACK_URL: "http://localhost:4000/api/auth/google/callback",
      WEB_URL: "http://localhost:3000",
      CORS_ORIGIN: "http://localhost:3000",
      COOKIE_SECURE: "false",
      MEILISEARCH_URL: "http://localhost:7700",
      MEILISEARCH_KEY: "test-key",
      UPLOAD_DIR: "uploads",
      MAX_FILE_SIZE_MB: "10",
    },
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
      // Ratchet gate (TASK-010): global thresholds are pinned at the verified
      // baseline so coverage can never regress. Raise these numbers as tests are
      // added — never lower them. Per-file thresholds lock in already-strong
      // critical code. The 80% target for auth/orders/lms/commerce routes is an
      // incremental goal tracked in docs/BACKLOG.md (BL-11), reached by adding
      // tests over successive PRs, not all at once (SSOT GAP-04 guidance).
      thresholds: {
        lines: 61,
        functions: 55,
        branches: 48,
        statements: 60,
        // Critical middleware is already strong — lock it high to prevent drift.
        "src/middleware/authenticate.ts": { lines: 90, functions: 100, branches: 85, statements: 90 },
        "src/middleware/authorize.ts": { lines: 80, functions: 80, branches: 70, statements: 80 },
      },
    },
  },
});
