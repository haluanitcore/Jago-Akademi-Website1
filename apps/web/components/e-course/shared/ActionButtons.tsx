import { Award, ExternalLink, Users, Calendar } from "lucide-react";

type ActionButtonsProps = {
  isLocked?: boolean;
};

const actions = [
  { icon: Award, label: "Dapatkan Sertifikat" },
  { icon: ExternalLink, label: "Upload ke LinkedIn" },
  { icon: Users, label: "Join Komunitas" },
  { icon: Calendar, label: "Atur Jadwal Belajar" },
];

export function ActionButtons({ isLocked = true }: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          disabled={isLocked}
          className={[
            "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 text-left",
            isLocked
              ? "border-[#1f1f1f] bg-[#141414] text-[#3a3a3a] cursor-not-allowed"
              : "border-[#262626] bg-[#141414] text-[#a3a3a3] hover:border-[#00d4ff]/30 hover:text-[#00d4ff]",
          ].join(" ")}
        >
          <Icon size={14} className="flex-none" />
          <span className="leading-tight">{label}</span>
        </button>
      ))}
    </div>
  );
}
