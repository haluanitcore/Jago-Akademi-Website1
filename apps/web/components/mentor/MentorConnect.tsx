import { MessageCircle, Users, Code2, Calendar } from "lucide-react";
import type { Mentor } from "@/lib/e-course/types";

type MentorConnectProps = {
  mentor: Mentor;
};

type SessionType = {
  icon: typeof MessageCircle;
  title: string;
  description: string;
};

const sessionTypes: SessionType[] = [
  {
    icon: MessageCircle,
    title: "Sesi 1-on-1",
    description: "Konsultasi privat 30 menit",
  },
  {
    icon: Users,
    title: "Q&A Group",
    description: "Sesi tanya jawab bersama 10–15 peserta",
  },
  {
    icon: Code2,
    title: "Code Review",
    description: "Review project atau portofoliomu",
  },
];

const availableSlots = [
  "Senin, 30 Jun · 10:00",
  "Selasa, 1 Jul · 14:00",
  "Rabu, 2 Jul · 16:00",
];

export function MentorConnect({ mentor }: MentorConnectProps) {
  return (
    <section className="py-10 border-t border-[#E5E5E5]">
      <div className="max-w-[1152px] mx-auto px-8 flex flex-col gap-8">
        <header className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold font-display text-[#1D1D1F]">
            Terhubung dengan {mentor.name}
          </h2>
          <p className="text-[#6E6E73] text-sm max-w-2xl">
            Ajukan pertanyaan, dapatkan feedback kode, atau diskusi karier langsung dengan
            mentor.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessionTypes.map((session) => {
            const Icon = session.icon;
            return (
              <div
                key={session.title}
                className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-e1 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[rgba(0,119,168,0.2)] flex items-center justify-center flex-none">
                    <Icon size={18} className="text-[#0077A8]" />
                  </div>
                  <span className="bg-[rgba(204,0,82,0.08)] text-[#CC0052] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#1D1D1F] font-semibold text-sm">{session.title}</h3>
                  <p className="text-[#636366] text-xs leading-relaxed">
                    {session.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#1D1D1F] font-semibold text-sm">
            <Calendar size={16} className="text-[#0077A8]" />
            Jadwal Tersedia Berikutnya
          </div>
          <div className="flex gap-2 flex-wrap">
            {availableSlots.map((slot) => (
              <span
                key={slot}
                className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(0,119,168,0.2)] bg-[rgba(0,119,168,0.04)] text-[#0077A8]"
              >
                {slot}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button type="button" className="btn btn-primary w-full justify-center">
            Pesan Sesi Sekarang
          </button>
          <p className="text-[#AEAEB2] text-xs">Membutuhkan berlangganan aktif</p>
        </div>
      </div>
    </section>
  );
}
