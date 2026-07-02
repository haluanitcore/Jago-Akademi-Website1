import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../db/prisma.js";
import { successResponse, errorResponse, AppError } from "../types/index.js";
import { z } from "zod";

const router = Router();

// ─── Guards ──────────────────────────────────────────────────────────────────

function requireSuperAdmin(
  req: Parameters<typeof authenticate>[0],
  res: Parameters<typeof authenticate>[1],
  next: Parameters<typeof authenticate>[2],
) {
  if (!req.user?.roles.includes("super_admin" as never)) {
    return res.status(403).json(errorResponse("Akses ditolak."));
  }
  next();
}

async function requireLmsAdmin(
  req: Parameters<typeof authenticate>[0],
  res: Parameters<typeof authenticate>[1],
  next: Parameters<typeof authenticate>[2],
) {
  const { tenantId } = req.params;
  const userId = req.user?.id;
  if (!userId || !tenantId) return res.status(403).json(errorResponse("Akses ditolak."));
  const isSuperAdmin = req.user?.roles.includes("super_admin" as never);
  if (isSuperAdmin) return next();
  const role = await prisma.userRole.findFirst({
    where: { userId, role: "lms_admin", tenantId },
  });
  if (!role) return res.status(403).json(errorResponse("Akses ditolak."));
  next();
}

// ─── Super Admin: Tenant Management ──────────────────────────────────────────

const tenantSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().default("#2563eb"),
  customDomain: z.string().optional(),
  planType: z.enum(["trial", "starter", "pro", "enterprise"]).default("trial"),
  seatLimit: z.number().int().positive().default(50),
});

router.get("/tenants", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
    const [tenants, total] = await Promise.all([
      prisma.lmsTenant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { _count: { select: { batches: true, courses: true, enrollments: true } } },
      }),
      prisma.lmsTenant.count({ where }),
    ]);
    return res.json(successResponse(tenants, { total, page, limit }));
  } catch (err) {
    next(err);
  }
});

router.post("/tenants", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const body = tenantSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const tenant = await prisma.lmsTenant.create({
      data: { ...body.data, trialEndsAt },
    });
    return res.status(201).json(successResponse(tenant));
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return res.status(409).json(errorResponse("Slug atau domain sudah digunakan."));
    }
    next(err);
  }
});

router.get("/tenants/:tenantId", authenticate, async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const isSuperAdmin = req.user?.roles.includes("super_admin" as never);
    if (!isSuperAdmin) {
      const role = await prisma.userRole.findFirst({
        where: { userId: req.user!.id, role: "lms_admin", tenantId },
      });
      if (!role) return res.status(403).json(errorResponse("Akses ditolak."));
    }
    const tenant = await prisma.lmsTenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: { select: { batches: true, courses: true, enrollments: true, invites: true } },
      },
    });
    if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");
    return res.json(successResponse(tenant));
  } catch (err) {
    next(err);
  }
});

router.patch("/tenants/:tenantId", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const body = tenantSchema.partial().safeParse(req.body);
    if (!body.success) return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
    const tenant = await prisma.lmsTenant.update({
      where: { id: req.params.tenantId },
      data: body.data,
    });
    return res.json(successResponse(tenant));
  } catch (err) {
    next(err);
  }
});

// Assign LMS admin role to a user
router.post("/tenants/:tenantId/admins", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId as string;
    const { userId } = req.body as { userId: string };
    if (!userId) return res.status(400).json(errorResponse("userId diperlukan."));
    await prisma.userRole.upsert({
      where: { userId_role_tenantId: { userId, role: "lms_admin", tenantId } },
      create: { userId, role: "lms_admin", tenantId },
      update: {},
    });
    return res.json(successResponse({ message: "Admin LMS ditambahkan." }));
  } catch (err) {
    next(err);
  }
});

// ─── Tenant: Batch Management ─────────────────────────────────────────────────

const batchSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

router.get("/tenants/:tenantId/batches", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const batches = await prisma.lmsBatch.findMany({
        where: { tenantId: req.params.tenantId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { members: true, assignments: true } } },
      });
      return res.json(successResponse(batches));
    });
  } catch (err) {
    next(err);
  }
});

