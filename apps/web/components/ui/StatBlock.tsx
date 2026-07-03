import { cn } from "@/lib/utils";

type Props = {
  /** MUST come from real data (API/DB) — never a marketing invention. */
  value: string;
  label: string;
  /** Optional source/context note, e.g. "per Juli 2026". */
  hint?: string;
  onInk?: boolean;
  className?: string;
};

/**
 * Outcome/stat block. HONEST-DATA RULE: only render with verifiable numbers;
 * if the number doesn't exist yet, omit the block — never fabricate.
 */
export function StatBlock({ value, label, hint, onInk = false, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className={cn("stat-number", onInk ? "text-white" : "text-[var(--text-primary)]")}>{value}</p>
      <p className={cn("text-sm font-medium", onInk ? "text-white/70" : "text-[var(--text-secondary)]")}>{label}</p>
      {hint && <p className={cn("text-xs", onInk ? "text-white/40" : "text-[var(--text-muted)]")}>{hint}</p>}
    </div>
  );
}
