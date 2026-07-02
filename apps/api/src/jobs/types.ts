import type { indexCourse } from "../services/search/meilisearch.js";

/** Canonical queue names (TASK-022, SSOT §3.8). */
export const QUEUE = {
  EMAIL: "email",
  CERTIFICATE: "certificate",
  SEARCH_INDEX: "search-index",
  WEBHOOK: "webhook",
} as const;

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE];

/** Transactional notification jobs (email + WhatsApp), all retryable. */
export type EmailJob =
  | { type: "payment-success"; to: string; name: string; orderId: string; courseName: string; amount: number }
  | { type: "payment-pending"; to: string; name: string; orderId: string; amount: number; paymentUrl: string }
  | { type: "order-invoice"; to: string; name: string; orderId: string }
  | { type: "wa-payment-success"; phone: string; name: string; courseName: string };

export type CertificateJob = { type: "issue"; userId: string; courseId: string };

// Reuse the exact shape indexCourse expects so the queue payload never drifts.
export type IndexCourseInput = Parameters<typeof indexCourse>[0];

export type SearchIndexJob =
  | { type: "index-course"; course: IndexCourseInput }
  | { type: "delete-course"; courseId: string };

/** DOKU payment fulfillment; processed idempotently (skip already-paid orders). */
export type WebhookJob = { invoiceNumber: string; txStatus: string; channelId?: string };
