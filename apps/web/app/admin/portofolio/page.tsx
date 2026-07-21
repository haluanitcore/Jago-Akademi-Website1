"use client";

import { useEffect, useState } from "react";
import { getValidToken } from "@/lib/auth/token";

type PortfolioItem = {
  title: string;
  url?: string | null;
  imageUrl?: string | null;
  description?: string | null;
};

type Member = {
  id: string;
  name: string;
  role: string;
  headline?: string | null;
  photoUrl?: string | null;
  featured: boolean;
  status: string;
  portfolioItems?: PortfolioItem[] | null;
  createdAt: string;
};

const MAX_ITEMS = 30;

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export default function AdminPortofolioPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formHeadline, setFormHeadline] = useState("");
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState("draft");
  const [formItems, setFormItems] = useState<PortfolioItem[]>([]);

  const [saving, setSaving] = useState(false);

  async function loadMembers() {
    const token = await getValidToken();
    if (!token) return;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });

    setLoading(true);
    fetch(`/api/admin/portfolios?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setMembers(Array.isArray(body.data) ? body.data : []);
          setTotal(body.meta?.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMembers();
  }, [page, statusFilter]); // eslint-disable-line

  function handleOpenCreate() {
    setModalMode("create");
    setEditingId(null);
    setFormName("");
    setFormRole("");
    setFormHeadline("");
    setFormPhotoUrl("");
    setFormFeatured(false);
    setFormStatus("draft");
    setFormItems([]);
    setShowModal(true);
  }

  function handleOpenEdit(member: Member) {
    setModalMode("edit");
    setEditingId(member.id);
    setFormName(member.name);
    setFormRole(member.role);
    setFormHeadline(member.headline ?? "");
    setFormPhotoUrl(member.photoUrl ?? "");
    setFormFeatured(member.featured);
    setFormStatus(member.status);
    setFormItems(
      (member.portfolioItems ?? []).map((it) => ({
        title: it.title ?? "",
        url: it.url ?? "",
        imageUrl: it.imageUrl ?? "",
        description: it.description ?? "",
      })),
    );
    setShowModal(true);
  }

  function handleAddItem() {
    if (formItems.length >= MAX_ITEMS) {
      alert(`Maksimal ${MAX_ITEMS} item portofolio.`);
      return;
    }
    setFormItems([...formItems, { title: "", url: "", imageUrl: "", description: "" }]);
  }

  function handleRemoveItem(index: number) {
    setFormItems(formItems.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: keyof PortfolioItem, value: string) {
    setFormItems(formItems.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  // Client-side guards mirroring the server rules (Zod on the API boundary).
  function validateForm(): string | null {
    const name = formName.trim();
    const role = formRole.trim();
    if (name.length < 2 || name.length > 120) return "Nama wajib 2-120 karakter.";
    if (role.length < 2 || role.length > 120) return "Role wajib 2-120 karakter.";
    if (formHeadline.trim().length > 200) return "Headline maksimal 200 karakter.";
    if (formPhotoUrl.trim() && !isHttpsUrl(formPhotoUrl.trim())) {
      return "URL Foto harus berupa link https:// yang valid.";
    }
    if (formItems.length > MAX_ITEMS) return `Maksimal ${MAX_ITEMS} item portofolio.`;
    for (const [i, it] of formItems.entries()) {
      const title = (it.title ?? "").trim();
      if (title.length < 1 || title.length > 160) {
        return `Item #${i + 1}: judul wajib 1-160 karakter.`;
      }
      if ((it.url ?? "").trim() && !isHttpsUrl((it.url ?? "").trim())) {
        return `Item #${i + 1}: URL harus berupa link https:// yang valid.`;
      }
      if ((it.imageUrl ?? "").trim() && !isHttpsUrl((it.imageUrl ?? "").trim())) {
        return `Item #${i + 1}: URL gambar harus berupa link https:// yang valid.`;
      }
      if ((it.description ?? "").trim().length > 300) {
        return `Item #${i + 1}: deskripsi maksimal 300 karakter.`;
      }
    }
    return null;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const token = await getValidToken();
    if (!token) return;

    setSaving(true);
    const url = modalMode === "create" ? "/api/admin/portfolios" : `/api/admin/portfolios/${editingId}`;
    const method = modalMode === "create" ? "POST" : "PATCH";

    const payload = {
      name: formName.trim(),
      role: formRole.trim(),
      headline: formHeadline.trim() || null,
      photoUrl: formPhotoUrl.trim() || null,
      featured: formFeatured,
      status: formStatus,
      portfolioItems: formItems.map((it) => ({
        title: (it.title ?? "").trim(),
        url: (it.url ?? "").trim() || null,
        imageUrl: (it.imageUrl ?? "").trim() || null,
        description: (it.description ?? "").trim() || null,
      })),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (body.success) {
        setShowModal(false);
        loadMembers();
      } else {
        alert(body.error?.message ?? "Gagal menyimpan portofolio member.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus member "${name}"?`)) return;

    const token = await getValidToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/portfolios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (body.success) {
        loadMembers();
      } else {
        alert(body.error?.message ?? "Gagal menghapus member.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="pf-page">
      {/* Header */}
      <div className="pf-header">
        <div>
          <h1 className="pf-title">Portofolio Member</h1>
          <p className="pf-sub">{total.toLocaleString("id-ID")} member terdaftar</p>
        </div>
        <button onClick={handleOpenCreate} className="pf-add-btn">
          ＋ Tambah Member
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="pf-status-tabs">
        {["all", "published", "draft"].map((st) => (
          <button
            key={st}
            onClick={() => { setStatusFilter(st); setPage(1); }}
            className={`pf-status-tab ${statusFilter === st ? "pf-status-active" : ""}`}
          >
            {st === "all" ? "Semua" : st === "published" ? "Published" : "Draft"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="pf-table-wrap">
        {loading ? (
          <div className="pf-loading"><span className="pf-spinner" /></div>
        ) : members.length === 0 ? (
          <div className="pf-empty">
            <p>🖼️</p><p>Tidak ada member ditemukan</p>
          </div>
        ) : (
          <table className="pf-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Karya</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="pf-member-cell">
                      <div className="pf-photo">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} />
                        ) : (
                          <span>{(member.name ?? "?").slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="pf-name-text">{member.name}</p>
                        {member.headline && <p className="pf-headline-text">{member.headline}</p>}
                      </div>
                    </div>
                  </td>
                  <td><span className="pf-role">{member.role}</span></td>
                  <td><span className="pf-items-count">{member.portfolioItems?.length ?? 0} item</span></td>
                  <td>
                    <span className={`pf-badge ${member.status === "published" ? "pf-badge-published" : "pf-badge-draft"}`}>
                      {member.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <span className={`pf-star ${member.featured ? "pf-star-on" : ""}`}>
                      {member.featured ? "★" : "☆"}
                    </span>
                  </td>
                  <td>
                    <span className="pf-date">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString("id-ID") : "—"}
                    </span>
                  </td>
                  <td>
                    <div className="pf-actions">
                      <button onClick={() => handleOpenEdit(member)} className="pf-action-btn pf-btn-edit">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(member.id, member.name)} className="pf-action-btn pf-btn-delete">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pf-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="pf-page-btn">← Prev</button>
          <span className="pf-page-info">Halaman {page} dari {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="pf-page-btn">Next →</button>
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-content">
            <div className="pf-modal-header">
              <h2 className="pf-modal-title">
                {modalMode === "create" ? "Tambah Member Baru" : "Edit Member"}
              </h2>
              <button onClick={() => setShowModal(false)} className="pf-modal-close">✕</button>
            </div>
            <form onSubmit={handleSave} className="pf-form">
              <div className="pf-form-grid">
                <div>
                  <label className="pf-label">Nama Member</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="pf-input"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                <div>
                  <label className="pf-label">Role / Profesi</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="pf-input"
                    placeholder="Contoh: UI/UX Designer"
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="pf-label">Headline (Opsional, maks 200)</label>
                  <input
                    type="text"
                    maxLength={200}
                    value={formHeadline}
                    onChange={(e) => setFormHeadline(e.target.value)}
                    className="pf-input"
                    placeholder="Contoh: Alumni Bootcamp Batch 3 — kini bekerja di startup fintech"
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="pf-label">URL Foto (https)</label>
                  <input
                    type="text"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    className="pf-input"
                    placeholder="https://media.jago.id/..."
                  />
                </div>
                <div>
                  <label className="pf-label">Status Publikasi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="pf-input"
                  >
                    <option value="draft">Draft (Sembunyikan)</option>
                    <option value="published">Published (Tampilkan)</option>
                  </select>
                </div>
                <div className="pf-featured-wrap">
                  <label className="pf-featured-label">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                    />
                    <span>★ Featured (tampil paling depan)</span>
                  </label>
                </div>
              </div>

              {/* Dynamic portfolio items editor */}
              <div className="pf-items-section">
                <div className="pf-items-header">
                  <label className="pf-label" style={{ marginBottom: 0 }}>
                    Item Portofolio ({formItems.length}/{MAX_ITEMS})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={formItems.length >= MAX_ITEMS}
                    className="pf-item-add-btn"
                  >
                    ＋ Tambah Item
                  </button>
                </div>
                {formItems.length === 0 && (
                  <p className="pf-items-empty">Belum ada item. Klik &quot;Tambah Item&quot; untuk menambahkan karya.</p>
                )}
                {formItems.map((item, index) => (
                  <div key={index} className="pf-item-row">
                    <div className="pf-item-row-head">
                      <span className="pf-item-index">Item #{index + 1}</span>
                      <button type="button" onClick={() => handleRemoveItem(index)} className="pf-item-remove-btn">
                        ✕ Hapus
                      </button>
                    </div>
                    <div className="pf-item-grid">
                      <input
                        type="text"
                        maxLength={160}
                        value={item.title ?? ""}
                        onChange={(e) => handleItemChange(index, "title", e.target.value)}
                        className="pf-input"
                        placeholder="Judul karya (wajib, maks 160)"
                      />
                      <input
                        type="text"
                        value={item.url ?? ""}
                        onChange={(e) => handleItemChange(index, "url", e.target.value)}
                        className="pf-input"
                        placeholder="URL karya https:// (opsional)"
                      />
                      <input
                        type="text"
                        value={item.imageUrl ?? ""}
                        onChange={(e) => handleItemChange(index, "imageUrl", e.target.value)}
                        className="pf-input"
                        placeholder="URL gambar https:// (opsional)"
                      />
                      <input
                        type="text"
                        maxLength={300}
                        value={item.description ?? ""}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        className="pf-input"
                        placeholder="Deskripsi singkat (opsional, maks 300)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pf-form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="pf-btn-cancel">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="pf-btn-submit">
                  {saving ? "Menyimpan..." : "Simpan Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .pf-page { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; }
        .pf-header { display: flex; align-items: center; justify-content: space-between; }
        .pf-title { font-size: 20px; font-weight: 800; color: #1D1D1F; }
        .pf-sub { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .pf-add-btn {
          padding: 9px 16px; border-radius: 10px; background: #0077A8;
          color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .pf-add-btn:hover { background: #005f87; }

        .pf-status-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .pf-status-tab {
          padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
          border: 1.5px solid #E5E5EA; background: white; cursor: pointer;
          color: #6E6E73; transition: all 0.18s;
        }
        .pf-status-active { background: #0077A8; color: white; border-color: #0077A8; }

        .pf-table-wrap { background: white; border-radius: 18px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .pf-table { width: 100%; border-collapse: collapse; }
        .pf-table thead tr { background: #F9FAFB; border-bottom: 1px solid #F0F0F5; }
        .pf-table th { padding: 12px 16px; font-size: 11px; font-weight: 700; color: #6E6E73; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap; }
        .pf-table td { padding: 12px 16px; font-size: 13px; color: #1D1D1F; border-bottom: 1px solid #F5F5F7; }
        .pf-table tr:last-child td { border-bottom: none; }
        .pf-table tr:hover td { background: #FAFAFA; }

        .pf-member-cell { display: flex; align-items: center; gap: 12px; }
        .pf-photo {
          width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #0077A8, #CC0052);
          overflow: hidden; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: white; flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .pf-photo img { width: 100%; height: 100%; object-fit: cover; }
        .pf-name-text { font-size: 13.5px; font-weight: 600; }
        .pf-headline-text { font-size: 11px; color: #9CA3AF; margin-top: 1px; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .pf-role { font-size: 12px; color: #0077A8; background: #E8F4F9; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
        .pf-items-count { font-size: 12.5px; color: #6E6E73; }
        .pf-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; display: inline-block; }
        .pf-badge-published { background: #DCFCE7; color: #16A34A; }
        .pf-badge-draft { background: #F5F5F7; color: #6E6E73; }
        .pf-star { font-size: 16px; color: #D1D5DB; }
        .pf-star-on { color: #FBBF24; }
        .pf-date { font-size: 12.5px; color: #6E6E73; }

        .pf-actions { display: flex; gap: 6px; }
        .pf-action-btn { padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; transition: all 0.18s; }
        .pf-btn-edit { background: #E8F4F9; color: #0077A8; }
        .pf-btn-edit:hover { background: #0077A8; color: white; }
        .pf-btn-delete { background: #FEE2E2; color: #DC2626; }
        .pf-btn-delete:hover { background: #DC2626; color: white; }

        .pf-loading { display: flex; justify-content: center; align-items: center; padding: 48px; }
        .pf-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #0077A8; border-top-color: transparent; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pf-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: #9CA3AF; font-size: 14px; }
        .pf-empty p:first-child { font-size: 32px; }

        .pf-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .pf-page-btn { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E5E5EA; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #1D1D1F; transition: all 0.18s; }
        .pf-page-btn:hover:not(:disabled) { border-color: #0077A8; color: #0077A8; }
        .pf-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pf-page-info { font-size: 13px; color: #6E6E73; }

        /* Modal styling */
        .pf-modal-overlay {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
          display: flex; align-items: center; justify-content: center; z-index: 100;
          backdrop-filter: blur(4px);
        }
        .pf-modal-content {
          background: white; border-radius: 20px; width: 680px; max-width: 95%;
          max-height: 90vh; overflow-y: auto;
          padding: 24px; box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          display: flex; flex-direction: column; gap: 20px;
        }
        .pf-modal-header { display: flex; align-items: center; justify-content: space-between; }
        .pf-modal-title { font-size: 16px; font-weight: 800; color: #1D1D1F; }
        .pf-modal-close { background: none; border: none; font-size: 18px; color: #9CA3AF; cursor: pointer; }
        .pf-modal-close:hover { color: #1D1D1F; }

        .pf-form { display: flex; flex-direction: column; gap: 20px; }
        .pf-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pf-label { display: block; font-size: 11px; font-weight: 600; color: #6E6E73; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em; }
        .pf-input {
          width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid #E5E5EA;
          font-size: 13px; outline: none; transition: border-color 0.15s;
        }
        .pf-input:focus { border-color: #0077A8; }

        .pf-featured-wrap { display: flex; align-items: flex-end; padding-bottom: 4px; }
        .pf-featured-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #1D1D1F; cursor: pointer; }

        .pf-items-section { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid #F0F0F5; padding-top: 16px; }
        .pf-items-header { display: flex; align-items: center; justify-content: space-between; }
        .pf-item-add-btn {
          padding: 6px 12px; border-radius: 8px; background: #E8F4F9; color: #0077A8;
          border: none; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.18s;
        }
        .pf-item-add-btn:hover:not(:disabled) { background: #0077A8; color: white; }
        .pf-item-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pf-items-empty { font-size: 12px; color: #9CA3AF; padding: 8px 0; }

        .pf-item-row { background: #F9FAFB; border: 1px solid #F0F0F5; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .pf-item-row-head { display: flex; align-items: center; justify-content: space-between; }
        .pf-item-index { font-size: 11px; font-weight: 700; color: #6E6E73; }
        .pf-item-remove-btn { background: #FEE2E2; color: #DC2626; border: none; border-radius: 6px; padding: 3px 8px; font-size: 10px; font-weight: 700; cursor: pointer; }
        .pf-item-remove-btn:hover { background: #DC2626; color: white; }
        .pf-item-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

        .pf-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
        .pf-btn-cancel { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #E5E5EA; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #6E6E73; }
        .pf-btn-cancel:hover { background: #F5F5F7; }
        .pf-btn-submit { padding: 9px 18px; border-radius: 10px; border: none; background: #0077A8; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
        .pf-btn-submit:hover:not(:disabled) { background: #005f87; }
        .pf-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
