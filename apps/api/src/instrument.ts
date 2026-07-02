import * as Sentry from "@sentry/node";
import { env } from "./config/env.js";

/**
 * Sentry initialization (TASK-023). Imported FIRST in index.ts (before app.js) so
 * auto-instrumentation wraps the app. No-op when SENTRY_DSN is unset (dev/test).
 */
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: env.APP_VERSION,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.2 : 1.0,
  });
}
