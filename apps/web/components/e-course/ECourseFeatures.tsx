"use client";

import { useState } from "react";
import { GraduationCap, Layers, Users, Trophy, ChevronRight } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Belajar Fleksibel dan Bersertifikat",
    desc: "Disusun bertahap dari level dasar hingga lanjutan. Belajar kapan saja, di mana saja, sesuai ritme kamu.",
  },
  {
    icon: Layers,
    title: "Kombinasi Strategi, Praktek & Portfolio",
    desc: "Belajar sambil Praktek dengan ragam case study, worksheet, dan proyek nyata yang bisa langsung kamu tampilkan.",
  },
  {
    icon: Users,
    title: "Gabung Komunitas Diskusi secara Lifetime",
    desc: "Bangun network profesional, saling sharing ilmu dan pengalaman bersama ribuan member aktif Jago Akademi.",
  },
  {
    icon: Trophy,
    title: "Ratusan Ribu Member. Terbukti Berdampak",
    desc: "Member Jago Akademi telah terbukti diterima di perusahaan nasional dan multinasional terkemuka.",
  },
];

export function ECourseFeatures() {
  const [active, setActive] = useState(0);

  const ActiveIcon = features[active]?.icon ?? GraduationCap;

  return (
    <section className="py-16">
      <div className="max-w-[1152px] mx-auto px-8">

        {/* Heading */}
        <h2 className="text-2xl font-bold font-display text-center text-[#f5f5f5] mb-10">
          Solusi #1 Kuasai Ratusan{" "}
          <span className="text-gradient-brand">Skill Profesional</span>
        </h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left: Feature list */}
          <div className="flex flex-col gap-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              const isActive = i === active;
              return (
                <button
                  key={f.title}
                  type="button"
                  onClick={() => setActive(i)}
                  className={[
                    "w-full text-left rounded-lg border transition-all duration-200 cursor-pointer",
                    isActive
                      ? "border-[#00d4ff]/50 bg-[#00d4ff]/5"
                      : "border-[#262626] bg-[#141414] hover:border-[#00d4ff]/20 hover:bg-[#00d4ff]/3",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-4 p-4">
                    <div
                      className={[
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-none transition-colors",
                        isActive ? "bg-[#00d4ff]/15" : "bg-[#1f1f1f]",
                      ].join(" ")}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-[#00d4ff]" : "text-[#525252]"}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={[
                            "font-semibold text-base",
                            isActive ? "text-[#f5f5f5]" : "text-[#a3a3a3]",
                          ].join(" ")}
                        >
                          {f.title}
                        </p>
                        <ChevronRight
                          size={14}
                          className={[
                            "flex-none transition-transform",
                            isActive ? "text-[#00d4ff] rotate-90" : "text-[#525252]",
                          ].join(" ")}
                        />
                      </div>
                      {isActive && (
                        <p className="text-[#a3a3a3] text-xs mt-1.5 leading-relaxed">
                          {f.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Visual */}
          <div className="relative aspect-square max-w-md mx-auto w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d1a1f] to-[#0d0d0d] border border-[#00d4ff]/10">
            {/* Grid bg */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
              }}
            />

            {/* Active feature visual */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
              <div className="w-20 h-20 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
                <ActiveIcon size={40} className="text-[#00d4ff]" />
              </div>

              <div className="text-center">
                <p className="text-[#f5f5f5] font-bold font-display text-lg leading-snug">
                  {features[active]?.title}
                </p>
                <p className="text-[#525252] text-sm mt-2 leading-relaxed">
                  {features[active]?.desc}
                </p>
              </div>

              {/* Step indicators */}
              <div className="flex gap-2">
                {features.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={[
                      "h-1.5 rounded-full transition-all duration-300",
                      i === active ? "w-8 bg-[#00d4ff]" : "w-1.5 bg-[#262626]",
                    ].join(" ")}
                    aria-label={`Pilih fitur ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#00d4ff]/6 blur-3xl pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
