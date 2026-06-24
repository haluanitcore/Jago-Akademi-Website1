"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  _count: { lessons: number; enrollments: number };
};

export default function LmsAdminCoursesPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "draft" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const meRes = await fetch("/api/lms/portal/me");
    const meData = await meRes.json();
    const myTenant = meData.data?.find((t: { slug: string; id: string }) => t.slug === tenantSlug);
    if (!myTenant) { setLoading(false); return; }
    setTenantId(myTenant.id);
    const res = await fetch(`/api/lms/tenants/${myTenant.id}/courses`);
    const data = await res.json();
    setCourses(data.data ?? []);
    setLoading(false);
  }, [tenantSlug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    const res = await fetch(`/api/lms/tenants/${tenantId}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); setForm({ title: "", description: "", status: "draft" }); fetchData(); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#6E6E73] mb-4">
        <Link href={`/lms/${tenantSlug}/admin`} className="hover:text-[#0077A8]">Admin</Link>
        <span>/</span>
        <span className="text-[#1D1D1F]">Kursus LMS</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#1D1D1F]">Course Builder</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87]">
          + Kursus Baru
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Buat Kursus LMS</h2>
            <form onSubmit={createCourse} className="space-y-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul kursus" className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" required />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi (opsional)" rows={3} className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Publikasikan</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm border border-[#E5E5EA] rounded-xl">Batal</button>
                <button type="submit" className="flex-1 py-2 text-sm text-white bg-[#0077A8] rounded-xl">Buat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-[#6E6E73]">Memuat...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-[#6E6E73]">Belum ada kursus. Buat kursus pertama!</div>
      ) : (
        <div className="grid gap-4">
          {courses.map((c) => (
            <div key={c.id} className="bg-white border border-[#E5E5EA] rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#1D1D1F]">{c.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {c.status === "published" ? "Dipublikasikan" : "Draft"}
                    </span>
                  </div>
                  {c.description && <p className="text-sm text-[#6E6E73] mt-1 line-clamp-2">{c.description}</p>}
                  <div className="text-xs text-[#6E6E73] mt-2">
                    {c._count.lessons} pelajaran · {c._count.enrollments} peserta
                  </div>
                </div>
                <Link
                  href={`/lms/${tenantSlug}/admin/courses/${c.id}`}
                  className="ml-4 px-3 py-1.5 text-xs text-[#0077A8] border border-[#0077A8] rounded-lg hover:bg-[#E8F4F9]"
                >
                  Edit Materi
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
