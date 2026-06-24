"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const members = [
  { initials: "TR", name: "Taufik R.", role: "QA Tester", company: "Bank BNI", color: "#0077A8" },
  { initials: "LN", name: "Latifah N.", role: "HR Generalist", company: "TIX ID", color: "#CC0052" },
  { initials: "MR", name: "Muhammad R.", role: "Performance Marketing", company: "Jakmall.com", color: "#0077A8" },
  { initials: "SA", name: "Siti M.", role: "Data Analyst", company: "Gloria Cosmetics", color: "#CC0052" },
  { initials: "BA", name: "Bram A.", role: "HR Specialist", company: "Perkebunan Nusantara", color: "#0077A8" },
  { initials: "RA", name: "Rindi A.", role: "Content Writer", company: "Halal Network Int'l", color: "#CC0052" },
  { initials: "AP", name: "Agustinus P.", role: "Web Admin", company: "Unika Atma Jaya", color: "#0077A8" },
  { initials: "RI", name: "Rizki A.", role: "Transport Admin", company: "Precast Industry", color: "#CC0052" },
  { initials: "LE", name: "Luthfiani E.", role: "Human Capital Officer", company: "Kurasi Media", color: "#0077A8" },
  { initials: "SF", name: "Sindy A.", role: "Data Analyst", company: "StickEarn", color: "#CC0052" },
];

export function ECourseTestimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -420 : 420, behavior: "smooth" });
  }

  return (
    <section className="relative overflow-hidden">
      {/* Top accent band */}
      <div className="bg-[rgba(0,119,168,0.04)] border-t border-[rgba(0,119,168,0.08)]">
        <div className="max-w-[1152px] mx-auto px-8 pt-10 pb-8">
          <h2 className="text-2xl font-bold font-display text-center">
            Testimoni Member E-Course{" "}
            <span className="text-gradient-brand">Jago Akademi</span>
          </h2>
        </div>
      </div>

      {/* Cards area — curved bottom */}
      <div className="relative">
        {/* Accent bg with curved bottom */}
        <div
          className="absolute top-0 left-0 right-0 h-28 bg-[rgba(0,119,168,0.04)]"
          style={{ borderRadius: "0 0 60px 60px" }}
        />

        <div className="relative max-w-[1152px] mx-auto px-8 pb-10">
          <div className="relative">
            {/* Left scroll button */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4 w-9 h-36 flex items-center justify-center bg-white border border-[#E5E5E5] rounded-l-lg text-[#636366] hover:text-[#0077A8] hover:border-[rgba(0,119,168,0.3)] transition-colors shadow-e1 opacity-70 hover:opacity-100"
              aria-label="Geser ke kiri"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Cards scroll container */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 pt-2"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {members.map((m) => (
                <div
                  key={m.initials}
                  className="flex-none w-44 bg-white border border-[#E5E5E5] rounded-lg p-2 flex flex-col gap-2 shadow-e1"
                  style={{ scrollSnapAlign: "start" }}
                >
                  {/* Avatar */}
                  <div
                    className="w-full aspect-square rounded-sm flex items-center justify-center text-3xl font-bold font-display"
                    style={{
                      background: `linear-gradient(135deg, ${m.color}14, ${m.color}06)`,
                      border: `1px solid ${m.color}22`,
                      color: m.color,
                    }}
                  >
                    {m.initials}
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <p className="text-[#1D1D1F] text-xs font-semibold truncate">{m.name}</p>
                    <p className="text-[#6E6E73] text-[10px] truncate">{m.role}</p>
                    <p className="text-[10px] truncate font-medium" style={{ color: m.color }}>{m.company}</p>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    className="w-full py-1.5 px-2 rounded-md text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: m.color }}
                  >
                    Baca Cerita
                  </button>
                </div>
              ))}
            </div>

            {/* Right scroll button */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4 w-9 h-36 flex items-center justify-center bg-white border border-[#E5E5E5] rounded-r-lg text-[#636366] hover:text-[#0077A8] hover:border-[rgba(0,119,168,0.3)] transition-colors shadow-e1 opacity-70 hover:opacity-100"
              aria-label="Geser ke kanan"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
