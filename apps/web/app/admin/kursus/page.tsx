"use client";

import { useEffect, useState } from "react";
import { getValidToken } from "@/lib/auth/token";

type Course = {
  id: string;
  title: string;
  slug: string;
  status: string;
  level: string | null;
  price: string;
  salePrice: string | null;
  totalEnrolled: number;
  avgRating: string;
  isFeatured: boolean;
  format?: "regular" | "private_class";
  publishedAt: string | null;
  createdAt: string;
  trainer: { id: string; name: string; email: string };
  category: { name: string } | null;
  _count?: { sections: number };
};

// Shape returned by GET /api/admin/courses/:id (Prisma include: sections → lessons).
type DetailLesson = {
  id: string;
  title: string;
  type: string;
  contentUrl: string | null;
  duration: number;
};

type DetailSection = {
  id: string;
  title: string;
  lessons?: DetailLesson[];
};

type CourseDetail = {
  id: string;
  title: string;
  level: string | null;
  price: string;
  previewVideo: string | null;
  adminFeedback: string | null;
  format?: "regular" | "private_class";
  waGroupLink?: string | null;
  onboardingContact?: string | null;
  trainer: { id: string; name: string; email: string };
  category: { id: string; name: string } | null;
  sections?: DetailSection[];
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-600" },
  pending:   { label: "Review",    cls: "bg-yellow-100 text-yellow-700" },
  published: { label: "Aktif",     cls: "bg-green-100 text-green-700" },
  rejected:  { label: "Ditolak",   cls: "bg-red-100 text-red-700" },
  archived:  { label: "Arsip",     cls: "bg-gray-100 text-gray-500" },
};

const LEVEL_LABEL: Record<string, string> = {
  beginner:     "🟢 Pemula",
  intermediate: "🟡 Menengah",
  advanced:     "🔴 Mahir",
};


