import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  });
}

import { app } from "./app.js";

const port = process.env.PORT ?? 4000;

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`[server]: Jago Akademi API running at http://localhost:${port}`);
});
