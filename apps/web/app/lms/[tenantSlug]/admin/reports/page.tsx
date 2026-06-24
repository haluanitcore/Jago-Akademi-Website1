"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type ReportRow = {
  userId: string;
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  completionPct: number;
  isCompleted: boolean;
  completedAt: string | null;
  enrolledAt: string;
};

type Batch = { id: string; name: string };

export default function LmsAdminReportsPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const meRes = await fetch("/api/lms/portal/me");
    const meData = await meRes.json();
    const myTenant = meData.data?.find((t: { slug: string; id: string }) => t.slug === tenantSlug);
    if (!myTenant) return;
    setTenantId(myTenant.id);

    const [reportRes, batchRes] = await Promise.all([
      fetch(`/api/lms/tenants/${myTenant.id}/reports/completion${selectedBatch ? `?batchId=${selectedBatch}` : ""}`),
      fetch(`/api/lms/tenants/${myTenant.id}/batches`),
    ]);
    const reportData = await reportRes.json();
    const batchData = await batchRes.json();
    setRows(reportData.data ?? []);
    setBatches(batchData.data ?? []);
    setLoading(false);
  }, [tenantSlug, selectedBatch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalEnrollments = rows.length;
  const completedCount = rows.filter((r) => r.isCompleted).length;
  const avgPct = rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.completionPct, 0) / rows.length) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#6E6E73] mb-4">
        <Link href={`/lms/${tenantSlug}/admin`} className="hover:text-[#0077A8]">Admin</Link>
        <span>/</span>
        <span className="text-[#1D1D1F]">Laporan</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#1D1D1F]">Laporan Completion</h1>
        <div className="flex gap-2">
          <a
            href={tenantId ? `/api/lms/tenants/${tenantId}/reports/completion/csv` : "#"}
            className="px-3 py-2 text-xs text-[#0077A8] border border-[#0077A8] rounded-xl hover:bg-[#E8F4F9]"
          >
            Unduh CSV
          </a>
          <a
            href={tenantId ? `/api/lms/tenants/${tenantId}/reports/completion/pdf` : "#"}
            className="px-3 py-2 text-xs text-white bg-[#0077A8] rounded-xl hover:bg-[#005f87]"
          >
            Unduh PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Enrollment", value: totalEnrollments },
          { label: "Selesai", value: completedCount },
          { label: "Rata-rata Progress", value: `${avgPct}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E5E5EA] rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-[#1D1D1F]">{value}</div>
            <div className="text-xs text-[#6E6E73] mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-3">
        <select
          value={selectedBatch}
          onChange={(e) => { setSelectedBatch(e.target.value); setLoading(true); }}
          className="border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Semua Batch</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#6E6E73]">Memuat...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-[#6E6E73]">Tidak ada data.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F7] text-[#6E6E73]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User ID</th>
                <th className="px-4 py-3 text-left font-medium">Kursus</th>
                <th className="px-4 py-3 text-center font-medium">Progress</th>
                <th className="px-4 py-3 text-center font-medium">Selesai</th>
                <th className="px-4 py-3 text-left font-medium">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7]">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-[#F5F5F7]">
                  <td className="px-4 py-3 font-mono text-xs text-[#6E6E73]">{r.userId.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-[#1D1D1F]">{r.courseTitle}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#E5E5EA] rounded-full h-1.5">
                        <div className="bg-[#0077A8] h-1.5 rounded-full" style={{ width: `${r.completionPct}%` }} />
                      </div>
                      <span className="text-xs text-[#6E6E73] w-10 text-right">{r.completionPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${r.isCompleted ? "bg-green-100 text-green-700" : "bg-[#F5F5F7] text-[#6E6E73]"}`}>
                      {r.isCompleted ? "Ya" : "Belum"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6E6E73]">
                    {new Date(r.enrolledAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
