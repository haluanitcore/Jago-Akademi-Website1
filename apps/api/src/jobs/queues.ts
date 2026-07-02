import type { Queue, ConnectionOptions } from "bullmq";
import { getRedisConnection, isQueueEnabled } from "./connection.js";
import { logger } from "../lib/logger.js";
import { QUEUE } from "./types.js";
import type { EmailJob, CertificateJob, SearchIndexJob, WebhookJob } from "./types.js";
import { processEmail } from "./processors/email.js";
import { processCertificate } from "./processors/certificate.js";
import { processSearchIndex } from "./processors/searchIndex.js";
import { processWebhookPayment } from "./processors/webhook.js";

/**
 * Producer layer (TASK-022). bullmq is imported LAZILY and queues are created on
 * first use, only when REDIS_URL is set. In dev/test the queue is disabled and
 * `dispatch` runs the processor INLINE — identical to the pre-queue behavior, and
 * the heavy redis/bullmq stack never loads. In production, jobs go to Redis and
 * are consumed by apps/api/src/worker.ts.
 */

const defaultJobOptions = {
  attempts: 5,
  backoff: { type: "exponential" as const, delay: 2000 },
  removeOnComplete: { count: 200 },
  // Keep failed jobs so they can be inspected/replayed (dead-letter pattern).
  removeOnFail: { count: 5000 },
};

type QueueSet = Record<string, Queue>;
let queueSetPromise: Promise<QueueSet> | null = null;

async function initQueues(): Promise<QueueSet> {
  const connection = await getRedisConnection();
  if (!connection) return {};
  const { Queue } = await import("bullmq");
  const make = (name: string): Queue =>
    new Queue(name, {
      // BullMQ bundles its own ioredis types; the runtime instance is compatible.
      connection: connection as unknown as ConnectionOptions,
      defaultJobOptions,
    });
  return {
    [QUEUE.EMAIL]: make(QUEUE.EMAIL),
    [QUEUE.CERTIFICATE]: make(QUEUE.CERTIFICATE),
    [QUEUE.SEARCH_INDEX]: make(QUEUE.SEARCH_INDEX),
    [QUEUE.WEBHOOK]: make(QUEUE.WEBHOOK),
  };
}

async function getQueue(name: string): Promise<Queue | null> {
  if (!isQueueEnabled()) return null;
  if (!queueSetPromise) queueSetPromise = initQueues();
  const set = await queueSetPromise;
  return set[name] ?? null;
}

type DispatchOpts<T> = {
  queueName: string;
  processor: (data: T) => Promise<void>;
  jobName: string;
  data: T;
  jobId?: string;
  /** Best-effort jobs swallow errors on the inline path (fire-and-forget). */
  bestEffort: boolean;
};

async function dispatch<T>(opts: DispatchOpts<T>): Promise<void> {
  const { queueName, processor, jobName, data, jobId, bestEffort } = opts;

  const queue = await getQueue(queueName);
  if (queue) {
    try {
      await queue.add(jobName, data, jobId ? { jobId } : undefined);
      return;
    } catch (err) {
      // Redis unreachable at enqueue time — degrade to inline so the side-effect
      // is not silently lost during a Redis hiccup.
      logger.warn("queue.add failed, running inline", { queue: queueName, err: String(err) });
    }
  }

  if (bestEffort) {
    try {
      await processor(data);
    } catch (err) {
      logger.warn("inline job failed (best-effort)", { queue: queueName, err: String(err) });
    }
  } else {
    await processor(data);
  }
}

// ─── Public enqueue API (used by routes/services) ─────────────────────────────

export function enqueueEmail(data: EmailJob): Promise<void> {
  return dispatch({ queueName: QUEUE.EMAIL, processor: processEmail, jobName: data.type, data, bestEffort: true });
}

export function enqueueCertificate(data: CertificateJob): Promise<void> {
  return dispatch({
    queueName: QUEUE.CERTIFICATE,
    processor: processCertificate,
    jobName: data.type,
    data,
    // Idempotent per (user, course) so retries/duplicates collapse to one job.
    jobId: `cert:${data.userId}:${data.courseId}`,
    bestEffort: true,
  });
}

export function enqueueSearchIndex(data: SearchIndexJob): Promise<void> {
  const jobId = data.type === "index-course" ? `index:${data.course.id}` : `delete:${data.courseId}`;
  return dispatch({
    queueName: QUEUE.SEARCH_INDEX,
    processor: processSearchIndex,
    jobName: data.type,
    data,
    jobId,
    bestEffort: true,
  });
}

export function enqueueWebhook(data: WebhookJob): Promise<void> {
  return dispatch({
    queueName: QUEUE.WEBHOOK,
    processor: processWebhookPayment,
    jobName: "doku-payment",
    data,
    jobId: `webhook:${data.invoiceNumber}:${data.txStatus}`,
    // Reliable: an inline failure propagates so the route returns 500 and DOKU retries.
    bestEffort: false,
  });
}

/** Close all queues for graceful shutdown (no-op if never initialized). */
export async function closeQueues(): Promise<void> {
  if (!queueSetPromise) return;
  const set = await queueSetPromise;
  await Promise.all(Object.values(set).map((q) => q.close()));
}
