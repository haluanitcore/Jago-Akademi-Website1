"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  status: string;
  price: number;
  enrollments: number;
};

export default function TrainerCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trainer/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCourses(d.data.courses); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="bg-white border-b border-[#E5E5EA] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/trainer-hub" className="text-[#0077A8] hover:underline">Trainer Hub</Link>
            <span className="text-[#6E6E73]">/</span>
            <span className="text-[#1D1D1F] font-medium">Kursus Saya</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12 text-[#6E6E73]">Memuat...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E5EA]">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-[#1D1D1F] font-medium mb-1">Belum ada kursus</p>
            <p className="text-sm text-[#6E6E73]">Hubungi admin untuk menambahkan kursus Anda.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F7] text-[#6E6E73]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Judul Kursus</th>
                  <th className="px-4 py-3 text-center font-medium">Peserta</th>
                  <th className="px-4 py-3 text-right font-medium">Harga</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7]">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F5F5F7]">
                    <td className="px-4 py-4 font-medium text-[#1D1D1F]">{c.title}</td>
                    <td className="px-4 py-4 text-center text-[#6E6E73]">{c.enrollments.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-4 text-right text-[#1D1D1F]">Rp {c.price.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-[#F5F5F7] text-[#6E6E73]"}`}>
                        {c.status === "published" ? "Aktif" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link href={`/trainer-hub/kursus/${c.id}`} className="text-xs text-[#0077A8] hover:underline font-medium">
                        Lihat Analitik →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
