import { Router, type Request, type Response, type NextFunction } from "express";
import { listCourses } from "../services/course/courseService.js";
import { successResponse } from "../types/index.js";

const router = Router();

// GET /api/search?q=&type=course&page=1&limit=20
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    if (!q || q.length < 2) {
      return res.json(successResponse({ courses: [], total: 0, q: q ?? "" }));
    }

    const result = await listCourses({ q, page, limit });

    res.json(
      successResponse({
        courses: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        q,
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
