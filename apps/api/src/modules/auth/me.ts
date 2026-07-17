import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../../db/prisma.js";
import { authenticate } from "../../middleware/authenticate.js";
import { AppError, successResponse } from "../../types/index.js";

const router = Router();

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
          subscription: { select: { status: true, expiresAt: true } },
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

export default router;
