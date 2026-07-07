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

// GET /api/users/me/export — PDP right to data access/portability (BL-18).
// Returns a downloadable JSON bundle of everything we hold about the caller.
router.get(
  "/me/export",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, email } = req.user!;

      const [user, orders, courseEnrollments, lmsEnrollments, activityLog] = await Promise.all([
        prisma.user.findUnique({
          where: { id },
          include: { profile: true, roles: { select: { role: true } } },
        }),
        prisma.order.findMany({ where: { userId: id }, include: { items: true } }),
        prisma.courseEnrollment.findMany({ where: { userId: id } }),
        prisma.lmsEnrollment.findMany({ where: { userId: id } }),
        prisma.auditLog.findMany({
          where: { actorId: id },
          orderBy: { createdAt: "desc" },
          take: 500,
        }),
      ]);

      // Strip internal secrets/tokens — a data export must never leak them.
      const safeUser: Record<string, unknown> = { ...(user ?? {}) };
      for (const secret of [
        "passwordHash",
        "emailVerifyToken",
        "emailVerifyExpiry",
        "resetPasswordToken",
        "resetPasswordExpiry",
      ]) {
        delete safeUser[secret];
      }

      const bundle = {
        exportedAt: new Date().toISOString(),
        subject: { id, email },
        account: safeUser,
        orders,
        courseEnrollments,
        lmsEnrollments,
        activityLog,
      };

      await writeAudit({
        actorId: id,
        actorEmail: email,
        action: "USER_DATA_EXPORT",
        resource: "User",
        resourceId: id,
        ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "",
        userAgent: req.headers["user-agent"],
      });

      res.setHeader("Content-Disposition", `attachment; filename="jago-data-${id}.json"`);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.status(200).send(JSON.stringify(successResponse(bundle), null, 2));
    } catch (err) {
      next(err);
    }
  },
);

export default router;
