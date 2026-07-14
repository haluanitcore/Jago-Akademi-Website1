"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getValidToken } from "@/lib/auth/token";

type Lesson = {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  durationMins: number | null;
  sortOrder: number;
  _count: { quizzes: number };
};

type Batch = { id: string; name: string };

export default function LmsAdminCourseBuilderPage() {
  const { tenantSlug, courseId } = useParams<{ tenantSlug: string; courseId: string }>();
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonForm, setLessonForm] = useState({ title: "", content: "", videoUrl: "", durationMins: "" });
  const [assignBatchId, setAssignBatchId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    const authHeaders = { Authorization: `Bearer ${token}` };
    const meRes = await fetch("/api/lms/portal/me", { headers: authHeaders });
    const meData = await meRes.json();
    const myTenant = meData.data?.find((t: { slug: string; id: string }) => t.slug === tenantSlug);
    if (!myTenant) return;
    setTenantId(myTenant.id);
    const [lessonRes, batchRes] = await Promise.all([
      fetch(`/api/lms/tenants/${myTenant.id}/courses/${courseId}/lessons`, { headers: authHeaders }),
      fetch(`/api/lms/tenants/${myTenant.id}/batches`, { headers: authHeaders }),
    ]);
    const lessonData = await lessonRes.json();
    const batchData = await batchRes.json();
    setLessons(lessonData.data ?? []);
    setBatches(batchData.data ?? []);
    setLoading(false);
  }, [tenantSlug, courseId, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    const body = {
      title: lessonForm.title,
      content: lessonForm.content || undefined,
      videoUrl: lessonForm.videoUrl || undefined,
      durationMins: lessonForm.durationMins ? Number(lessonForm.durationMins) : undefined,
      sortOrder: lessons.length,
    };
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    const res = await fetch(`/api/lms/tenants/${tenantId}/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) { setLessonForm({ title: "", content: "", videoUrl: "", durationMins: "" }); fetchData(); }
  }

  async function deleteLesson(lessonId: string) {
    if (!tenantId || !confirm("Hapus pelajaran ini?")) return;
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    await fetch(`/api/lms/tenants/${tenantId}/courses/${courseId}/lessons/${lessonId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  }

  async function assignToBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !assignBatchId) return;
    setAssigning(true);
    const token = await getValidToken();
    if (!token) { router.replace("/masuk"); return; }
    await fetch(`/api/lms/tenants/${tenantId}/courses/${courseId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ batchId: assignBatchId, isMandatory: true }),
    });
    setAssigning(false);
    alert("Kursus berhasil ditugaskan ke batch.");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#6E6E73] mb-4">
        <Link href={`/lms/${tenantSlug}/admin/courses`} className="hover:text-[#0077A8]">Kursus</Link>
        <span>/</span>
        <span className="text-[#1D1D1F]">Edit Materi</span>
      </div>

      <h1 className="text-xl font-bold text-[#1D1D1F] mb-6">Course Builder</h1>

      {loading ? (
        <div className="text-center py-8 text-[#6E6E73]">Memuat...</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5">
            <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Daftar Pelajaran ({lessons.length})</h2>
            {lessons.length === 0 ? (
              <p className="text-sm text-[#6E6E73]">Belum ada pelajaran. Tambah pelajaran di bawah.</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((l, i) => (
                  <div key={l.id} className="flex items-center gap-3 p-3 bg-[#F5F5F7] rounded-xl">
                    <span className="text-xs font-bold text-[#6E6E73] w-6 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#1D1D1F]">{l.title}</div>
                      <div className="text-xs text-[#6E6E73]">
                        {l.durationMins ? `${l.durationMins} menit · ` : ""}
                        {l._count.quizzes} kuis
                        {l.videoUrl && " · ada video"}
                      </div>
                    </div>
                    <button onClick={() => deleteLesson(l.id)} className="text-xs text-red-500 hover:underline">Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5">
            <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Tambah Pelajaran</h2>
            <form onSubmit={addLesson} className="space-y-3">
              <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Judul pelajaran" className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" required />
              <textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="Konten teks (markdown/HTML)" rows={3} className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="URL video (opsional)" className="border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" />
                <input type="number" value={lessonForm.durationMins} onChange={(e) => setLessonForm({ ...lessonForm, durationMins: e.target.value })} placeholder="Durasi (menit)" className="border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87]">
                + Tambah Pelajaran
              </button>
            </form>
          </div>

          {batches.length > 0 && (
            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5">
              <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Tugaskan ke Batch</h2>
              <form onSubmit={assignToBatch} className="flex gap-3">
                <select value={assignBatchId} onChange={(e) => setAssignBatchId(e.target.value)} className="flex-1 border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" required>
                  <option value="">Pilih batch</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button type="submit" disabled={assigning} className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87] disabled:opacity-50">
                  {assigning ? "Menugaskan..." : "Tugaskan"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
