"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth/token";

type Certificate = {
  id: string;
  code: string;
  issuedAt: string;
  course: { title: string; slug: string };
};

export default function SertifikatPage() {
  const router = useRouter();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/masuk"); return; }

    fetch(`/api/certificates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.success && Array.isArray(body.data)) {
          setCerts(body.data);
        } else {
          setError(body.error?.message ?? "Gagal memuat sertifikat.");
        }
      })
      .catch(() => {
        setError("Gagal memuat sertifikat.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  if (loading) {
    return (
      <div className="sc-loading">
        <span className="sc-spinner" />
      </div>
    );
  }

  return (
    <div className="sc-page">
      <div className="sc-header">
        <div>
          <h1 className="sc-title">Sertifikat Saya</h1>
          <p className="sc-subtitle">{certs.length} sertifikat diperoleh</p>
        </div>
        <Link href="/e-course" className="sc-cta-btn">Dapatkan Lebih Banyak</Link>
      </div>

      {error && <div className="sc-error">{error}</div>}

      {!loading && certs.length === 0 && (
        <div className="sc-empty">
          <div className="sc-empty-art">🏅</div>
          <h2 className="sc-empty-title">Belum Ada Sertifikat</h2>
          <p className="sc-empty-desc">
            Selesaikan kursus untuk mendapatkan sertifikat kelulusan Anda.
          </p>
          <Link href="/dashboard/kursus" className="sc-empty-cta">
            Lihat Kursus Saya
          </Link>
        </div>
      )}

      {certs.length > 0 && (
        <div className="sc-grid">
          {certs.map((cert, idx) => (
            <div key={cert.id} className="sc-card">
              {/* Card visual top */}
              <div className="sc-card-top">
                <div className="sc-card-badge">
                  <span className="sc-badge-num">#{idx + 1}</span>
                  <span className="sc-badge-icon">🏅</span>
                </div>
                <div className="sc-card-ribbon">Tersertifikasi</div>
              </div>

              {/* Info */}
              <div className="sc-card-body">
                <h3 className="sc-card-title">{cert.course.title}</h3>
                <p className="sc-card-date">
                  Diterbitkan: {new Date(cert.issuedAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
                <div className="sc-card-code">
                  <span className="sc-code-label">Kode Verifikasi</span>
                  <code className="sc-code-val">{cert.code.toUpperCase()}</code>
                </div>

                {/* Actions */}
                <div className="sc-card-actions">
                  <Link
                    href={`/verify/${cert.code}`}
                    target="_blank"
                    className="sc-btn-verify"
                  >
                    🔍 Verifikasi
                  </Link>
                  <a
                    href={`${apiBase}/api/certificates/${cert.code}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="sc-btn-download"
                  >
                    ⬇️ Unduh PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sc-page { display: flex; flex-direction: column; gap: 24px; }
        .sc-loading { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
        .sc-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #0077A8; border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .sc-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .sc-title { font-size: 22px; font-weight: 800; color: #1D1D1F; }
        .sc-subtitle { font-size: 13px; color: #6E6E73; margin-top: 3px; }
        .sc-cta-btn {
          padding: 10px 20px; background: linear-gradient(135deg, #0077A8, #00a8d9);
          color: white; border-radius: 10px; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: opacity 0.2s;
        }
        .sc-cta-btn:hover { opacity: 0.85; }

        .sc-error {
          padding: 14px 18px; background: #FEF2F2;
          border: 1px solid #FCA5A5; border-radius: 12px; color: #DC2626; font-size: 13px;
        }

        .sc-empty {
          background: white; border-radius: 20px; padding: 64px 32px;
          text-align: center; border: 1px dashed #E5E5EA;
        }
        .sc-empty-art { font-size: 64px; margin-bottom: 20px; }
        .sc-empty-title { font-size: 18px; font-weight: 700; color: #1D1D1F; margin-bottom: 10px; }
        .sc-empty-desc { font-size: 14px; color: #6E6E73; margin-bottom: 24px; }
        .sc-empty-cta {
          display: inline-block; padding: 12px 28px;
          background: #0077A8; color: white; border-radius: 12px;
          font-size: 14px; font-weight: 600; text-decoration: none;
          transition: background 0.2s;
        }
        .sc-empty-cta:hover { background: #005f87; }

        .sc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .sc-card {
          background: white; border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transition: all 0.22s;
        }
        .sc-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

        .sc-card-top {
          background: linear-gradient(135deg, #0a1628 0%, #0d2b4e 60%, #1a0030 100%);
          padding: 24px 20px;
          display: flex; align-items: center; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .sc-card-top::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 30% 50%, rgba(0,119,168,0.3), transparent 60%);
          pointer-events: none;
        }
        .sc-card-badge {
          display: flex; align-items: center; gap: 10px; position: relative;
        }
        .sc-badge-num { color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 600; }
        .sc-badge-icon { font-size: 36px; }
        .sc-card-ribbon {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(4px);
          color: rgba(255,255,255,0.85);
          font-size: 11px; font-weight: 600;
          padding: 5px 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.15);
          position: relative;
        }

        .sc-card-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .sc-card-title {
          font-size: 14px; font-weight: 700; color: #1D1D1F;
          line-height: 1.4;
        }
        .sc-card-date { font-size: 12px; color: #6E6E73; }

        .sc-card-code {
          background: #F5F5F7; border-radius: 10px; padding: 10px 14px;
          display: flex; flex-direction: column; gap: 3px;
        }
        .sc-code-label { font-size: 10px; color: #9CA3AF; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .sc-code-val { font-size: 13px; font-weight: 700; color: #1D1D1F; font-family: monospace; letter-spacing: 0.05em; }

        .sc-card-actions { display: flex; gap: 8px; }
        .sc-btn-verify {
          flex: 1; text-align: center; padding: 9px;
          border: 1.5px solid #0077A8; color: #0077A8;
          border-radius: 10px; font-size: 12px; font-weight: 600;
          text-decoration: none; transition: all 0.2s;
        }
        .sc-btn-verify:hover { background: #0077A8; color: white; }
        .sc-btn-download {
          flex: 1; text-align: center; padding: 9px;
          background: #0077A8; color: white;
          border-radius: 10px; font-size: 12px; font-weight: 600;
          text-decoration: none; transition: background 0.2s;
        }
        .sc-btn-download:hover { background: #005f87; }

        @media (max-width: 640px) {
          .sc-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
