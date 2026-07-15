import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3004"),
  WEB_URL: z.string().default("http://localhost:3004"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  MEILISEARCH_URL: z.string().default("http://localhost:7700"),
  MEILISEARCH_KEY: z.string().optional(),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  // Payment (DOKU)
  DOKU_CLIENT_ID: z.string().optional(),
  DOKU_SECRET_KEY: z.string().optional(),
  DOKU_IS_PRODUCTION: z.coerce.boolean().default(false),
  // Optional explicit base URL; overrides the sandbox/production URL derived
  // from DOKU_IS_PRODUCTION (reconciles docker-compose which sets DOKU_BASE_URL).
  DOKU_BASE_URL: z.string().optional(),
  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("noreply@jagoakademi.com"),
  EMAIL_FROM_NAME: z.string().default("Jago Akademi"),
  // WhatsApp (Fonnte)
  FONNTE_TOKEN: z.string().optional(),
  // Redis / BullMQ (TASK-022) — absent = queue disabled, jobs run inline (dev/test)
  REDIS_URL: z.string().optional(),
  // Observability (TASK-023)
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
  APP_VERSION: z.string().optional(),
  // Feature flags
  // Block login for unverified emails. Default OFF — enabling it locks out
  // existing users whose isVerified=false, so flip it only after backfilling.
  ENFORCE_EMAIL_VERIFICATION: z.coerce.boolean().default(false),
  // Storage (Cloudflare R2) — validated here as the single source of truth for
  // documented config; consumed by the storage layer once object storage lands.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),
  // Video (Cloudflare Stream) — optional, same rationale as R2 above.
  CLOUDFLARE_STREAM_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_STREAM_TOKEN: z.string().optional(),
}).superRefine((val, ctx) => {
  // Fail closed (H9): the DOKU webhook verifier trusts all requests when the
  // secret is unset. That is only acceptable in dev/test — in production a
  // missing secret would let anyone forge "paid" webhooks, so require it.
  if (val.NODE_ENV === "production" && !val.DOKU_SECRET_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DOKU_SECRET_KEY"],
      message: "DOKU_SECRET_KEY is required in production (webhook signature verification).",
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`[env] Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
