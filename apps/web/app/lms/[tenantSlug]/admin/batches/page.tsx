"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Batch = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  _count: { members: number; assignments: number };
};

export default function LmsAdminBatchesPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteBatchId, setInviteBatchId] = useState("");
  const [inviting, setInviting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const tenantRes = await fetch(`/api/lms/tenants?slug=${tenantSlug}`).catch(() => null);
    const tenantDetail = await fetch(`/api/lms/portal/me`);
    const meData = await tenantDetail.json();
    const myTenant = meData.data?.find((t: { slug: string; id: string }) => t.slug === tenantSlug);
    if (!myTenant) { setLoading(false); return; }
    setTenantId(myTenant.id);
    const batchRes = await fetch(`/api/lms/tenants/${myTenant.id}/batches`);
    const batchData = await batchRes.json();
    setBatches(batchData.data ?? []);
    setLoading(false);
  }, [tenantSlug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function createBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    const res = await fetch(`/api/lms/tenants/${tenantId}/batches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); setForm({ name: "", description: "" }); fetchData(); }
  }

  async function sendInvites(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !inviteEmails.trim()) return;
    setInviting(true);
    const emails = inviteEmails.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);
    const res = await fetch(`/api/lms/tenants/${tenantId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails, batchId: inviteBatchId || undefined }),
    });
    const data = await res.json();
    setInviting(false);
    if (data.success) { alert(`Undangan terkirim: ${data.data.created.length}, dilewati: ${data.data.skipped.length}`); setInviteEmails(""); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#6E6E73] mb-4">
        <Link href={`/lms/${tenantSlug}/admin`} className="hover:text-[#0077A8]">Admin</Link>
        <span>/</span>
        <span className="text-[#1D1D1F]">Batch</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#1D1D1F]">Manajemen Batch</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87]">
          + Batch Baru
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Buat Batch Baru</h2>
            <form onSubmit={createBatch} className="space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama batch (cth: Angkatan 2025)" className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" required />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi (opsional)" rows={3} className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm" />
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
      ) : (
        <div className="space-y-3 mb-8">
          {batches.map((b) => (
            <div key={b.id} className="bg-white border border-[#E5E5EA] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-[#1D1D1F]">{b.name}</div>
                {b.description && <div className="text-xs text-[#6E6E73] mt-0.5">{b.description}</div>}
                <div className="text-xs text-[#6E6E73] mt-1">
                  {b._count.members} anggota · {b._count.assignments} kursus
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${b.isActive ? "bg-green-100 text-green-700" : "bg-[#F5F5F7] text-[#6E6E73]"}`}>
                  {b.isActive ? "Aktif" : "Nonaktif"}
                </span>
                <button onClick={() => setInviteBatchId(b.id)} className="text-xs text-[#0077A8] hover:underline">Undang</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Undang Peserta</h2>
        <form onSubmit={sendInvites} className="space-y-3">
          {batches.length > 0 && (
            <select value={inviteBatchId} onChange={(e) => setInviteBatchId(e.target.value)} className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm">
              <option value="">Tanpa batch (opsional)</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <textarea
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
            placeholder={"Masukkan email (satu per baris atau dipisah koma):\nuser1@contoh.com\nuser2@contoh.com"}
            rows={5}
            className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm font-mono"
          />
          <button type="submit" disabled={inviting} className="w-full py-2 bg-[#0077A8] text-white text-sm rounded-xl hover:bg-[#005f87] disabled:opacity-50">
            {inviting ? "Mengirim undangan..." : "Kirim Undangan"}
          </button>
        </form>
      </div>
    </div>
  );
}
