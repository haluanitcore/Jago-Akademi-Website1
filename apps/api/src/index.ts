import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  });
}

import { app } from "./app.js";
import { closeQueues } from "./jobs/queues.js";
import { logger } from "./lib/logger.js";

const port = process.env.PORT ?? 4000;

const server = app.listen(Number(port), "0.0.0.0", () => {
  logger.info("API started", { port: Number(port) });
});

async function shutdown(signal: string): Promise<void> {
  logger.info("API shutting down", { signal });
  server.close();
  await closeQueues();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
