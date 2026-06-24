"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Video, ArrowRight, Star } from "lucide-react";
import { categories } from "@/lib/e-course/utils";

const categoryIcons: Record<string, string> = {
  "digital-marketing": "📣",
  "data-science": "📊",
  "microsoft-office": "💼",
  "ui-ux": "🎨",
  "product-management": "🚀",
  "web-dev": "💻",
};

const categoryColors: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  "digital-marketing": { bg: "rgba(0,212,255,0.06)", border: "rgba(0,119,168,0.2)", accent: "#0077A8", text: "#0077A8" },
  "data-science":      { bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.2)", accent: "#7c3aed", text: "#7c3aed" },
  "microsoft-office":  { bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.2)",  accent: "#16a34a", text: "#16a34a" },
  "ui-ux":             { bg: "rgba(255,0,102,0.06)",  border: "rgba(204,0,82,0.2)",   accent: "#CC0052", text: "#CC0052" },
  "product-management":{ bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", accent: "#d97706", text: "#d97706" },
  "web-dev":           { bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.2)", accent: "#2563eb", text: "#2563eb" },
};

export function ECourseLearningPaths() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? categories.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.topics.some((t) => t.title.toLowerCase().includes(query.toLowerCase()))
      )
    : categories;

  return (
    <section className="py-14 border-t border-[#E5E5E5]">
      <div className="max-w-[1152px] mx-auto px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="flex-1">
            <p className="text-[#0077A8] text-xs font-semibold uppercase tracking-widest mb-2">
              Kurikulum Terstruktur
            </p>
            <h2 className="text-2xl font-bold font-display">
              Daftar Learning Path{" "}
              <span className="text-gradient-brand">Rancangan Experts</span>
            </h2>
            <p className="text-[#6E6E73] text-sm mt-2">
              Lihat contoh beberapa materi terpopuler rancangan instruktur berpengalaman Jago Akademi
            </p>
          </div>

          {/* Search */}
          <div className="relative sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E73]" />
            <input
              type="search"
              placeholder="Cari learning path..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-dark w-full pl-9 text-sm"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((category) => {
              const colors = categoryColors[category.slug] ?? categoryColors["digital-marketing"]!;
              const icon = categoryIcons[category.slug] ?? "📚";
              const totalVideos = category.topics.reduce((acc, t) => acc + t.videoCount, 0);

              return (
                <Link
                  key={category.id}
                  href={`/e-course/${category.slug}`}
                  className="group bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-e1 hover:shadow-e2 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ borderColor: colors.border }}
                >
                  {/* Card top visual */}
                  <div
                    className="relative h-28 flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${colors.bg.replace(")", ", 1.5)").replace("rgba", "rgba")} 0%, rgba(255,255,255,1) 100%)`,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    {/* Subtle grid bg */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage: `linear-gradient(${colors.accent} 1px, transparent 1px), linear-gradient(90deg, ${colors.accent} 1px, transparent 1px)`,
                        backgroundSize: "28px 28px",
                      }}
                    />
                    {/* Soft glow */}
                    <div
                      className="absolute w-32 h-32 rounded-full blur-2xl opacity-15"
                      style={{ background: colors.accent }}
                    />
                    {/* Icon */}
                    <div
                      className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-e1"
                      style={{
                        background: `${colors.bg}`,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {icon}
                    </div>

                    {/* Arrow hint on hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <ArrowRight size={12} style={{ color: colors.accent }} />
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col gap-3">
                    <h3
                      className="font-bold font-display text-base text-[#1D1D1F] leading-tight group-hover:transition-colors"
                      style={{ ["--hover-color" as string]: colors.accent }}
                    >
                      <span className="group-hover:text-inherit" style={{ color: "inherit" }}>
                        {category.title}
                      </span>
                    </h3>

                    <p className="text-[#6E6E73] text-xs leading-relaxed line-clamp-2">
                      {category.description}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 pt-2 border-t border-[#E5E5E5] text-xs text-[#6E6E73]">
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} />
                        {category.topicCount} Topik
                      </span>
                      <span className="flex items-center gap-1">
                        <Video size={11} />
                        {totalVideos}+ Video
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        4.7+
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#6E6E73] text-sm">
              Tidak ada learning path yang cocok untuk &ldquo;{query}&rdquo;
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-[#6E6E73] text-sm mb-4">
            Semua learning path dapat diakses dengan satu berlangganan
          </p>
          <Link href="/e-course/berlangganan" className="btn btn-primary btn-lg inline-flex">
            Mulai Belajar Sekarang
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
