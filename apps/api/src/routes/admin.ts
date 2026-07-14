import { Router, type Request, type Response, type NextFunction } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { AppError } from "../types/index.js";
import statsRouter from "../modules/admin/stats.js";
import usersRouter from "../modules/admin/users.js";
import coursesRouter from "../modules/admin/courses.js";
import transactionsRouter from "../modules/admin/transactions.js";
import leadsRouter from "../modules/admin/leads.js";
import eventsRouter from "../modules/admin/events.js";
import blogRouter from "../modules/admin/blog.js";
import reviewsRouter from "../modules/admin/reviews.js";
import couponsRouter from "../modules/admin/coupons.js";

/**
 * Admin routes. The former 668-line monolith is split into resource sub-routers
 * under `modules/admin/`, each < 400 lines. All sub-routers mount at the same
 * `/api/admin` base so endpoint paths are unchanged. The shared global
 * middleware (authenticate + requireAdmin) is applied ONCE here before the
 * sub-routers, exactly as in the original file.
 */
const router = Router();

// All admin routes require authentication + super_admin role
function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const isAdmin = req.user?.roles.includes("super_admin" as never);
  if (!isAdmin) return next(new AppError(403, "Akses ditolak. Hanya super admin."));
  next();
}

router.use(authenticate, requireAdmin);

router.use(statsRouter);
router.use(usersRouter);
router.use(coursesRouter);
router.use(transactionsRouter);
router.use(leadsRouter);
router.use(eventsRouter);
router.use(blogRouter);
router.use(reviewsRouter);
router.use(couponsRouter);

export default router;
