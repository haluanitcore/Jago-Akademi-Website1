import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { errorResponse } from "../types/index.js";

const isDev = env.NODE_ENV === "development";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse("RATE_LIMITED", "Terlalu banyak permintaan. Coba lagi dalam 15 menit."));
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse("RATE_LIMITED", "Terlalu banyak percobaan login. Coba lagi dalam 15 menit."));
  },
});

