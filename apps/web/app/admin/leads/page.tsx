"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, Download } from "lucide-react";
import { getToken } from "@/lib/auth/token";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Meta = { total: number; page: number; limit: number };

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCES = [
  { value: "", label: "Semua Sumber" },
  { value: "lms", label: "LMS B2B" },
  { value: "affiliate", label: "Afiliasi" },
  { value: "trainer", label: "Trainer" },
  { value: "free-class", label: "Kelas Gratis" },
  { value: "other", label: "Lainnya" },
] as const;

const STATUSES = [
  { value: "", label: "Semua Status" },
  { value: "new", label: "Baru" },
  { value: "contacted", label: "Dihubungi" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Konversi" },
  { value: "archived", label: "Arsip" },
] as const;

const SOURCE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  lms:        { bg: "rgba(0,119,168,0.1)",    text: "#0077A8", label: "LMS B2B" },
  affiliate:  { bg: "rgba(124,58,237,0.1)",   text: "#7C3AED", label: "Afiliasi" },
  trainer:    { bg: "rgba(234,179,8,0.12)",   text: "#A16207", label: "Trainer" },
  "free-class": { bg: "rgba(22,163,74,0.1)", text: "#15803D", label: "Kelas Gratis" },
  other:      { bg: "rgba(107,114,128,0.1)",  text: "#6B7280", label: "Lainnya" },
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  new:       { bg: "rgba(59,130,246,0.1)",   text: "#2563EB", label: "Baru" },
  contacted: { bg: "rgba(234,179,8,0.12)",   text: "#A16207", label: "Dihubungi" },
  qualified: { bg: "rgba(124,58,237,0.1)",   text: "#7C3AED", label: "Qualified" },
  converted: { bg: "rgba(22,163,74,0.1)",    text: "#15803D", label: "Konversi" },
  archived:  { bg: "rgba(107,114,128,0.1)",  text: "#6B7280", label: "Arsip" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────


function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Secure CSV export using backend API (verifies transaction/role)

// ─── Status select ────────────────────────────────────────────────────────────

function StatusSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const s = STATUS_STYLE[value] ?? STATUS_STYLE["new"]!;

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setBusy(true);
    const token = getToken();
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ status: next }),
      });
      onChange(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={busy}
      className="rounded-lg border-0 px-2 py-1 text-xs font-semibold cursor-pointer transition-opacity"
      style={{ background: s.bg, color: s.text, opacity: busy ? 0.5 : 1, outline: "none" }}
      aria-label="Ubah status lead"
    >
      {STATUSES.filter((s) => s.value !== "").map((st) => (
        <option key={st.value} value={st.value}>{st.label}</option>
      ))}
    </select>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleExportCSV() {
    const token = getToken();
    if (!token) return;
    setExporting(true);
    try {
      const res = await fetch("/api/admin/leads/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengunduh CSV");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengekspor data leads.");
    } finally {
      setExporting(false);
    }
  }

  const fetchLeads = useCallback((q: string, src: string, sts: string, pg: number) => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    const qs = new URLSearchParams({ page: String(pg), limit: "20" });
    if (q) qs.set("q", q);
    if (src) qs.set("source", src);
    if (sts) qs.set("status", sts);

    fetch(`/api/admin/leads?${qs}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setLeads(body.data ?? []);
          setMeta(body.meta ?? { total: 0, page: pg, limit: 20 });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeads(query, source, status, page); }, []); // eslint-disable-line

  function handleSearch(q: string) {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchLeads(q, source, status, 1); }, 350);
  }

  function handleSource(src: string) {
    setSource(src);
    setPage(1);
    fetchLeads(query, src, status, 1);
  }

  function handleStatus(sts: string) {
    setStatus(sts);
    setPage(1);
    fetchLeads(query, source, sts, 1);
  }

  function handlePage(p: number) {
    setPage(p);
    fetchLeads(query, source, status, p);
  }

  function handleStatusChange(id: string, next: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: next } : l));
  }

  const totalPages = Math.ceil(meta.total / meta.limit);

  // Metrics
  const counts = STATUSES.filter((s) => s.value).reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = leads.filter((l) => l.status === s.value).length;
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1D1D1F" }}>Leads CRM</h1>
          <p style={{ fontSize: 13, color: "#6E6E73", marginTop: 3 }}>
            {meta.total.toLocaleString("id-ID")} leads dari semua landing page
          </p>
        </div>
        <button
          id="leads-export-csv-btn"
          onClick={handleExportCSV}
          disabled={exporting}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 10,
            background: "white", border: "1.5px solid #E5E5EA",
            fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1D1D1F",
            opacity: exporting ? 0.6 : 1,
          }}
        >
          <Download size={15} aria-hidden="true" />
          {exporting ? "Mengekspor..." : "Export CSV"}
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
        {STATUSES.filter((s) => s.value).map((s) => {
          const st = STATUS_STYLE[s.value]!;
          return (
            <button
              id={`leads-filter-status-${s.value}-btn`}
              key={s.value}
              onClick={() => handleStatus(status === s.value ? "" : s.value)}
              style={{
                background: status === s.value ? st.bg : "white",
                border: `1.5px solid ${status === s.value ? st.text : "#E5E5EA"}`,
                borderRadius: 14, padding: "14px 12px",
                textAlign: "left", cursor: "pointer", transition: "all 0.18s",
              }}
            >
              <p style={{ fontSize: 20, fontWeight: 800, color: st.text }}>
                {counts[s.value] ?? 0}
              </p>
              <p style={{ fontSize: 11, color: "#6E6E73", marginTop: 2 }}>{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} aria-hidden="true" />
          <input
            id="leads-search-input"
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari nama / email / perusahaan…"
            style={{
              width: "100%", padding: "8px 32px 8px 32px",
              borderRadius: 10, border: "1.5px solid #E5E5EA",
              fontSize: 13, outline: "none", background: "white",
            }}
            aria-label="Cari lead"
          />
          {query && (
            <button
              id="leads-search-clear-btn"
              onClick={() => handleSearch("")}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}
              aria-label="Hapus pencarian"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Source pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SOURCES.map((s) => {
            const active = source === s.value;
            const style = s.value ? SOURCE_STYLE[s.value] : null;
            return (
              <button
                id={`leads-source-${s.value || "all"}-btn`}
                key={s.value}
                onClick={() => handleSource(s.value)}
                style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.18s",
                  background: active ? (style?.bg ?? "#E5E5EA") : "#F5F5F7",
                  color: active ? (style?.text ?? "#1D1D1F") : "#6E6E73",
                }}
                aria-pressed={active}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <span style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #0077A8", borderTopColor: "transparent", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : leads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 16, border: "1px solid #E5E5EA" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
          <p style={{ fontSize: 15, color: "#1D1D1F", fontWeight: 600, marginBottom: 4 }}>Tidak ada leads ditemukan</p>
          <p style={{ fontSize: 13, color: "#6E6E73" }}>
            {query || source || status ? "Coba ubah filter atau hapus pencarian." : "Leads akan muncul di sini saat ada yang mengisi form di landing page."}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #E5E5EA", background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E5EA", background: "#F9FAFB" }}>
                {["Nama & Email", "Perusahaan", "Telepon", "Sumber", "Status", "Tanggal"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#6E6E73", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => {
                const src = SOURCE_STYLE[lead.source] ?? SOURCE_STYLE["other"]!;
                return (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: i < leads.length - 1 ? "1px solid #F3F4F6" : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <p style={{ fontWeight: 600, color: "#1D1D1F" }}>{lead.name}</p>
                      <p style={{ color: "#6E6E73", marginTop: 1, fontSize: 12 }}>{lead.email}</p>
                      {lead.message && (
                        <p style={{ color: "#9CA3AF", marginTop: 3, fontSize: 11, maxWidth: 240, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {lead.message}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{lead.company ?? "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#374151", fontFamily: "monospace", fontSize: 12 }}>{lead.phone ?? "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: src.bg, color: src.text, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                        {src.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusSelect id={lead.id} value={lead.status} onChange={(v) => handleStatusChange(lead.id, v)} />
                    </td>
                    <td style={{ padding: "12px 14px", color: "#9CA3AF", fontSize: 12, whiteSpace: "nowrap" }}>
                      {fmtDate(lead.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <button
            id="leads-prev-page-btn"
            onClick={() => handlePage(page - 1)}
            disabled={page <= 1}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #E5E5EA", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: page <= 1 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 13, color: "#6E6E73" }}>
            {page} / {totalPages} ({meta.total.toLocaleString("id-ID")} leads)
          </span>
          <button
            id="leads-next-page-btn"
            onClick={() => handlePage(page + 1)}
            disabled={page >= totalPages}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #E5E5EA", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: page >= totalPages ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
