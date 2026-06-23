import { Star, Users, Clock, ExternalLink } from "lucide-react";
import type { Mentor } from "@/lib/e-course/types";

type MentorHeroProps = {
  mentor: Mentor;
};

export function MentorHero({ mentor }: MentorHeroProps) {
  const initials = mentor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <section className="bg-gradient-to-b from-[#001a20] to-[#0d0d0d] border-b border-[#00d4ff]/10">
      <div className="max-w-[1152px] mx-auto px-8 py-12">
        <div className="flex flex-col sm:flex-row gap-8 items-start">

          {/* Avatar */}
          <div className="flex-none w-24 h-24 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
            <span className="text-[#00d4ff] font-bold font-display text-3xl">{initials}</span>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold font-display text-[#f5f5f5]">{mentor.name}</h1>
              <p className="text-[#a3a3a3] text-sm mt-1">
                {mentor.role} · <span className="text-[#00d4ff]">{mentor.company}</span>
              </p>
            </div>

            <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-2xl">
              {mentor.bio}
            </p>

            {/* Stats */}
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#00d4ff]" />
                <div>
                  <p className="text-[#f5f5f5] font-bold text-sm">{mentor.totalStudents}</p>
                  <p className="text-[#525252] text-xs">Total Pelajar</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="text-[#f5f5f5] font-bold text-sm">{mentor.avgRating.toFixed(2)}</p>
                  <p className="text-[#525252] text-xs">Rating Rata-rata</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#00d4ff]" />
                <div>
                  <p className="text-[#f5f5f5] font-bold text-sm">{mentor.teachingHours}+</p>
                  <p className="text-[#525252] text-xs">Jam Mengajar</p>
                </div>
              </div>
            </div>

            {/* Socials */}
            {mentor.linkedinUrl && (
              <a
                href={mentor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#525252] hover:text-[#00d4ff] transition-colors"
              >
                <ExternalLink size={14} />
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