router.post("/tenants/:tenantId/batches", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const body = batchSchema.safeParse(req.body);
      if (!body.success) return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
      const batch = await prisma.lmsBatch.create({
        data: { ...body.data, tenantId: req.params.tenantId as string },
      });
      return res.status(201).json(successResponse(batch));
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/tenants/:tenantId/batches/:batchId", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const body = batchSchema.partial().safeParse(req.body);
      if (!body.success) return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
      const batch = await prisma.lmsBatch.update({
        where: { id: req.params.batchId },
        data: body.data,
      });
      return res.json(successResponse(batch));
    });
  } catch (err) {
    next(err);
  }
});

router.get("/tenants/:tenantId/batches/:batchId/members", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const members = await prisma.lmsBatchMember.findMany({
        where: { batchId: req.params.batchId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "desc" },
      });
      return res.json(successResponse(members));
    });
  } catch (err) {
    next(err);
  }
});

// ─── Tenant: User Invites ─────────────────────────────────────────────────────

router.post("/tenants/:tenantId/invites", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const { emails, batchId } = req.body as { emails: string[]; batchId?: string };
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json(errorResponse("emails harus berupa array dan tidak kosong."));
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
        create: { batchId: invite.batchId, userId },
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

// ─── Tenant: Course Builder ───────────────────────────────────────────────────

const courseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

const lessonSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.string().startsWith("/")).optional(),
  durationMins: z.number().int().positive().optional(),
  sortOrder: z.number().int().default(0),
});

router.get("/tenants/:tenantId/courses", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const courses = await prisma.lmsCourse.findMany({
        where: { tenantId: req.params.tenantId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { lessons: true, enrollments: true } } },
      });
      return res.json(successResponse(courses));
    });
  } catch (err) {
    next(err);
  }
});

router.post("/tenants/:tenantId/courses", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const body = courseSchema.safeParse(req.body);
      if (!body.success) return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
      const course = await prisma.lmsCourse.create({
        data: { ...body.data, tenantId: req.params.tenantId as string },
      });
      return res.status(201).json(successResponse(course));
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/tenants/:tenantId/courses/:courseId", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const body = courseSchema.partial().safeParse(req.body);
      if (!body.success) return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
      const course = await prisma.lmsCourse.update({
        where: { id: req.params.courseId, tenantId: req.params.tenantId },
        data: body.data,
      });
      return res.json(successResponse(course));
    });
  } catch (err) {
    next(err);
  }
});

// Lessons
router.get("/tenants/:tenantId/courses/:courseId/lessons", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const lessons = await prisma.lmsLesson.findMany({
        where: { courseId: req.params.courseId },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { quizzes: true } } },
      });
      return res.json(successResponse(lessons));
    });
  } catch (err) {
    next(err);
  }
});

router.post("/tenants/:tenantId/courses/:courseId/lessons", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const body = lessonSchema.safeParse(req.body);
      if (!body.success) return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
      const lesson = await prisma.lmsLesson.create({
        data: { ...body.data, courseId: req.params.courseId as string },
      });
      return res.status(201).json(successResponse(lesson));
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/tenants/:tenantId/courses/:courseId/lessons/:lessonId", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const body = lessonSchema.partial().safeParse(req.body);
      if (!body.success) return res.status(400).json(errorResponse(body.error.issues[0]?.message ?? "Validasi gagal."));
      const lesson = await prisma.lmsLesson.update({
        where: { id: req.params.lessonId },
        data: body.data,
      });
      return res.json(successResponse(lesson));
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/tenants/:tenantId/courses/:courseId/lessons/:lessonId", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      await prisma.lmsLesson.delete({ where: { id: req.params.lessonId } });
      return res.json(successResponse({ message: "Lesson dihapus." }));
    });
  } catch (err) {
    next(err);
  }
});

// Quiz builder
router.post("/tenants/:tenantId/courses/:courseId/lessons/:lessonId/quizzes", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const { question, options, answer } = req.body as {
        question: string;
        options: string[];
        answer: number;
      };
      if (!question || !Array.isArray(options) || options.length < 2 || typeof answer !== "number") {
        return res.status(400).json(errorResponse("question, options (min 2), dan answer diperlukan."));
      }
      const quiz = await prisma.lmsQuiz.create({
        data: { lessonId: req.params.lessonId as string, question, options, answer },
      });
      return res.status(201).json(successResponse(quiz));
    });
  } catch (err) {
    next(err);
  }
});

