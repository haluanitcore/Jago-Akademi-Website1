"use client";

import { useEffect, useState, useCallback } from "react";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  price: number;
  totalEnrolled: number;
  createdAt: string;
  publishedAt: string | null;
  trainer: { id: string; name: string };
  category: { name: string } | null;
};

export default function AdminKursusPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const LIMIT = 20;

  const fetchCourses = useCallback(async () => {
    const token = sessionStorage.getItem("access_token");
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${API}/api/admin/courses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await res.json();
      if (body.success) {
        setCourses(body.data);
        setTotal(body.meta?.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [API, page, statusFilter]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  async function handleAction(courseId: string, action: "approve" | "reject") {
    const token = sessionStorage.getItem("access_token");
    if (!token) return;
    setActionId(courseId);
    try {
      const res = await fetch(`${API}/api/admin/courses/${courseId}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await res.json();
      if (body.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, status: body.data.status } : c))
        );
      }
    } finally {
      setActionId(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  const STATUS_COLORS: Record<string, string> = {
    published: "bg-green-50 text-green-700",
    draft: "bg-amber-50 text-amber-700",
    archived: "bg-[#F5F5F7] text-[#6E6E73]",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Manajemen Kursus</h1>
          <p className="text-[#6E6E73] text-sm mt-1">{total.toLocaleString("id-ID")} kursus</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {["", "draft", "published", "archived"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              statusFilter === s
                ? "bg-[#0077A8] text-white border-[#0077A8]"
                : "bg-white text-[#3C3C43] border-[#E5E5EA] hover:border-[#0077A8]"
            }`}
          >
            {s === "" ? "Semua" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Judul</th>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Trainer</th>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Kategori</th>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Peserta</th>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-[#3C3C43]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6E6E73]">
                    Memuat...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6E6E73]">
                    Tidak ada kursus.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F5F5F7] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1D1D1F] line-clamp-1">{course.title}</p>
                      <p className="text-xs text-[#6E6E73] mt-0.5">{course.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-[#3C3C43]">{course.trainer.name}</td>
                    <td className="px-4 py-3 text-[#3C3C43]">{course.category?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-[#3C3C43]">{course.totalEnrolled.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[course.status] ?? "bg-[#F5F5F7] text-[#6E6E73]"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {course.status === "draft" && (
                          <button
                            type="button"
                            disabled={actionId === course.id}
                            onClick={() => handleAction(course.id, "approve")}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors disabled:opacity-50"
                          >
                            {actionId === course.id ? "..." : "Publikasikan"}
                          </button>
                        )}
                        {course.status === "published" && (
                          <button
                            type="button"
                            disabled={actionId === course.id}
                            onClick={() => handleAction(course.id, "reject")}
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition-colors disabled:opacity-50"
                          >
                            {actionId === course.id ? "..." : "Ke Draft"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#E5E5EA] flex items-center justify-between">
            <p className="text-sm text-[#6E6E73]">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5EA] text-[#3C3C43] hover:bg-[#F5F5F7] disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5EA] text-[#3C3C43] hover:bg-[#F5F5F7] disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
