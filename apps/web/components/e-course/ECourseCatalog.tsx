"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Star, Users, ArrowRight } from "lucide-react";

type Category = {
  id: string;
  label: string;
};

type Course = {
  id: string;
  category: string;
  title: string;
  instructor: string;
  duration: string;
  rating: number;
  students: string;
  level: "Pemula" | "Menengah" | "Lanjutan";
};

const categories: Category[] = [
  { id: "digital-marketing", label: "Digital Marketing" },
  { id: "data-science", label: "Data Science & Analysis" },
  { id: "microsoft-office", label: "Microsoft Excel, Word & PPT" },
  { id: "ui-ux", label: "UI/UX Research & Design" },
  { id: "product-management", label: "Product & Project Management" },
  { id: "web-dev", label: "Website & Apps Development" },
];

const courses: Course[] = [
  { id: "dm-1", category: "digital-marketing", title: "Digital Marketing Fundamentals", instructor: "Ahmad Fauzi", duration: "8 jam", rating: 4.9, students: "12.5K", level: "Pemula" },
  { id: "dm-2", category: "digital-marketing", title: "Social Media Marketing Mastery", instructor: "Rina Kusuma", duration: "10 jam", rating: 4.8, students: "9.2K", level: "Menengah" },
  { id: "dm-3", category: "digital-marketing", title: "SEO & SEM Lengkap", instructor: "Budi Santoso", duration: "12 jam", rating: 4.7, students: "7.8K", level: "Menengah" },
  { id: "dm-4", category: "digital-marketing", title: "Google Ads untuk Bisnis", instructor: "Dewi Pratiwi", duration: "6 jam", rating: 4.9, students: "5.3K", level: "Pemula" },
  { id: "ds-1", category: "data-science", title: "Python untuk Data Analysis", instructor: "Kevin Wijaya", duration: "15 jam", rating: 4.9, students: "8.1K", level: "Pemula" },
  { id: "ds-2", category: "data-science", title: "Data Visualization dengan Tableau", instructor: "Sarah Putri", duration: "9 jam", rating: 4.8, students: "6.4K", level: "Menengah" },
  { id: "ds-3", category: "data-science", title: "Machine Learning Dasar", instructor: "Rizal Firmansyah", duration: "20 jam", rating: 4.7, students: "4.9K", level: "Lanjutan" },
  { id: "ds-4", category: "data-science", title: "SQL untuk Data Analyst", instructor: "Maya Sari", duration: "8 jam", rating: 4.8, students: "10.2K", level: "Pemula" },
  { id: "ms-1", category: "microsoft-office", title: "Excel Mahir untuk Profesional", instructor: "Hendra Gunawan", duration: "10 jam", rating: 4.9, students: "15.7K", level: "Pemula" },
  { id: "ms-2", category: "microsoft-office", title: "PowerPoint Presentasi Profesional", instructor: "Lina Oktavia", duration: "6 jam", rating: 4.8, students: "11.3K", level: "Pemula" },
  { id: "ms-3", category: "microsoft-office", title: "Excel VBA & Macro Automation", instructor: "Doni Prasetyo", duration: "12 jam", rating: 4.7, students: "4.2K", level: "Lanjutan" },
  { id: "ms-4", category: "microsoft-office", title: "Word untuk Dokumen Profesional", instructor: "Ani Rahayu", duration: "5 jam", rating: 4.6, students: "8.9K", level: "Pemula" },
  { id: "ux-1", category: "ui-ux", title: "UI/UX Design dengan Figma", instructor: "Cindy Maharani", duration: "14 jam", rating: 4.9, students: "9.6K", level: "Pemula" },
  { id: "ux-2", category: "ui-ux", title: "User Research & Usability Testing", instructor: "Fajar Nugroho", duration: "8 jam", rating: 4.8, students: "6.1K", level: "Menengah" },
  { id: "pm-1", category: "product-management", title: "Product Management Essentials", instructor: "Tina Wulandari", duration: "12 jam", rating: 4.9, students: "7.3K", level: "Pemula" },
  { id: "pm-2", category: "product-management", title: "Agile & Scrum untuk Tim", instructor: "Raka Satria", duration: "8 jam", rating: 4.8, students: "5.8K", level: "Menengah" },
  { id: "wd-1", category: "web-dev", title: "HTML, CSS & JavaScript Dasar", instructor: "Gilang Permana", duration: "18 jam", rating: 4.9, students: "13.4K", level: "Pemula" },
  { id: "wd-2", category: "web-dev", title: "React.js untuk Frontend", instructor: "Nadia Putri", duration: "16 jam", rating: 4.8, students: "8.7K", level: "Menengah" },
  { id: "wd-3", category: "web-dev", title: "Node.js & Express API", instructor: "Bagas Kurniawan", duration: "14 jam", rating: 4.7, students: "5.5K", level: "Menengah" },
  { id: "wd-4", category: "web-dev", title: "Next.js Full Stack Development", instructor: "Yuni Kristiani", duration: "20 jam", rating: 4.9, students: "4.8K", level: "Lanjutan" },
];

