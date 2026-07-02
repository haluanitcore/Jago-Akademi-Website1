/**
 * Minimal structured JSON logger (TASK-022). TASK-023 replaces the internals
 * with pino + request-id correlation while keeping this same call surface.
 * Writes to stdout/stderr directly (not console.*) and is silent under tests.
 */
type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, msg: string, meta?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "test") return;
  const record = { level, msg, ...meta, time: new Date().toISOString() };
  const line = JSON.stringify(record) + "\n";
  if (level === "error" || level === "warn") process.stderr.write(line);
  else process.stdout.write(line);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
};
