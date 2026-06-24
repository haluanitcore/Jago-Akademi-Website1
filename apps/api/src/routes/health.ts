import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Jago Akademi Core API",
    version: "1.0.0",
  });
});

export default router;
