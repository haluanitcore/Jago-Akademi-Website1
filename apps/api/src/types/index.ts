export const ROLES = [
  "visitor",
  "student",
  "trainer",
  "event_participant",
  "corporate_client",
  "partner",
  "creator",
  "super_admin",
] as const;

export type Role = (typeof ROLES)[number];

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  // Optional aggregate stats for list endpoints (e.g. reviews avg rating).
  // TASK-011 will formalize a richer, per-endpoint meta contract.
  avgRating?: number;
  totalReviews?: number;
};

export type ApiResponse<T = undefined> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: string };

export function successResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function errorResponse(error: string): ApiResponse<never> {
  return { success: false, error };
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export type AuthUser = {
  id: string;
  email: string;
  roles: Role[];
};
