type ProgressBarProps = {
  percent: number;
  label?: string;
  className?: string;
};

export function ProgressBar({ percent, label, className = "" }: ProgressBarProps) {
  const displayLabel = label ?? (percent === 0 ? "Belum dimulai... 0%" : `${percent}% selesai`);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <p className="text-[#525252] text-xs">{displayLabel}</p>
      <div className="h-1.5 rounded-full bg-[#1f1f1f] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#00d4ff] transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
