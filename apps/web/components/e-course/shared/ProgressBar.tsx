type ProgressBarProps = {
  percent: number;
  label?: string;
  className?: string;
};

export function ProgressBar({ percent, label, className = "" }: ProgressBarProps) {
  const displayLabel = label ?? (percent === 0 ? "Belum dimulai... 0%" : `${percent}% selesai`);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <p className="text-[#6E6E73] text-xs">{displayLabel}</p>
      <div className="h-1.5 rounded-full bg-[#E5E5E5] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#0077A8] transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