// Assign course to batch
router.post("/tenants/:tenantId/courses/:courseId/assign", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const { batchId, dueDate, isMandatory } = req.body as {
        batchId: string;
        dueDate?: string;
        isMandatory?: boolean;
      };
      if (!batchId) return res.status(400).json(errorResponse("batchId diperlukan."));

      const courseId = req.params.courseId as string;
      const tenantId = req.params.tenantId as string;
      const assignment = await prisma.lmsCourseAssignment.upsert({
        where: { batchId_courseId: { batchId, courseId } },
        create: {
          batchId,
          courseId,
          dueDate: dueDate ? new Date(dueDate) : null,
          isMandatory: isMandatory ?? true,
        },
        update: { dueDate: dueDate ? new Date(dueDate) : null, isMandatory: isMandatory ?? true },
      });

      // Auto-enroll existing batch members
      const members = await prisma.lmsBatchMember.findMany({ where: { batchId } });
      for (const member of members) {
        await prisma.lmsEnrollment.upsert({
          where: { courseId_userId: { courseId, userId: member.userId } },
          create: { tenantId, courseId, userId: member.userId },
          update: {},
        });
      }
      return res.json(successResponse(assignment));
    });
  } catch (err) {
    next(err);
  }
});

// ─── Reports ──────────────────────────────────────────────────────────────────

router.get("/tenants/:tenantId/reports/completion", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const { tenantId } = req.params;
      const { batchId, courseId } = req.query as { batchId?: string; courseId?: string };

      const enrollments = await prisma.lmsEnrollment.findMany({
        where: {
          tenantId,
          ...(courseId ? { courseId } : {}),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
          progress: true,
          certificate: { select: { issuedAt: true } },
        },
      });

      const courseLessonCounts = await prisma.lmsLesson.groupBy({
        by: ["courseId"],
        where: { course: { tenantId } },
        _count: { id: true },
      });
      const lessonCountMap = new Map(courseLessonCounts.map((r) => [r.courseId, r._count.id]));

      const rows = enrollments.map((e) => {
        const totalLessons = lessonCountMap.get(e.courseId) ?? 0;
        const completedLessons = e.progress.length;
        const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        return {
          userId: e.userId,
          userName: e.user.name,
          userEmail: e.user.email,
          courseId: e.courseId,
          courseTitle: e.course.title,
          totalLessons,
          completedLessons,
          completionPct: pct,
          isCompleted: e.completedAt !== null,
          completedAt: e.completedAt,
          certificateIssuedAt: e.certificate?.issuedAt ?? null,
          enrolledAt: e.enrolledAt,
        };
      });

      // Filter by batchId if provided
      let filtered = rows;
      if (batchId) {
        const memberIds = (
          await prisma.lmsBatchMember.findMany({ where: { batchId }, select: { userId: true } })
        ).map((m) => m.userId);
        filtered = rows.filter((r) => memberIds.includes(r.userId));
      }

      return res.json(successResponse(filtered));
    });
  } catch (err) {
    next(err);
  }
});

// CSV export
router.get("/tenants/:tenantId/reports/completion/csv", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const { tenantId } = req.params;
      const enrollments = await prisma.lmsEnrollment.findMany({
        where: { tenantId },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
          progress: true,
        },
      });
      const courseLessonCounts = await prisma.lmsLesson.groupBy({
        by: ["courseId"],
        where: { course: { tenantId } },
        _count: { id: true },
      });
      const lessonCountMap = new Map(courseLessonCounts.map((r) => [r.courseId, r._count.id]));

      const rows = enrollments.map((e) => {
        const total = lessonCountMap.get(e.courseId) ?? 0;
        const pct = total > 0 ? Math.round((e.progress.length / total) * 100) : 0;
        return [e.user.name, e.user.email, e.course.title, total, e.progress.length, pct, e.completedAt ? "Ya" : "Tidak"];
      });

      const header = "Nama,Email,Kursus,Total Pelajaran,Selesai,Persentase,Lulus\n";
      const body = rows.map((r) => r.join(",")).join("\n");
      const csv = header + body;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="laporan-${tenantId}.csv"`);
      return res.send(csv);
    });
  } catch (err) {
    next(err);
  }
});

// PDF report
router.get("/tenants/:tenantId/reports/completion/pdf", authenticate, async (req, res, next) => {
  try {
    await requireLmsAdmin(req, res, async () => {
      const { tenantId } = req.params;
      const tenant = await prisma.lmsTenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");

      const enrollments = await prisma.lmsEnrollment.findMany({
        where: { tenantId },
        include: { course: { select: { title: true } }, progress: true },
      });
      const courseLessonCounts = await prisma.lmsLesson.groupBy({
        by: ["courseId"],
        where: { course: { tenantId } },
        _count: { id: true },
      });
      const lessonCountMap = new Map(courseLessonCounts.map((r) => [r.courseId, r._count.id]));

      const PDFDocument = (await import("pdfkit")).default;
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="laporan-${tenant.slug}.pdf"`);
      doc.pipe(res);

      doc.fontSize(18).text(`Laporan Completion — ${tenant.name}`, { align: "center" });
      doc.moveDown().fontSize(10).text(`Diekspor: ${new Date().toLocaleDateString("id-ID")}`, { align: "center" });
      doc.moveDown(2);

      for (const e of enrollments) {
        const total = lessonCountMap.get(e.courseId) ?? 0;
        const pct = total > 0 ? Math.round((e.progress.length / total) * 100) : 0;
        doc.fontSize(10).text(`Kursus: ${e.course.title} | User: ${e.userId} | ${pct}% (${e.progress.length}/${total})`);
      }
      doc.end();
    });
  } catch (err) {
    next(err);
  }
});

