import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { prisma } from "../../db/prisma.js";
import { successResponse, errorResponse, AppError } from "../../types/index.js";
import { requireLmsAdmin } from "./guards.js";

const router = Router();

// ─── Tenant: User Invites ─────────────────────────────────────────────────────

router.post("/tenants/:tenantId/invites", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const { emails, batchId } = req.body as { emails: string[]; batchId?: string };
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json(errorResponse("BAD_REQUEST", "emails harus berupa array dan tidak kosong."));
      }
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const created: string[] = [];
      const skipped: string[] = [];
      for (const email of emails.slice(0, 100)) {
        try {
          await prisma.lmsUserInvite.create({
            data: {
              tenantId: req.params.tenantId as string,
              email: email.toLowerCase().trim(),
              batchId: batchId ?? null,
              expiresAt,
            },
          });
          created.push(email);
        } catch {
          skipped.push(email);
        }
      }
      return res.status(201).json(successResponse({ created, skipped }));
    });
  } catch (err) {
    next(err);
  }
});

// Accept invite
router.post("/invite/:token/accept", authenticate, async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const invite = await prisma.lmsUserInvite.findUnique({ where: { token } });
    if (!invite) throw new AppError(404, "Undangan tidak ditemukan.");
    if (invite.status !== "pending") throw new AppError(400, "Undangan sudah digunakan atau kedaluwarsa.");
    if (invite.expiresAt < new Date()) {
      await prisma.lmsUserInvite.update({ where: { token }, data: { status: "expired" } });
      throw new AppError(400, "Undangan telah kedaluwarsa.");
    }
    if (invite.email !== userEmail) throw new AppError(403, "Undangan bukan untuk akun ini.");

    // Add to batch if batchId present
    if (invite.batchId) {
      await prisma.lmsBatchMember.upsert({
        where: { batchId_userId: { batchId: invite.batchId, userId } },
        // Denormalize tenantId for row-level isolation (defense-in-depth); the invite (and its batch) belong to this tenant.
        create: { batchId: invite.batchId, userId, tenantId: invite.tenantId },
        update: {},
      });
      // Auto-enroll in courses assigned to this batch
      const assignments = await prisma.lmsCourseAssignment.findMany({
        where: { batchId: invite.batchId },
      });
      for (const assignment of assignments) {
        await prisma.lmsEnrollment.upsert({
          where: { courseId_userId: { courseId: assignment.courseId, userId } },
          create: { tenantId: invite.tenantId, courseId: assignment.courseId, userId },
          update: {},
        });
      }
    }

    await prisma.lmsUserInvite.update({ where: { token }, data: { status: "accepted" } });
    const tenant = await prisma.lmsTenant.findUnique({ where: { id: invite.tenantId }, select: { slug: true } });
    return res.json(successResponse({ tenantId: invite.tenantId, tenantSlug: tenant?.slug ?? null }));
  } catch (err) {
    next(err);
  }
});


export default router;
