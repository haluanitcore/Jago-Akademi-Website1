import rateLimit from "express-rate-limit";
import { errorResponse } from "../types/index.js";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse("Terlalu banyak permintaan. Coba lagi dalam 15 menit."));
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse("Terlalu banyak percobaan login. Coba lagi dalam 15 menit."));
  },
});