// ─── Public Branding (no auth) ───────────────────────────────────────────────

router.get("/public/:tenantSlug", async (req, res, next) => {
  try {
    const tenant = await prisma.lmsTenant.findUnique({
      where: { slug: req.params.tenantSlug },
      select: { name: true, slug: true, logoUrl: true, primaryColor: true, isActive: true, trialEndsAt: true, planType: true },
    });
    if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");
    return res.json(successResponse(tenant));
  } catch (err) {
    next(err);
  }
});

// ─── LMS Portal (Student-facing) ─────────────────────────────────────────────

// Get my tenant memberships
router.get("/portal/me", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const batchMemberships = await prisma.lmsBatchMember.findMany({
      where: { userId },
      include: { batch: { include: { tenant: true } } },
    });
    const tenants = batchMemberships.map((m) => m.batch.tenant);
    const unique = [...new Map(tenants.map((t) => [t.id, t])).values()];
    return res.json(successResponse(unique));
  } catch (err) {
    next(err);
  }
});

// Get my courses in a tenant
router.get("/portal/:tenantSlug/courses", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { tenantSlug } = req.params;
    const tenant = await prisma.lmsTenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");

    const enrollments = await prisma.lmsEnrollment.findMany({
      where: { tenantId: tenant.id, userId },
      include: {
        course: { include: { lessons: { select: { id: true } } } },
        progress: { select: { lessonId: true } },
        certificate: { select: { issuedAt: true } },
      },
    });

    const result = enrollments.map((e) => {
      const total = e.course.lessons.length;
      const completed = e.progress.length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        courseId: e.courseId,
        courseTitle: e.course.title,
        description: e.course.description,
        totalLessons: total,
        completedLessons: completed,
        completionPct: pct,
        isCompleted: e.completedAt !== null,
        enrolledAt: e.enrolledAt,
        certificate: e.certificate,
      };
    });
    return res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
});

// Get lessons for a course (portal)
router.get("/portal/:tenantSlug/courses/:courseId/lessons", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { tenantSlug, courseId } = req.params;
    const tenant = await prisma.lmsTenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");

    const enrollment = await prisma.lmsEnrollment.findUnique({
      where: { courseId_userId: { courseId: courseId as string, userId } },
    });
    if (!enrollment) throw new AppError(403, "Anda belum terdaftar di kursus ini.");

    const [lessons, completedProgress] = await Promise.all([
      prisma.lmsLesson.findMany({
        where: { courseId: courseId as string },
        orderBy: { sortOrder: "asc" },
        include: { quizzes: { select: { id: true, question: true, options: true } } },
      }),
      prisma.lmsProgress.findMany({
        where: { enrollmentId: enrollment.id },
        select: { lessonId: true },
      }),
    ]);

    const completedSet = new Set(completedProgress.map((p) => p.lessonId));
    const result = lessons.map((l) => ({ ...l, isCompleted: completedSet.has(l.id) }));
    return res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
});

