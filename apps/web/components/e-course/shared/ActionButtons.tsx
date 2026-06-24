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
              ? "border-[#E5E5E5] bg-[#FAFAFA] text-[#AEAEB2] cursor-not-allowed"
              : "border-[#E5E5E5] bg-white text-[#636366] hover:border-[rgba(0,119,168,0.3)] hover:text-[#0077A8] shadow-e1",
          ].join(" ")}
        >
          <Icon size={14} className="flex-none" />
          <span className="leading-tight">{label}</span>
        </button>
      ))}
    </div>
  );
}
