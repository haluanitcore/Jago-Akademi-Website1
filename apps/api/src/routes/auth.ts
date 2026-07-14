import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "../db/prisma.js";
import { hashPassword, verifyPassword } from "../services/auth/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshTokenExpiry,
  REFRESH_COOKIE,
} from "../services/auth/token.js";
import { buildGoogleAuthUrl, exchangeGoogleCode } from "../services/auth/google.js";
import { sendVerificationEmail } from "../services/notification/emailService.js";
import { writeAudit } from "../services/audit/log.js";
import { logger } from "../lib/logger.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validateBody.js";
import { AppError, successResponse } from "../types/index.js";
import { env } from "../config/env.js";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function getIp(req: Request): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "";
}

async function issueTokens(
  res: Response,
  user: { id: string; email: string },
  roles: string[],
  ip: string,
  userAgent: string,
): Promise<{ accessToken: string }> {
  const jti = randomUUID();
  const rawRefresh = signRefreshToken({ sub: user.id, jti });
  const tokenHash = hashToken(rawRefresh);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      ip,
      userAgent,
      expiresAt: refreshTokenExpiry(),
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    roles: roles as never,
  });

  res.cookie(REFRESH_COOKIE, rawRefresh, COOKIE_OPTIONS);

  return { accessToken };
}

// M1: shared password policy — min 8 chars and never all-numeric (rejects e.g.
// "12345678"), reused across register / reset / change-password boundaries.
export const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .refine((v) => !/^\d+$/.test(v), "Kata sandi tidak boleh hanya angka.");

// POST /api/auth/register
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordSchema,
  consent: z.literal(true, { errorMap: () => ({ message: "Persetujuan privasi wajib diberikan." }) }),
});

router.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body as z.infer<typeof registerSchema>;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return next(new AppError(409, "Email sudah terdaftar."));
      }

      const passwordHash = await hashPassword(password);
      const emailVerifyToken = randomUUID();
      const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          consentGivenAt: new Date(),
          emailVerifyToken,
          emailVerifyExpiry,
          roles: { create: { role: "student" } },
        },
        select: { id: true, email: true, name: true },
      });

      await writeAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "USER_REGISTER",
        resource: "User",
        resourceId: user.id,
        ip: getIp(req),
        userAgent: req.headers["user-agent"],
      });

      // Best-effort: a failed/unconfigured mailer must not fail registration.
      // sendVerificationEmail degrades to a console log until RESEND_API_KEY is set.
      sendVerificationEmail(user.email, user.name, emailVerifyToken).catch((err: unknown) => {
        logger.warn("verification email send failed", { err: String(err), userId: user.id });
      });

      // In dev: return token for testing. In prod the link goes out by email above.
      const devToken = env.NODE_ENV !== "production" ? emailVerifyToken : undefined;

      res.status(201).json(
        successResponse({
          message: "Registrasi berhasil. Silakan verifikasi email Anda.",
          userId: user.id,
          ...(devToken && { devEmailVerifyToken: devToken }),
        }),
      );
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as z.infer<typeof loginSchema>;
      const ip = getIp(req);
      const ua = req.headers["user-agent"] ?? "";

      const user = await prisma.user.findUnique({
        where: { email },
        include: { roles: true },
      });

      const isValid = user?.passwordHash
        ? await verifyPassword(password, user.passwordHash)
        : false;

      if (!user || !isValid || user.deletedAt !== null || !user.isActive) {
        return next(new AppError(401, "Email atau kata sandi salah."));
      }

      const { accessToken } = await issueTokens(
        res,
        user,
        user.roles.map((r) => r.role),
        ip,
        ua,
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await writeAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "USER_LOGIN",
        resource: "User",
        resourceId: user.id,
        ip,
        userAgent: ua,
      });

      res.json(
        successResponse({
          accessToken,
          user: { id: user.id, email: user.email, name: user.name },
        }),
      );
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/logout
router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
      if (raw) {
        const hash = hashToken(raw);
        await prisma.refreshToken.updateMany({
          where: { tokenHash: hash },
          data: { revokedAt: new Date() },
        });
      }
      res.clearCookie(REFRESH_COOKIE, { path: "/" });
      res.json(successResponse({ message: "Berhasil keluar." }));
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
      if (!raw) {
        return next(new AppError(401, "Refresh token tidak ditemukan."));
      }

      let payload: ReturnType<typeof verifyRefreshToken>;
      try {
        payload = verifyRefreshToken(raw);
      } catch {
        return next(new AppError(401, "Refresh token tidak valid atau kedaluwarsa."));
      }

      const hash = hashToken(raw);
      const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });

      if (!stored || stored.revokedAt !== null || stored.expiresAt < new Date()) {
        return next(new AppError(401, "Refresh token sudah dicabut atau kedaluwarsa."));
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roles: true },
      });

      if (!user || !user.isActive || user.deletedAt !== null) {
        return next(new AppError(401, "Akun tidak aktif."));
      }

      // Rotate: revoke old, issue new
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });

      const { accessToken } = await issueTokens(
        res,
        user,
        user.roles.map((r) => r.role),
        stored.ip ?? "",
        stored.userAgent ?? "",
      );

      res.json(successResponse({ accessToken }));
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/auth/me
router.get(
  "/me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
          createdAt: true,
          roles: { select: { role: true } },
          profile: { select: { phone: true, bio: true } },
        },
      });
      if (!user) return next(new AppError(404, "Pengguna tidak ditemukan."));

      // Flatten profile fields into the top-level response
      const { profile, ...rest } = user;
      res.json(successResponse({
        ...rest,
        phone: profile?.phone ?? null,
        bio: profile?.bio ?? null,
      }));
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/auth/google
router.get("/google", (req: Request, res: Response) => {
  const state = randomUUID();
  res.cookie("oauth_state", state, { httpOnly: true, secure: env.COOKIE_SECURE, maxAge: 10 * 60 * 1000 });
  res.redirect(buildGoogleAuthUrl(state));
});