// Mark lesson complete (portal)
router.post("/portal/:tenantSlug/courses/:courseId/lessons/:lessonId/complete", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { tenantSlug, courseId, lessonId } = req.params;
    const tenant = await prisma.lmsTenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");

    const enrollment = await prisma.lmsEnrollment.findUnique({
      where: { courseId_userId: { courseId: courseId as string, userId } },
    });
    if (!enrollment) throw new AppError(403, "Anda belum terdaftar di kursus ini.");

    await prisma.lmsProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lessonId as string } },
      create: { enrollmentId: enrollment.id, lessonId: lessonId as string },
      update: {},
    });

    // Check completion
    const [allLessons, completedProgress, course] = await Promise.all([
      prisma.lmsLesson.findMany({ where: { courseId: courseId as string }, select: { id: true } }),
      prisma.lmsProgress.findMany({ where: { enrollmentId: enrollment.id }, select: { id: true } }),
      prisma.lmsCourse.findUnique({ where: { id: courseId as string }, select: { title: true } }),
    ]);
    const totalLessons = allLessons.length;
    const completedLessons = completedProgress.length;
    if (totalLessons > 0 && completedLessons >= totalLessons && !enrollment.completedAt) {
      await prisma.lmsEnrollment.update({
        where: { id: enrollment.id },
        data: { completedAt: new Date() },
      });
      // Issue certificate
      await prisma.lmsCertificate.upsert({
        where: { enrollmentId: enrollment.id },
        create: {
          enrollmentId: enrollment.id,
          tenantId: tenant.id,
          userId,
          courseTitle: course?.title ?? "",
        },
        update: {},
      });
    }

    return res.json(successResponse({ lessonId, completed: true }));
  } catch (err) {
    next(err);
  }
});

// Get my certificates (portal)
router.get("/portal/:tenantSlug/certificates", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { tenantSlug } = req.params;
    const tenant = await prisma.lmsTenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");

    const certs = await prisma.lmsCertificate.findMany({
      where: { tenantId: tenant.id, userId },
      orderBy: { issuedAt: "desc" },
    });
    return res.json(successResponse(certs));
  } catch (err) {
    next(err);
  }
});

// Download LMS certificate as PDF (with tenant branding)
router.get("/portal/:tenantSlug/certificates/:certId/download", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { tenantSlug, certId } = req.params;
    const tenant = await prisma.lmsTenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new AppError(404, "Tenant tidak ditemukan.");

    const cert = await prisma.lmsCertificate.findFirst({
      where: { id: certId as string, tenantId: tenant.id, userId },
      include: { user: { select: { name: true } } },
    });
    if (!cert) throw new AppError(404, "Sertifikat tidak ditemukan.");

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 60 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="sertifikat-${certId}.pdf"`);
    doc.pipe(res);

    const primary = tenant.primaryColor ?? "#2563eb";

    // Background stripe
    doc.rect(0, 0, doc.page.width, 20).fill(primary);
    doc.rect(0, doc.page.height - 20, doc.page.width, 20).fill(primary);

    // Tenant name header
    doc.fillColor(primary).fontSize(22).font("Helvetica-Bold")
      .text(tenant.name, 0, 50, { align: "center" });

    // Certificate title
    doc.fillColor("#1D1D1F").fontSize(30).font("Helvetica-Bold")
      .text("SERTIFIKAT PENYELESAIAN", 0, 95, { align: "center" });

    // Recipient
    doc.fontSize(13).font("Helvetica").fillColor("#6E6E73")
      .text("Diberikan kepada:", 0, 155, { align: "center" });
    doc.fontSize(26).font("Helvetica-Bold").fillColor("#1D1D1F")
      .text(cert.user.name, 0, 175, { align: "center" });

    // Course
    doc.fontSize(13).font("Helvetica").fillColor("#6E6E73")
      .text("atas keberhasilan menyelesaikan kursus:", 0, 215, { align: "center" });
    doc.fontSize(18).font("Helvetica-Bold").fillColor(primary)
      .text(cert.courseTitle, 60, 238, { align: "center", width: doc.page.width - 120 });

    // Issue date
    const dateStr = new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    doc.fontSize(12).font("Helvetica").fillColor("#6E6E73")
      .text(`Diterbitkan pada ${dateStr}`, 0, 290, { align: "center" });

    // Certificate ID
    doc.fontSize(9).fillColor("#C0C0C0")
      .text(`ID Sertifikat: ${cert.id}`, 0, doc.page.height - 50, { align: "center" });

    doc.end();
  } catch (err) {
    next(err);
  }
});

export default router;