const levelColors: Record<Course["level"], string> = {
  Pemula: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Menengah: "text-[#0077A8] bg-[rgba(0,119,168,0.07)] border-[rgba(0,119,168,0.2)]",
  Lanjutan: "text-[#CC0052] bg-[rgba(204,0,82,0.07)] border-[rgba(204,0,82,0.2)]",
};

export function ECourseCatalog() {
  const [activeCategory, setActiveCategory] = useState("digital-marketing");

  const filtered = courses.filter((c) => c.category === activeCategory);

  return (
    <section className="py-16 border-t border-[#E5E5E5]">
      <div className="max-w-[1152px] mx-auto px-8">

        {/* Heading */}
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold font-display">
            Ratusan Skill Impian{" "}
            <span className="text-gradient-brand">Kini Dalam Genggamanmu</span>
          </h2>
        </div>
        <p className="text-center text-[#636366] text-sm mb-8">
          Lihat contoh beberapa materi terpopuler rancangan instruktur berpengalaman Jago Akademi
        </p>

        {/* Category tabs — horizontal scroll */}
        <div className="relative mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={[
                    "flex-none text-xs font-medium px-3 py-1.5 rounded-md border transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "bg-[#0077A8] border-[#0077A8] text-white"
                      : "border-[rgba(0,119,168,0.35)] text-[#0077A8] hover:bg-[rgba(0,119,168,0.06)]",
                  ].join(" ")}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Course cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/e-course/${course.category}`}
              className="group bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col gap-3 shadow-e1 hover:border-[rgba(0,119,168,0.25)] hover:shadow-e2 transition-all duration-200"
            >
              {/* Thumbnail placeholder */}
              <div className="aspect-video rounded-lg bg-gradient-to-br from-[rgba(0,119,168,0.06)] to-[rgba(0,119,168,0.02)] border border-[#E5E5E5] flex items-center justify-center">
                <p className="text-[#0077A8] text-xs font-mono opacity-40">PREVIEW</p>
              </div>

              {/* Level badge */}
              <span
                className={[
                  "self-start text-[10px] font-medium px-2 py-0.5 rounded border",
                  levelColors[course.level],
                ].join(" ")}
              >
                {course.level}
              </span>

              {/* Title */}
              <h3 className="text-[#1D1D1F] text-sm font-semibold leading-snug group-hover:text-[#0077A8] transition-colors line-clamp-2">
                {course.title}
              </h3>

              {/* Instructor */}
              <p className="text-[#6E6E73] text-xs">{course.instructor}</p>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[#6E6E73] text-xs mt-auto pt-2 border-t border-[#E5E5E5]">
                <span className="flex items-center gap-1">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {course.students}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <Clock size={10} />
                  {course.duration}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-8">
          <Link
            href="/e-course"
            className="btn btn-outline btn-lg inline-flex"
          >
            Lihat Semua Materi
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
