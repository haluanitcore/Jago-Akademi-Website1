import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { AppError, successResponse } from "../types/index.js";
import { env } from "../config/env.js";

const router = Router();

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function ensureUploadDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(env.UPLOAD_DIR, "images");
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(env.UPLOAD_DIR, "videos");
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, `Format tidak didukung. Gunakan: ${ALLOWED_IMAGE_TYPES.join(", ")}`));
    }
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for video
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, `Format video tidak didukung. Gunakan: ${ALLOWED_VIDEO_TYPES.join(", ")}`));
    }
  },
});

// POST /api/upload/image — trainer or admin
router.post(
  "/image",
  authenticate,
  // H2/M2: uploads must be restricted to trainers/admins, not any logged-in user.
  authorize("trainer", "super_admin"),
  (req: Request, res: Response, next: NextFunction) => {
    imageUpload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new AppError(400, `File terlalu besar. Maksimal ${env.MAX_FILE_SIZE_MB}MB.`));
        }
        return next(new AppError(400, err.message));
      }
      if (err) return next(err);
      next();
    });
  },
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return next(new AppError(400, "Tidak ada file yang diunggah."));
      const url = `/uploads/images/${req.file.filename}`;
      res.status(201).json(successResponse({ url, filename: req.file.filename, size: req.file.size }));
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/upload/video — trainer or admin
router.post(
  "/video",
  authenticate,
  // H2/M2: uploads must be restricted to trainers/admins, not any logged-in user.
  authorize("trainer", "super_admin"),
  (req: Request, res: Response, next: NextFunction) => {
    videoUpload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new AppError(400, "File video terlalu besar. Maksimal 500MB."));
        }
        return next(new AppError(400, err.message));
      }
      if (err) return next(err);
      next();
    });
  },
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return next(new AppError(400, "Tidak ada file yang diunggah."));
      const url = `/uploads/videos/${req.file.filename}`;
      res.status(201).json(successResponse({ url, filename: req.file.filename, size: req.file.size }));
    } catch (err) {
      next(err);
    }
  },
);

export default router;
