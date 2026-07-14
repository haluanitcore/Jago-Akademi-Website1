"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth/token";

type EBook = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  driveUrl: string;
  purchasedAt: string;
};

export default function EbookPage() {
  const router = useRouter();
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/masuk"); return; }

    fetch(`/api/ebooks/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.success && Array.isArray(body.data)) {
          setEbooks(body.data);
        } else {
          setError(body.error?.message ?? "Gagal memuat e-book.");
        }
      })
      .catch(() => {
        setError("Gagal memuat e-book.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="eb-loading"><span className="eb-spinner" /></div>
    );
  }

  return (
    <div className="eb-page">
      <div className="eb-header">
        <div>
          <h1 className="eb-title">E-Book Saya</h1>
          <p className="eb-subtitle">{ebooks.length} e-book tersedia untuk diunduh</p>
        </div>
        <Link href="/e-course" className="eb-shop-btn">🛒 Beli E-Book</Link>
      </div>

      {/* Info banner */}
      <div className="eb-info-banner">
        <span className="eb-info-icon">ℹ️</span>
        <p className="eb-info-text">
          E-Book Anda tersimpan di Google Drive. Klik tombol <strong>Unduh PDF</strong> untuk mengakses file. 
          Akses berlaku selamanya setelah pembelian.
        </p>
      </div>

      {error && <div className="eb-error">{error}</div>}

      {!loading && ebooks.length === 0 && (
        <div className="eb-empty">
          <div className="eb-empty-art">📚</div>
          <h2 className="eb-empty-title">Belum Ada E-Book</h2>
          <p className="eb-empty-desc">
            Beli e-book premium untuk mendapatkan materi pembelajaran berkualitas tinggi dalam format PDF.
          </p>
          <Link href="/e-course" className="eb-empty-cta">
            Jelajahi E-Book
          </Link>
        </div>
      )}

      {ebooks.length > 0 && (
        <div className="eb-grid">
          {ebooks.map((book) => (
            <div key={book.id} className="eb-card">
              {/* Cover */}
              <div className="eb-card-cover">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="eb-cover-img" />
                ) : (
                  <div className="eb-cover-placeholder">
                    <span className="eb-cover-emoji">📖</span>
                    <span className="eb-cover-pdf">PDF</span>
                  </div>
                )}
                <div className="eb-card-badge">E-Book</div>
              </div>

              {/* Info */}
              <div className="eb-card-body">
                <h3 className="eb-card-title">{book.title}</h3>
                {book.description && (
                  <p className="eb-card-desc">{book.description}</p>
                )}
                <p className="eb-card-date">
                  📅 Dibeli: {new Date(book.purchasedAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>

                <div className="eb-card-actions">
                  <a
                    href={book.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eb-btn-download"
                  >
                    ⬇️ Unduh PDF
                  </a>
                  <a
                    href={book.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eb-btn-view"
                  >
                    👁 Buka di Drive
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .eb-page { display: flex; flex-direction: column; gap: 24px; }
        .eb-loading { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
        .eb-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .eb-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .eb-title { font-size: 22px; font-weight: 800; color: #1D1D1F; }
        .eb-subtitle { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .eb-shop-btn {
          padding: 10px 20px; background: linear-gradient(135deg, #7C3AED, #a855f7);
          color: white; border-radius: 10px; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: opacity 0.2s;
        }
        .eb-shop-btn:hover { opacity: 0.85; }

        .eb-info-banner {
          background: linear-gradient(135deg, rgba(0,119,168,0.06), rgba(0,119,168,0.02));
          border: 1px solid rgba(0,119,168,0.15);
          border-radius: 14px; padding: 14px 18px;
          display: flex; align-items: flex-start; gap: 10px;
        }
        .eb-info-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .eb-info-text { font-size: 13px; color: #374151; line-height: 1.5; }

        .eb-error {
          padding: 14px 18px; background: #FEF2F2;
          border: 1px solid #FCA5A5; border-radius: 12px; color: #DC2626; font-size: 13px;
        }

        .eb-empty {
          background: white; border-radius: 20px; padding: 64px 32px;
          text-align: center; border: 1px dashed #E5E5EA;
        }
        .eb-empty-art { font-size: 64px; margin-bottom: 20px; }
        .eb-empty-title { font-size: 18px; font-weight: 700; color: #1D1D1F; margin-bottom: 10px; }
        .eb-empty-desc { font-size: 14px; color: #6E6E73; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; }
        .eb-empty-cta {
          display: inline-block; padding: 12px 28px;
          background: linear-gradient(135deg, #7C3AED, #a855f7);
          color: white; border-radius: 12px;
          font-size: 14px; font-weight: 600; text-decoration: none;
          transition: opacity 0.2s;
        }
        .eb-empty-cta:hover { opacity: 0.85; }

        .eb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .eb-card {
          background: white; border-radius: 18px; overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          display: flex; flex-direction: column;
          transition: all 0.22s;
        }
        .eb-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

        .eb-card-cover {
          height: 160px; position: relative; overflow: hidden; flex-shrink: 0;
        }
        .eb-cover-img { width: 100%; height: 100%; object-fit: cover; }
        .eb-cover-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #7C3AED20, #a855f720);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 6px;
        }
        .eb-cover-emoji { font-size: 40px; }
        .eb-cover-pdf {
          font-size: 11px; font-weight: 800; color: #7C3AED;
          letter-spacing: 0.1em; background: rgba(124,58,237,0.1);
          padding: 3px 10px; border-radius: 999px;
        }
        .eb-card-badge {
          position: absolute; top: 10px; right: 10px;
          background: linear-gradient(135deg, #7C3AED, #a855f7);
          color: white; font-size: 10px; font-weight: 700;
          padding: 4px 10px; border-radius: 999px;
        }

        .eb-card-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .eb-card-title { font-size: 14px; font-weight: 700; color: #1D1D1F; line-height: 1.4; }
        .eb-card-desc {
          font-size: 12px; color: #6E6E73; line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .eb-card-date { font-size: 11px; color: #9CA3AF; margin-top: auto; }

        .eb-card-actions { display: flex; gap: 8px; margin-top: 10px; }
        .eb-btn-download {
          flex: 1; text-align: center; padding: 9px;
          background: linear-gradient(135deg, #7C3AED, #a855f7);
          color: white; border-radius: 10px; font-size: 12px; font-weight: 600;
          text-decoration: none; transition: opacity 0.2s;
        }
        .eb-btn-download:hover { opacity: 0.85; }
        .eb-btn-view {
          flex: 1; text-align: center; padding: 9px;
          border: 1.5px solid #7C3AED; color: #7C3AED;
          border-radius: 10px; font-size: 12px; font-weight: 600;
          text-decoration: none; transition: all 0.2s;
        }
        .eb-btn-view:hover { background: #7C3AED; color: white; }

        @media (max-width: 640px) { .eb-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
