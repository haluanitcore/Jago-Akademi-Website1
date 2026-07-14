import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";

import { env } from "./config/env.js";
import { httpLogger } from "./middleware/httpLogger.js";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import certificatesRouter from "./routes/certificates.js";
import coursesRouter from "./routes/courses.js";
import categoriesRouter from "./routes/categories.js";
import searchRouter from "./routes/search.js";
import uploadRouter from "./routes/upload.js";
import enrollmentsRouter from "./routes/enrollments.js";
import progressRouter from "./routes/progress.js";
import quizRouter from "./routes/quiz.js";
import dashboardRouter from "./routes/dashboard.js";
import videosRouter from "./routes/videos.js";
import adminRouter from "./routes/admin.js";
import checkoutRouter from "./routes/checkout.js";
import ordersRouter from "./routes/orders.js";
import couponsRouter from "./routes/coupons.js";
import webhooksRouter from "./routes/webhooks.js";
import ebooksRouter from "./routes/ebooks.js";
import lmsRouter from "./routes/lms.js";
import leadsRouter from "./routes/leads.js";
import testimonialsRouter from "./routes/testimonials.js";
import eventsRouter from "./routes/events.js";
import trainerRouter from "./routes/trainer.js";
import reviewsRouter from "./routes/reviews.js";
import blogRouter from "./routes/blog.js";
import affiliateRouter from "./routes/affiliate.js";
import subscriptionRouter from "./routes/subscription.js";

export const app = express();

// Trust proxy for correct IP behind load balancer / Cloudflare
app.set("trust proxy", 1);

// Request logging + X-Request-Id correlation (TASK-023) — before everything else.
app.use(httpLogger);

// Security headers (H6): HSTS, nosniff, frame-guard, referrer-policy, etc.
// CSP is disabled here because this origin serves JSON/assets, not HTML documents
// (CSP is enforced on the web origin in next.config.js). CORP is relaxed to
// cross-origin so the web app (different origin) can load /uploads assets.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
// Capture raw body for webhook signature verification
app.use(
  express.json({
    verify: (req: unknown, _res: unknown, buf: Buffer) => {
      (req as Record<string, unknown>).rawBody = buf;
    },
  })
);
app.use(cookieParser());
app.use(generalLimiter);

// Serve uploaded files (dev only — use CDN/R2 in production)
app.use("/uploads", express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

app.use("/api", healthRouter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/users", usersRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/search", searchRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/videos", videosRouter);
app.use("/api/admin", adminRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/ebooks", ebooksRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/waitlist", leadsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/lms", lmsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/trainer", trainerRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/affiliate", affiliateRouter);
app.use("/api/subscription", subscriptionRouter);

app.use(notFound);
app.use(errorHandler);