// GET /api/auth/google/callback
router.get(
  "/google/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, state } = req.query as { code?: string; state?: string };
      const storedState = req.cookies?.["oauth_state"] as string | undefined;

      if (!code || !state || state !== storedState) {
        return next(new AppError(400, "Parameter OAuth tidak valid."));
      }

      res.clearCookie("oauth_state");

      const profile = await exchangeGoogleCode(code);
      const ip = getIp(req);
      const ua = req.headers["user-agent"] ?? "";

      let user = await prisma.user.findUnique({
        where: { email: profile.email },
        include: { roles: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
            authProvider: "google",
            isVerified: true,
            consentGivenAt: new Date(),
            roles: { create: { role: "student" } },
          },
          include: { roles: true },
        });

        await writeAudit({
          actorId: user.id,
          actorEmail: user.email,
          action: "USER_REGISTER_GOOGLE",
          resource: "User",
          resourceId: user.id,
          ip,
          userAgent: ua,
        });
      }

      if (!user.isActive || user.deletedAt !== null) {
        return res.redirect(`${env.WEB_URL}/masuk?error=account_disabled`);
      }

      const { accessToken } = await issueTokens(
        res,
        user,
        user.roles.map((r) => r.role),
        ip,
        ua,
      );

      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

      res.redirect(`${env.WEB_URL}/auth/callback?token=${encodeURIComponent(accessToken)}`);
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/forgot-password
const forgotSchema = z.object({ email: z.string().email() });

router.post(
  "/forgot-password",
  validateBody(forgotSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as z.infer<typeof forgotSchema>;

      const user = await prisma.user.findUnique({ where: { email } });
      // Always respond 200 to prevent email enumeration
      if (user && !user.deletedAt) {
        const token = randomUUID();
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
          where: { id: user.id },
          data: { resetPasswordToken: token, resetPasswordExpiry: expiry },
        });

        // In dev: expose token. In prod: send via email.
        if (env.NODE_ENV !== "production") {
          console.info(`[dev] Password reset token for ${email}: ${token}`);
        }
      }

      res.json(
        successResponse({
          message: "Jika email terdaftar, instruksi reset kata sandi telah dikirim.",
        }),
      );
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/reset-password
const resetSchema = z.object({
  token: z.string().uuid(),
  password: passwordSchema,
});

router.post(
  "/reset-password",
  validateBody(resetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body as z.infer<typeof resetSchema>;

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpiry: { gt: new Date() },
          deletedAt: null,
        },
      });

      if (!user) {
        return next(new AppError(400, "Token reset kata sandi tidak valid atau sudah kedaluwarsa."));
      }

      const passwordHash = await hashPassword(password);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpiry: null,
          },
        }),
        // Revoke all refresh tokens on password change
        prisma.refreshToken.updateMany({
          where: { userId: user.id, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);

      await writeAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "USER_PASSWORD_RESET",
        resource: "User",
        resourceId: user.id,
        ip: getIp(req),
        userAgent: req.headers["user-agent"],
      });

      res.json(successResponse({ message: "Kata sandi berhasil diperbarui. Silakan login kembali." }));
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/verify-email
const verifyEmailSchema = z.object({ token: z.string().uuid() });

router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body as z.infer<typeof verifyEmailSchema>;

      const user = await prisma.user.findFirst({
        where: {
          emailVerifyToken: token,
          emailVerifyExpiry: { gt: new Date() },
          deletedAt: null,
        },
      });

      if (!user) {
        return next(new AppError(400, "Token verifikasi tidak valid atau sudah kedaluwarsa."));
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          emailVerifyToken: null,
          emailVerifyExpiry: null,
        },
      });

      await writeAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "USER_EMAIL_VERIFIED",
        resource: "User",
        resourceId: user.id,
        ip: getIp(req),
        userAgent: req.headers["user-agent"],
      });

      res.json(successResponse({ message: "Email berhasil diverifikasi." }));
    } catch (err) {
      next(err);
    }
  },
);

export default router;
