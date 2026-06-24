import type { Request, Response, NextFunction } from "express";
import { AppError, type Role } from "../types/index.js";
import { verifyAccessToken } from "../services/auth/token.js";
import { prisma } from "../db/prisma.js";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError(401, "Token akses diperlukan."));
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        isActive: true,
        deletedAt: true,
        roles: { select: { role: true } },
      },
    });

    if (!user || !user.isActive || user.deletedAt !== null) {
      return next(new AppError(401, "Akun tidak ditemukan atau telah dinonaktifkan."));
    }

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role as Role),
    };

    next();
  } catch {
    next(new AppError(401, "Token tidak valid atau sudah kedaluwarsa."));
  }
}
