import type { Metadata } from "next";
import Link from "next/link";
import { Star, Users, Clock, ArrowRight } from "lucide-react";
import { mentors } from "@/lib/e-course/utils";

export const metadata: Metadata = {
  title: "Daftar Mentor & Pengajar Profesional",
  description:
    "Belajar langsung dari praktisi industri berpengalaman. Mentor Jago Akademi berasal dari perusahaan teknologi terkemuka dan siap membimbing Anda mencapai karier impian.",
  alternates: { canonical: "/mentor" },
};

export default function MentorsIndexPage() {
  return (
    <div className="bg-[#F5F5F7] min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[rgba(0,119,168,0.05)] to-[#F5F5F7] border-b border-[#E5E5E5] pt-24 pb-16">
        <div className="max-w-[1152px] mx-auto px-8 text-center space-y-4">
          <span className="text-[#0077A8] text-xs font-bold uppercase tracking-widest bg-[rgba(0,119,168,0.08)] px-3 py-1.5 rounded-full">
            Praktisi & Expert
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-[#1D1D1F] tracking-tight max-w-2xl mx-auto">
            Belajar Langsung dari Pengajar Terbaik
          </h1>
          <p className="text-[#6E6E73] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Kurikulum kami dirancang dan diajarkan langsung oleh para ahli yang bekerja di perusahaan teknologi terkemuka untuk memastikan relevansi industri.
          </p>
        </div>
      </section>

      {/* Grid List Section */}
      <section className="max-w-[1152px] mx-auto px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => {
            const initials = mentor.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2);

            return (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl border border-[#E5E5E5] hover:shadow-e2 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
              >
                {/* Upper Card Info */}
                <div className="p-6 space-y-5">
                  <div className="flex gap-4 items-center">
                    {/* Avatar Initials wrapper */}
                    <div className="flex-none w-14 h-14 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,119,168,0.2)] flex items-center justify-center shadow-e1">
                      <span className="text-[#0077A8] font-bold font-display text-lg">
                        {initials}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-[#1D1D1F] group-hover:text-[#0077A8] transition-colors line-clamp-1">
                        {mentor.name}
                      </h3>
                      <p className="text-xs text-[#6E6E73] mt-0.5">
                        {mentor.role}
                      </p>
                      <p className="text-xs text-[#0077A8] font-semibold mt-0.5">
                        {mentor.company}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-[#636366] text-xs leading-relaxed line-clamp-3">
                    {mentor.bio}
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F5F5F7] text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-[#0077A8]">
                        <Users size={12} />
                        <span className="font-bold text-xs text-[#1D1D1F]">
                          {mentor.totalStudents}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6E6E73]">Pelajar</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-yellow-500">
                        <Star size={12} className="fill-yellow-500" />
                        <span className="font-bold text-xs text-[#1D1D1F]">
                          {mentor.avgRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6E6E73]">Rating</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-[#0077A8]">
                        <Clock size={12} />
                        <span className="font-bold text-xs text-[#1D1D1F]">
                          {mentor.teachingHours}j
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6E6E73]">Ajar</p>
                    </div>
                  </div>
                </div>

                {/* Footer Action button */}
                <div className="bg-[#F5F5F7] px-6 py-4 border-t border-[#E5E5E5]">
                  <Link
                    href={`/mentor/${mentor.slug}`}
                    className="flex items-center justify-between text-xs font-bold text-[#0077A8] group-hover:text-[#005f87] transition-colors"
                  >
                    <span>Lihat Detail Profil</span>
                    <ArrowRight
                      size={14}
                      className="transform group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
