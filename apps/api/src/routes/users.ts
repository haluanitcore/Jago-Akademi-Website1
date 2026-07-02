import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { writeAudit } from "../services/audit/log.js";
import { successResponse } from "../types/index.js";
import { REFRESH_COOKIE } from "../services/auth/token.js";

const router = Router();

// PATCH /api/users/me — update name, avatarUrl, and profile (bio, headline, linkedin, location)
router.patch(
  "/me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user!;
      const { name, avatarUrl, bio, headline, linkedin, location } = req.body as {
        name?: string;
        avatarUrl?: string;
        bio?: string;
        headline?: string;
        linkedin?: string;
        location?: string;
      };

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        },
        select: { id: true, name: true, email: true, avatarUrl: true },
      });

      if (bio !== undefined || headline !== undefined || linkedin !== undefined || location !== undefined) {
        await prisma.userProfile.upsert({
          where: { userId: id },
          create: { userId: id, bio, headline, linkedin, location },
          update: {
            ...(bio !== undefined ? { bio } : {}),
            ...(headline !== undefined ? { headline } : {}),
            ...(linkedin !== undefined ? { linkedin } : {}),
            ...(location !== undefined ? { location } : {}),
          },
        });
      }

      res.json(successResponse(user));
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/users/me — PDP right to erasure (anonymize, not hard-delete)
router.delete(
  "/me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, email } = req.user!;

      await prisma.$transaction([
        // Anonymize user — preserve record for financial/legal retention
        prisma.user.update({
          where: { id },
          data: {
            email: `deleted+${id}@jagoakademi.invalid`,
            name: "Akun Dihapus",
            avatarUrl: null,
            passwordHash: null,
            authProvider: "deleted",
            isActive: false,
            deletedAt: new Date(),
            emailVerifyToken: null,
            emailVerifyExpiry: null,
            resetPasswordToken: null,
            resetPasswordExpiry: null,
          },
        }),
        // Anonymize profile PII
        prisma.userProfile.updateMany({
          where: { userId: id },
          data: {
            phone: null,
            bio: null,
            headline: null,
            linkedin: null,
            location: null,
            expertise: [],
          },
        }),
        // Revoke all refresh tokens
        prisma.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);

      await writeAudit({
        actorId: id,
        actorEmail: email,
        action: "USER_ACCOUNT_DELETED",
        resource: "User",
        resourceId: id,
        ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "",
        userAgent: req.headers["user-agent"],
      });

      res.clearCookie(REFRESH_COOKIE, { path: "/" });
      res.json(successResponse({ message: "Akun Anda telah dihapus sesuai permintaan." }));
    } catch (err) {
      next(err);
    }
  },
);

export default router;
