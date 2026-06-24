import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError, errorResponse } from "../types/index.js";

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json(errorResponse("Route not found"));
};

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    res.status(400).json(errorResponse(message));
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", err);
  }

  res.status(500).json(errorResponse("Terjadi kesalahan server. Silakan coba lagi."));
};
