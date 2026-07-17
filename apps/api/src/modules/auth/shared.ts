import { type Request, type Response } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "../../db/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  refreshTokenExpiry,
  REFRESH_COOKIE,
} from "../../services/auth/token.js";
import { env } from "../../config/env.js";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  maxAge: 2 * 60 * 60 * 1000,
  path: "/",
};

export function getIp(req: Request): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "";
}

export async function issueTokens(
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