export default function AdminKursusPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 10;

  // Modal states
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [detailCourse, setDetailCourse] = useState<CourseDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [savingApproval, setSavingApproval] = useState(false);

  // Private Class settings (format / WA group / onboarding contact)
  const [pcFormat, setPcFormat] = useState<"regular" | "private_class">("regular");
  const [pcWaLink, setPcWaLink] = useState("");
  const [pcContact, setPcContact] = useState("");
  const [savingPrivate, setSavingPrivate] = useState(false);

  async function openDetailModal(courseId: string) {
    setSelectedCourseId(courseId);
    setModalLoading(true);
    setDetailCourse(null);
    setFeedbackText("");
    const token = await getValidToken();
    if (!token) return;
    try {
      const r = await fetch(`/api/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await r.json();
      if (body.success) {
        setDetailCourse(body.data);
        setFeedbackText(body.data.adminFeedback ?? "");
        setPcFormat(body.data.format === "private_class" ? "private_class" : "regular");
        setPcWaLink(body.data.waGroupLink ?? "");
        setPcContact(body.data.onboardingContact ?? "");
      } else {
        alert(body.error?.message ?? "Gagal memuat detail kursus.");
        setSelectedCourseId(null);
      }
    } catch {
      alert("Gagal memuat detail kursus.");
      setSelectedCourseId(null);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleApproveDetail() {
    if (!selectedCourseId) return;
    setSavingApproval(true);
    const token = await getValidToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      const body = await res.json();
      if (body.success) {
        alert("Kursus berhasil disetujui & dipublikasikan.");
        setSelectedCourseId(null);
        loadCourses();
      } else {
        alert(body.error?.message ?? "Gagal menyetujui.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setSavingApproval(false);
    }
  }

  async function handleRejectDetail() {
    if (!selectedCourseId) return;
    if (!feedbackText.trim()) {
      alert("Silakan masukkan alasan/umpan balik penolakan kelas.");
      return;
    }
    setSavingApproval(true);
    const token = await getValidToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", adminFeedback: feedbackText }),
      });
      const body = await res.json();
      if (body.success) {
        alert("Kursus ditolak & umpan balik berhasil dikirim ke trainer.");
        setSelectedCourseId(null);
        loadCourses();
      } else {
        alert(body.error?.message ?? "Gagal menolak.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setSavingApproval(false);
    }
  }

  async function handleSavePrivateClass() {
    if (!selectedCourseId) return;
    const waLink = pcWaLink.trim();
    const contact = pcContact.trim();
    // Mirror server-side Zod rules before sending.
    if (waLink && !waLink.startsWith("https://")) {
      alert("Link grup WhatsApp harus diawali https://");
      return;
    }
    if (contact && !/^\d{8,15}$/.test(contact)) {
      alert("Kontak onboarding harus berupa angka saja (8-15 digit), contoh: 6285283423737");
      return;
    }
    setSavingPrivate(true);
    const token = await getValidToken();
    if (!token) {
      setSavingPrivate(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          format: pcFormat,
          waGroupLink: waLink || null,
          onboardingContact: contact || null,
        }),
      });
      const body = await res.json();
      if (body.success) {
        alert("Pengaturan Private Class berhasil disimpan.");
        loadCourses();
      } else {
        alert(body.error?.message ?? "Gagal menyimpan pengaturan Private Class.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setSavingPrivate(false);
    }
  }

  async function loadCourses() {
    const token = await getValidToken();
    if (!token) return;
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search ? { search } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });
    setLoading(true);
    fetch(`/api/admin/courses?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setCourses(body.data?.courses ?? body.data ?? []);
          setTotal(body.data?.total ?? body.data?.length ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadCourses(); }, [page, statusFilter]); // eslint-disable-line

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); loadCourses(); }

  async function updateStatus(courseId: string, newStatus: string) {
    const token = await getValidToken();
    if (!token) return;
    setActionLoading(courseId + newStatus);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setActionLoading(null);
    loadCourses();
  }

  async function toggleFeatured(courseId: string, current: boolean) {
    const token = await getValidToken();
    if (!token) return;
    setActionLoading(courseId + "feat");
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !current }),
    });
    setActionLoading(null);
    loadCourses();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="ak-page">
      {/* Header */}
      <div className="ak-header">
        <div>
          <h1 className="ak-title">Manajemen Kursus</h1>
          <p className="ak-sub">{total.toLocaleString("id-ID")} kursus total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="ak-filters">
        <form onSubmit={handleSearch} className="ak-search-form">
          <input className="ak-search-input" placeholder="Cari judul kursus atau trainer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="ak-search-btn">🔍 Cari</button>
        </form>
        <div className="ak-status-tabs">
          {["all", "pending", "published", "draft", "rejected", "archived"].map((s) => {
            const info = STATUS_MAP[s];
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`ak-status-tab ${statusFilter === s ? "ak-tab-active" : ""}`}>
                {s === "all" ? "Semua" : info?.label ?? s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="ak-table-wrap">
        {loading ? (
          <div className="ak-loading"><span className="ak-spinner" /></div>
        ) : courses.length === 0 ? (
          <div className="ak-empty"><p>📖</p><p>Tidak ada kursus ditemukan</p></div>
        ) : (
          <table className="ak-table">
            <thead>
              <tr>
                <th>Kursus</th>
                <th>Trainer</th>
                <th>Status</th>
                <th>Level</th>
                <th>Harga</th>
                <th>Pendaftar</th>
                <th>Rating</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const status = STATUS_MAP[c.status] ?? STATUS_MAP["draft"]!;
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="ak-course-cell">
                        <div>
                          <p className="ak-course-title">
                            {c.title}
                            {c.isFeatured && <span className="ak-featured-badge">⭐ Unggulan</span>}
                            {c.format === "private_class" && <span className="ak-private-badge">🔒 Private Class</span>}
                          </p>
                          <p className="ak-course-cat">{c.category?.name ?? "Umum"} · {c._count?.sections ?? 0} bab</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="ak-trainer-name">{c.trainer.name}</p>
                      <p className="ak-trainer-email">{c.trainer.email}</p>
                    </td>
                    <td>
                      <span className={`ak-badge ${status.cls}`}>{status.label}</span>
                    </td>
                    <td>
                      <span className="ak-level">{LEVEL_LABEL[c.level ?? ""] ?? "—"}</span>
                    </td>
                    <td>
                      <div>
                        {c.salePrice && Number(c.salePrice) < Number(c.price) ? (
                          <>
                            <p className="ak-sale-price">Rp {Number(c.salePrice).toLocaleString("id-ID")}</p>
                            <p className="ak-orig-price">Rp {Number(c.price).toLocaleString("id-ID")}</p>
                          </>
                        ) : (
                          <p className="ak-price">
                            {Number(c.price) === 0 ? "Gratis" : `Rp ${Number(c.price).toLocaleString("id-ID")}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td><span className="ak-enrolled">🎓 {c.totalEnrolled}</span></td>
                    <td><span className="ak-rating">⭐ {parseFloat(c.avgRating).toFixed(1)}</span></td>
                    <td>
                      <div className="ak-actions">
                        <button
                          className="ak-btn ak-btn-detail"
                          onClick={() => openDetailModal(c.id)}
                          disabled={actionLoading !== null}
                        >
                          👁️ Detail & Review
                        </button>
                        {c.status === "pending" && (
                          <>
                            <button
                              className="ak-btn ak-btn-approve"
                              onClick={() => updateStatus(c.id, "published")}
                              disabled={actionLoading !== null}
                            >✓ Approve</button>
                            <button
                              className="ak-btn ak-btn-reject"
                              onClick={() => openDetailModal(c.id)}
                              disabled={actionLoading !== null}
                            >✕ Tolak</button>
                          </>
                        )}
                        {c.status === "published" && (
                          <button
                            className="ak-btn ak-btn-archive"
                            onClick={() => updateStatus(c.id, "archived")}
                            disabled={actionLoading !== null}
                          >Arsip</button>
                        )}
                        {(c.status === "rejected" || c.status === "archived") && (
                          <button
                            className="ak-btn ak-btn-approve"
                            onClick={() => updateStatus(c.id, "published")}
                            disabled={actionLoading !== null}
                          >Aktifkan</button>
                        )}
                        <button
                          className={`ak-btn ${c.isFeatured ? "ak-btn-unfeat" : "ak-btn-feat"}`}
                          onClick={() => toggleFeatured(c.id, c.isFeatured)}
                          disabled={actionLoading !== null}
                          title={c.isFeatured ? "Hapus dari unggulan" : "Jadikan unggulan"}
                        >
                          {c.isFeatured ? "☆" : "⭐"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ak-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="ak-page-btn">← Prev</button>
          <span className="ak-page-info">Halaman {page} dari {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ak-page-btn">Next →</button>
        </div>
      )}

      {/* Review Modal */}
      {selectedCourseId && (
        <div className="ak-modal-overlay" onClick={() => setSelectedCourseId(null)}>
          <div className="ak-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ak-modal-header">
              <h2 className="ak-modal-title">Review & Approval Kursus</h2>
              <button className="ak-modal-close" onClick={() => setSelectedCourseId(null)}>✕</button>
            </div>
            
            {modalLoading ? (
              <div className="ak-modal-loading"><span className="ak-spinner" /></div>
            ) : !detailCourse ? (
              <div className="ak-modal-empty">Gagal memuat detail kursus.</div>
            ) : (
              <div className="ak-modal-body">
                {/* Course Metadata */}
                <div className="ak-detail-grid">
                  <div className="ak-detail-card">
                    <span className="ak-detail-label">Judul Kursus</span>
                    <span className="ak-detail-val">{detailCourse.title}</span>
                  </div>
                  <div className="ak-detail-card">
                    <span className="ak-detail-label">Trainer</span>
                    <span className="ak-detail-val">{detailCourse.trainer.name} ({detailCourse.trainer.email})</span>
                  </div>
                  <div className="ak-detail-card">
                    <span className="ak-detail-label">Kategori / Level</span>
                    <span className="ak-detail-val">{detailCourse.category?.name ?? "Umum"} · {LEVEL_LABEL[detailCourse.level ?? ""] ?? "—"}</span>
                  </div>
                  <div className="ak-detail-card">
                    <span className="ak-detail-label">Harga Kelas</span>
                    <span className="ak-detail-val">
                      {Number(detailCourse.price) === 0 ? "Gratis" : `Rp ${Number(detailCourse.price).toLocaleString("id-ID")}`}
                    </span>
                  </div>
                </div>

                {/* Course Video Preview */}
                {detailCourse.previewVideo && (
                  <div className="ak-preview-section">
                    <h3 className="ak-section-title">Video Pengantar / Preview</h3>
                    <div className="ak-video-wrap">
                      <a href={detailCourse.previewVideo} target="_blank" rel="noopener noreferrer" className="ak-video-link">
                        📺 Putar Video Preview ({detailCourse.previewVideo})
                      </a>
                    </div>
                  </div>
                )}

                {/* Course Structure */}
                <div className="ak-structure-section">
                  <h3 className="ak-section-title">Struktur Kurikulum ({detailCourse.sections?.length ?? 0} Bab)</h3>
                  {(!detailCourse.sections || detailCourse.sections.length === 0) ? (
                    <p className="ak-no-curriculum">Belum ada materi kurikulum yang ditambahkan.</p>
                  ) : (
                    <div className="ak-sections-list">
                      {detailCourse.sections.map((sec, idx) => (
                        <div key={sec.id} className="ak-section-item">
                          <div className="ak-section-hdr">
                            Bab {idx + 1}: {sec.title}
                          </div>
                          <ul className="ak-lessons-list">
                            {sec.lessons?.map((les) => (
                              <li key={les.id} className="ak-lesson-item">
                                <span className="ak-les-type">{les.type === "video" ? "📹" : "📄"}</span>
                                <span className="ak-les-title">{les.title}</span>
                                <span className="ak-les-dur">{les.duration ? `${Math.round(les.duration / 60)} m` : ""}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Private Class Settings */}
                <div className="ak-private-section">
                  <h3 className="ak-section-title">Pengaturan Private Class</h3>
                  <div className="ak-private-fields">
                    <label className="ak-private-field">
                      <span className="ak-private-label">Format Kursus</span>
                      <select
                        className="ak-private-input"
                        value={pcFormat}
                        onChange={(e) => setPcFormat(e.target.value === "private_class" ? "private_class" : "regular")}
                      >
                        <option value="regular">Reguler</option>
                        <option value="private_class">Private Class</option>
                      </select>
                    </label>
                    <label className="ak-private-field">
                      <span className="ak-private-label">Link Grup WhatsApp</span>
                      <input
                        className="ak-private-input"
                        type="text"
                        placeholder="https://chat.whatsapp.com/..."
                        value={pcWaLink}
                        onChange={(e) => setPcWaLink(e.target.value)}
                      />
                    </label>
                    <label className="ak-private-field">
                      <span className="ak-private-label">Kontak Onboarding (nomor WA, angka saja)</span>
                      <input
                        className="ak-private-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="6285283423737"
                        value={pcContact}
                        onChange={(e) => setPcContact(e.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    className="ak-btn ak-btn-save-private"
                    onClick={handleSavePrivateClass}
                    disabled={savingPrivate || savingApproval}
                  >
                    {savingPrivate ? "Menyimpan..." : "💾 Simpan Pengaturan"}
                  </button>
                </div>

                {/* Feedback Input Form */}
                <div className="ak-feedback-section">
                  <h3 className="ak-section-title">Catatan & Umpan Balik Admin (Wajib jika menolak)</h3>
                  <textarea
                    className="ak-feedback-input"
                    rows={4}
                    placeholder="Tulis umpan balik kelas di sini... (contoh: Silakan lengkapi video pada Bab 2, resolusi audio kurang jernih, dll.)"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>

                {/* Footer Actions */}
                <div className="ak-modal-footer">
                  <button className="ak-btn ak-btn-cancel" onClick={() => setSelectedCourseId(null)} disabled={savingApproval}>
                    Batal
                  </button>
                  <div className="ak-modal-actions">
                    <button
                      className="ak-btn ak-btn-modal-reject"
                      onClick={handleRejectDetail}
                      disabled={savingApproval}
                    >
                      {savingApproval ? "Memproses..." : "✕ Tolak & Kirim Feedback"}
                    </button>
                    <button
                      className="ak-btn ak-btn-modal-approve"
                      onClick={handleApproveDetail}
                      disabled={savingApproval}
                    >
                      {savingApproval ? "Memproses..." : "✓ Setujui & Publikasikan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .ak-page { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; }
        .ak-header { display: flex; align-items: center; justify-content: space-between; }
        .ak-title { font-size: 20px; font-weight: 800; color: #1D1D1F; }
        .ak-sub { font-size: 13px; color: #6E6E73; margin-top: 3px; }

        .ak-filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ak-search-form { display: flex; gap: 8px; flex: 1; min-width: 240px; }
        .ak-search-input { flex: 1; padding: 9px 14px; border-radius: 10px; border: 1.5px solid #E5E5EA; font-size: 13px; outline: none; }
        .ak-search-input:focus { border-color: #0077A8; box-shadow: 0 0 0 3px rgba(0,119,168,0.1); }
        .ak-search-btn { padding: 9px 16px; border-radius: 10px; background: #0077A8; color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer; }
        .ak-search-btn:hover { background: #005f87; }

        .ak-status-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .ak-status-tab { padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1.5px solid #E5E5EA; background: white; cursor: pointer; color: #6E6E73; transition: all 0.18s; }
        .ak-tab-active { background: #0077A8; color: white; border-color: #0077A8; }

        .ak-table-wrap { background: white; border-radius: 18px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow-x: auto; }
        .ak-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .ak-table thead tr { background: #F9FAFB; border-bottom: 1px solid #F0F0F5; }
        .ak-table th { padding: 12px 14px; font-size: 11px; font-weight: 700; color: #6E6E73; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap; }
        .ak-table td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #F5F5F7; vertical-align: middle; }
        .ak-table tr:last-child td { border-bottom: none; }
        .ak-table tr:hover td { background: #FAFAFA; }

        .ak-course-cell { display: flex; align-items: flex-start; gap: 10px; }
        .ak-course-title { font-size: 13px; font-weight: 600; color: #1D1D1F; max-width: 200px; line-height: 1.3; }
        .ak-featured-badge { font-size: 9px; background: #FEF3C7; color: #D97706; padding: 2px 6px; border-radius: 999px; margin-left: 4px; font-weight: 700; }
        .ak-private-badge { font-size: 9px; background: #EDE9FE; color: #7C3AED; padding: 2px 6px; border-radius: 999px; margin-left: 4px; font-weight: 700; white-space: nowrap; }
        .ak-course-cat { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
        .ak-trainer-name { font-size: 13px; font-weight: 500; }
        .ak-trainer-email { font-size: 11px; color: #9CA3AF; }
        .ak-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; display: inline-block; }
        .ak-level { font-size: 12px; }
        .ak-price { font-size: 13px; font-weight: 600; color: #1D1D1F; }
        .ak-sale-price { font-size: 13px; font-weight: 700; color: #0077A8; }
        .ak-orig-price { font-size: 10px; color: #9CA3AF; text-decoration: line-through; }
        .ak-enrolled { font-size: 12px; font-weight: 600; color: #059669; }
        .ak-rating { font-size: 12px; font-weight: 600; color: #D97706; }

        .ak-actions { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
        .ak-btn { padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
        .ak-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ak-btn-approve { background: #DCFCE7; color: #16A34A; }
        .ak-btn-approve:hover:not(:disabled) { background: #16A34A; color: white; }
        .ak-btn-reject { background: #FEE2E2; color: #DC2626; }
        .ak-btn-reject:hover:not(:disabled) { background: #DC2626; color: white; }
        .ak-btn-archive { background: #F3F4F6; color: #6B7280; }
        .ak-btn-archive:hover:not(:disabled) { background: #6B7280; color: white; }
        .ak-btn-feat { background: #FEF3C7; color: #D97706; font-size: 14px; padding: 4px 8px; }
        .ak-btn-unfeat { background: #F3F4F6; color: #9CA3AF; font-size: 14px; padding: 4px 8px; }

        .ak-btn-detail { background: #E5F3FF; color: #0077A8; }
        .ak-btn-detail:hover:not(:disabled) { background: #0077A8; color: white; }

        .ak-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .ak-modal { background: white; border-radius: 20px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.15); animation: scaleUp 0.2s ease-out; text-align: left; }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .ak-modal-header { padding: 18px 24px; border-bottom: 1px solid #F0F0F5; display: flex; justify-content: space-between; align-items: center; }
        .ak-modal-title { font-size: 16px; font-weight: 700; color: #1D1D1F; }
        .ak-modal-close { background: none; border: none; font-size: 18px; color: #6E6E73; cursor: pointer; padding: 4px; }
        .ak-modal-close:hover { color: #1D1D1F; }

        .ak-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .ak-modal-loading { display: flex; justify-content: center; padding: 60px 0; }
        .ak-modal-empty { text-align: center; color: #9CA3AF; padding: 40px 0; }

        .ak-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ak-detail-card { background: #F9FAFB; border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 4px; border: 1px solid #F0F0F5; text-align: left; }
        .ak-detail-label { font-size: 10px; font-weight: 700; color: #8E8E93; text-transform: uppercase; }
        .ak-detail-val { font-size: 13px; font-weight: 600; color: #1D1D1F; }

        .ak-section-title { font-size: 12px; font-weight: 700; color: #1D1D1F; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em; text-align: left; }
        .ak-preview-section { background: #F0F9FF; border: 1px solid #BEE3F8; border-radius: 12px; padding: 14px; text-align: left; }
        .ak-video-link { display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; color: #0077A8; text-decoration: none; }
        .ak-video-link:hover { text-decoration: underline; }

        .ak-structure-section { display: flex; flex-direction: column; text-align: left; }
        .ak-no-curriculum { font-size: 13px; color: #8E8E93; font-style: italic; }
        .ak-sections-list { display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto; padding-right: 4px; }
        .ak-section-item { background: #F9FAFB; border-radius: 12px; border: 1px solid #E5E5EA; overflow: hidden; }
        .ak-section-hdr { background: #F2F2F7; padding: 8px 14px; font-size: 12px; font-weight: 700; color: #1D1D1F; border-bottom: 1px solid #E5E5EA; text-align: left; }
        .ak-lessons-list { list-style: none; padding: 0; margin: 0; }
        .ak-lesson-item { padding: 8px 14px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #3A3A3C; border-bottom: 1px solid #E5E5EA; text-align: left; }
        .ak-lesson-item:last-child { border-bottom: none; }
        .ak-les-type { font-size: 14px; }
        .ak-les-title { flex: 1; text-align: left; }
        .ak-les-dur { color: #8E8E93; font-size: 11px; }

        .ak-private-section { background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; text-align: left; }
        .ak-private-fields { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .ak-private-field { display: flex; flex-direction: column; gap: 4px; }
        .ak-private-label { font-size: 10px; font-weight: 700; color: #8E8E93; text-transform: uppercase; }
        .ak-private-input { width: 100%; border: 1.5px solid #E5E5EA; border-radius: 10px; padding: 9px 12px; font-size: 13px; outline: none; transition: border-color 0.18s; font-family: inherit; background: white; }
        .ak-private-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .ak-btn-save-private { background: #7C3AED; color: white; align-self: flex-start; padding: 8px 14px; }
        .ak-btn-save-private:hover:not(:disabled) { background: #6D28D9; }

        .ak-feedback-section { display: flex; flex-direction: column; text-align: left; }
        .ak-feedback-input { width: 100%; border: 1.5px solid #E5E5EA; border-radius: 12px; padding: 12px; font-size: 13px; outline: none; transition: border-color 0.18s; font-family: inherit; }
        .ak-feedback-input:focus { border-color: #0077A8; box-shadow: 0 0 0 3px rgba(0,119,168,0.1); }

        .ak-modal-footer { border-top: 1px solid #F0F0F5; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; }
        .ak-btn-cancel { background: #F2F2F7; color: #1D1D1F; }
        .ak-btn-cancel:hover { background: #E5E5EA; }
        .ak-modal-actions { display: flex; gap: 8px; }
        .ak-btn-modal-reject { background: #FEE2E2; color: #DC2626; }
        .ak-btn-modal-reject:hover { background: #DC2626; color: white; }
        .ak-btn-modal-approve { background: #0077A8; color: white; }
        .ak-btn-modal-approve:hover { background: #005f87; }

        .ak-loading { display: flex; justify-content: center; padding: 48px; }
        .ak-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #0077A8; border-top-color: transparent; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ak-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: #9CA3AF; font-size: 14px; }
        .ak-empty p:first-child { font-size: 32px; }

        .ak-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .ak-page-btn { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E5E5EA; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #1D1D1F; transition: all 0.18s; }
        .ak-page-btn:hover:not(:disabled) { border-color: #0077A8; color: #0077A8; }
        .ak-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ak-page-info { font-size: 13px; color: #6E6E73; }
      `}</style>
    </div>
  );
}
