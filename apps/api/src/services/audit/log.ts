import { prisma } from "../../db/prisma.js";

type AuditPayload = {
  actorId?: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

const REDACTED_KEYS = new Set([
  "passwordHash",
  "emailVerifyToken",
  "resetPasswordToken",
  "tokenHash",
  "password",
]);

function redact(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      REDACTED_KEYS.has(k) ? "[REDACTED]" : v,
    ]),
  );
}

export async function writeAudit(payload: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: payload.action,
        resource: payload.resource,
        resourceId: payload.resourceId,
        oldValue: payload.oldValue ? redact(payload.oldValue) : undefined,
        newValue: payload.newValue ? redact(payload.newValue) : undefined,
        ip: payload.ip,
        userAgent: payload.userAgent,
      },
    });
  } catch {
    // Audit failure must never break the request
    console.error("[audit] Failed to write audit log:", payload.action, payload.resource);
  }
}
