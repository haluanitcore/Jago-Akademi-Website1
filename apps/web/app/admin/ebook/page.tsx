"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth/token";

type EBook = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  fileUrl: string;
  coverUrl: string | null;
  author: string | null;
  pages: number | null;
  category: string | null;
  status: string;
  createdAt: string;
};

export default function AdminEbookPage() {
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formSlug, setFormSlug] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formCoverUrl, setFormCoverUrl] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formPages, setFormPages] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formStatus, setFormStatus] = useState("draft");

  const [saving, setSaving] = useState(false);

  function loadEbooks() {
    const token = getToken();
    if (!token) return;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });

    setLoading(true);
    fetch(`/api/admin/ebooks?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setEbooks(body.data ?? []);
          setTotal(body.meta?.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEbooks();
  }, [page, statusFilter]); // eslint-disable-line

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadEbooks();
  }

  function handleOpenCreate() {
    setModalMode("create");
    setEditingId(null);
    setFormSlug("");
    setFormTitle("");
    setFormDesc("");
    setFormPrice(0);
    setFormSalePrice("");
    setFormFileUrl("");
    setFormCoverUrl("");
    setFormAuthor("");
    setFormPages("");
    setFormCategory("");
    setFormStatus("draft");
    setShowModal(true);
  }

  function handleOpenEdit(ebook: EBook) {
    setModalMode("edit");
    setEditingId(ebook.id);
    setFormSlug(ebook.slug);
    setFormTitle(ebook.title);
    setFormDesc(ebook.description ?? "");
    setFormPrice(Number(ebook.price));
    setFormSalePrice(ebook.salePrice !== null ? String(ebook.salePrice) : "");
    setFormFileUrl(ebook.fileUrl);
    setFormCoverUrl(ebook.coverUrl ?? "");
    setFormAuthor(ebook.author ?? "");
    setFormPages(ebook.pages !== null ? String(ebook.pages) : "");
    setFormCategory(ebook.category ?? "");
    setFormStatus(ebook.status);
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formSlug || !formTitle || !formFileUrl) {
      alert("Slug, Judul, dan URL File PDF wajib diisi.");
      return;
    }

    const token = getToken();
    if (!token) return;

    setSaving(true);
    const url = modalMode === "create" ? "/api/admin/ebooks" : `/api/admin/ebooks/${editingId}`;
    const method = modalMode === "create" ? "POST" : "PATCH";

    const payload = {
      slug: formSlug,
      title: formTitle,
      description: formDesc || null,
      price: Number(formPrice),
      salePrice: formSalePrice ? Number(formSalePrice) : null,
      fileUrl: formFileUrl,
      coverUrl: formCoverUrl || null,
      author: formAuthor || null,
      pages: formPages ? Number(formPages) : null,
      category: formCategory || null,
      status: formStatus,
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
        loadEbooks();
      } else {
        alert(body.error?.message ?? "Gagal menyimpan E-Book.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus E-Book "${title}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/ebooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (body.success) {
        loadEbooks();
      } else {
        alert(body.error?.message ?? "Gagal menghapus E-Book.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="eb-page">
      {/* Header */}
      <div className="eb-header">
        <div>
          <h1 className="eb-title">Manajemen E-Book</h1>
          <p className="eb-sub">{total.toLocaleString("id-ID")} e-book terdaftar</p>
        </div>
        <button onClick={handleOpenCreate} className="eb-add-btn">
          ➕ Tambah E-Book
        </button>
      </div>

      {/* Filters */}
      <div className="eb-filters">
        <form onSubmit={handleSearch} className="eb-search-form">
          <input
            className="eb-search-input"
            placeholder="Cari judul atau penulis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="eb-search-btn">🔍 Cari</button>
        </form>
        <div className="eb-status-tabs">
          {["all", "published", "draft"].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`eb-status-tab ${statusFilter === st ? "eb-status-active" : ""}`}
            >
              {st === "all" ? "Semua" : st === "published" ? "Aktif" : "Draft"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="eb-table-wrap">
        {loading ? (
          <div className="eb-loading"><span className="eb-spinner" /></div>
        ) : ebooks.length === 0 ? (
          <div className="eb-empty">
            <p>📘</p><p>Tidak ada e-book ditemukan</p>
          </div>
        ) : (
          <table className="eb-table">
            <thead>
              <tr>
                <th>Judul E-Book</th>
                <th>Kategori</th>
                <th>Penulis</th>
                <th>Halaman</th>
                <th>Harga</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ebooks.map((ebook) => (
                <tr key={ebook.id}>
                  <td>
                    <div className="eb-title-cell">
                      <div className="eb-cover-img">
                        {ebook.coverUrl ? (
                          <img src={ebook.coverUrl} alt={ebook.title} />
                        ) : (
                          <span>PDF</span>
                        )}
                      </div>
                      <div>
                        <p className="eb-title-text">{ebook.title}</p>
                        <p className="eb-slug-text">slug: {ebook.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="eb-category">{ebook.category ?? "—"}</span></td>
                  <td><span className="eb-author">{ebook.author ?? "—"}</span></td>
                  <td><span className="eb-pages">{ebook.pages ?? "—"}</span></td>
                  <td>
                    <div>
                      <p className="eb-price">Rp {Number(ebook.price).toLocaleString("id-ID")}</p>
                      {ebook.salePrice !== null && (
                        <p className="eb-saleprice">Sale: Rp {Number(ebook.salePrice).toLocaleString("id-ID")}</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`eb-badge ${ebook.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {ebook.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div className="eb-actions">
                      <button onClick={() => handleOpenEdit(ebook)} className="eb-action-btn eb-btn-edit">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(ebook.id, ebook.title)} className="eb-action-btn eb-btn-delete">
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
        <div className="eb-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="eb-page-btn">← Prev</button>
          <span className="eb-page-info">Halaman {page} dari {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="eb-page-btn">Next →</button>
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="eb-modal-overlay">
          <div className="eb-modal-content">
            <div className="eb-modal-header">
              <h2 className="eb-modal-title">
                {modalMode === "create" ? "Tambah E-Book Baru" : "Edit E-Book"}
              </h2>
              <button onClick={() => setShowModal(false)} className="eb-modal-close">✕</button>
            </div>
            <form onSubmit={handleSave} className="eb-form">
              <div className="eb-form-grid">
                <div>
                  <label className="eb-label">Judul E-Book</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="eb-input"
                    placeholder="Contoh: Belajar Python Praktis"
                  />
                </div>
                <div>
                  <label className="eb-label">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="eb-input"
                    placeholder="Contoh: belajar-python-praktis"
                  />
                </div>
                <div>
                  <label className="eb-label">Penulis</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="eb-input"
                    placeholder="Nama Penulis"
                  />
                </div>
                <div>
                  <label className="eb-label">Kategori</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="eb-input"
                    placeholder="Contoh: Marketing, Teknologi"
                  />
                </div>
                <div>
                  <label className="eb-label">Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="eb-input"
                  />
                </div>
                <div>
                  <label className="eb-label">Harga Diskon (Rp) (Opsional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    className="eb-input"
                    placeholder="Biarkan kosong jika tidak diskon"
                  />
                </div>
                <div>
                  <label className="eb-label">Jumlah Halaman</label>
                  <input
                    type="number"
                    min="1"
                    value={formPages}
                    onChange={(e) => setFormPages(e.target.value)}
                    className="eb-input"
                    placeholder="Jumlah halaman buku"
                  />
                </div>
                <div>
                  <label className="eb-label">Status Publikasi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="eb-input"
                  >
                    <option value="draft">Draft (Sembunyikan)</option>
                    <option value="published">Published (Aktif Jual)</option>
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="eb-label">URL File PDF E-Book (Google Drive / Secure Server Link)</label>
                  <input
                    type="text"
                    required
                    value={formFileUrl}
                    onChange={(e) => setFormFileUrl(e.target.value)}
                    className="eb-input"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="eb-label">URL Cover Image Buku</label>
                  <input
                    type="text"
                    value={formCoverUrl}
                    onChange={(e) => setFormCoverUrl(e.target.value)}
                    className="eb-input"
                    placeholder="https://media.jago.id/..."
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="eb-label">Deskripsi E-Book</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="eb-input"
                    style={{ height: "80px", resize: "none" }}
                    placeholder="Deskripsi ringkas isi buku..."
                  />
                </div>
              </div>
              <div className="eb-form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="eb-btn-cancel">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="eb-btn-submit">
                  {saving ? "Menyimpan..." : "Simpan E-Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .eb-page { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; }
        .eb-header { display: flex; align-items: center; justify-content: space-between; }
        .eb-title { font-size: 20px; font-weight: 800; color: #1D1D1F; }
        .eb-sub { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .eb-add-btn {
          padding: 9px 16px; border-radius: 10px; background: #0077A8;
          color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .eb-add-btn:hover { background: #005f87; }

        .eb-filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .eb-search-form { display: flex; gap: 8px; flex: 1; min-width: 240px; }
        .eb-search-input {
          flex: 1; padding: 9px 14px; border-radius: 10px;
          border: 1.5px solid #E5E5EA; font-size: 13px; outline: none;
        }
        .eb-search-input:focus { border-color: #0077A8; box-shadow: 0 0 0 3px rgba(0,119,168,0.1); }
        .eb-search-btn {
          padding: 9px 16px; border-radius: 10px; background: #F5F5F7;
          color: #1D1D1F; border: 1.5px solid #E5E5EA; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .eb-search-btn:hover { background: #E5E5EA; }

        .eb-status-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .eb-status-tab {
          padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
          border: 1.5px solid #E5E5EA; background: white; cursor: pointer;
          color: #6E6E73; transition: all 0.18s;
        }
        .eb-status-active { background: #0077A8; color: white; border-color: #0077A8; }

        .eb-table-wrap { background: white; border-radius: 18px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .eb-table { width: 100%; border-collapse: collapse; }
        .eb-table thead tr { background: #F9FAFB; border-bottom: 1px solid #F0F0F5; }
        .eb-table th { padding: 12px 16px; font-size: 11px; font-weight: 700; color: #6E6E73; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap; }
        .eb-table td { padding: 12px 16px; font-size: 13px; color: #1D1D1F; border-bottom: 1px solid #F5F5F7; }
        .eb-table tr:last-child td { border-bottom: none; }
        .eb-table tr:hover td { background: #FAFAFA; }

        .eb-title-cell { display: flex; align-items: center; gap: 12px; }
        .eb-cover-img {
          width: 44px; height: 56px; border-radius: 6px; background: #E5E5EA;
          overflow: hidden; display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: #6E6E73; flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .eb-cover-img img { width: 100%; height: 100%; object-fit: cover; }
        .eb-title-text { font-size: 13.5px; font-weight: 600; }
        .eb-slug-text { font-size: 11px; color: #9CA3AF; margin-top: 1px; }

        .eb-category { font-size: 12px; color: #0077A8; background: #E8F4F9; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
        .eb-author { font-size: 12.5px; color: #1D1D1F; font-weight: 500; }
        .eb-pages { font-size: 12.5px; color: #6E6E73; }
        .eb-price { font-size: 13px; font-weight: 700; color: #1D1D1F; }
        .eb-saleprice { font-size: 11px; color: #16A34A; font-weight: 600; margin-top: 1px; }
        .eb-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; display: inline-block; }

        .eb-actions { display: flex; gap: 6px; }
        .eb-action-btn { padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; transition: all 0.18s; }
        .eb-btn-edit { background: #E8F4F9; color: #0077A8; }
        .eb-btn-edit:hover { background: #0077A8; color: white; }
        .eb-btn-delete { background: #FEE2E2; color: #DC2626; }
        .eb-btn-delete:hover { background: #DC2626; color: white; }

        .eb-loading { display: flex; justify-content: center; align-items: center; padding: 48px; }
        .eb-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #0077A8; border-top-color: transparent; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .eb-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: #9CA3AF; font-size: 14px; }
        .eb-empty p:first-child { font-size: 32px; }

        .eb-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .eb-page-btn { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E5E5EA; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #1D1D1F; transition: all 0.18s; }
        .eb-page-btn:hover:not(:disabled) { border-color: #0077A8; color: #0077A8; }
        .eb-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .eb-page-info { font-size: 13px; color: #6E6E73; }

        /* Modal styling */
        .eb-modal-overlay {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
          display: flex; align-items: center; justify-content: center; z-index: 100;
          backdrop-filter: blur(4px);
        }
        .eb-modal-content {
          background: white; border-radius: 20px; width: 620px; max-width: 95%;
          padding: 24px; box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          display: flex; flex-direction: column; gap: 20px;
        }
        .eb-modal-header { display: flex; align-items: center; justify-content: space-between; }
        .eb-modal-title { font-size: 16px; font-weight: 800; color: #1D1D1F; }
        .eb-modal-close { background: none; border: none; font-size: 18px; color: #9CA3AF; cursor: pointer; }
        .eb-modal-close:hover { color: #1D1D1F; }

        .eb-form { display: flex; flex-direction: column; gap: 20px; }
        .eb-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .eb-label { display: block; font-size: 11px; font-weight: 600; color: #6E6E73; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em; }
        .eb-input {
          width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid #E5E5EA;
          font-size: 13px; outline: none; transition: border-color 0.15s;
        }
        .eb-input:focus { border-color: #0077A8; }
        
        .eb-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
        .eb-btn-cancel { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #E5E5EA; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #6E6E73; }
        .eb-btn-cancel:hover { background: #F5F5F7; }
        .eb-btn-submit { padding: 9px 18px; border-radius: 10px; border: none; background: #0077A8; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
        .eb-btn-submit:hover:not(:disabled) { background: #005f87; }
        .eb-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
