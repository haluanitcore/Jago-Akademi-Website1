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
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
});
