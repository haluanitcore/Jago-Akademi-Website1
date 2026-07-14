import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Zap, Building2, Star, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Berlangganan — Akses Semua Konten Premium",
  description:
    "Pilih paket berlangganan Jago Akademi yang sesuai kebutuhan. Akses ribuan kursus, event eksklusif, e-book, dan sertifikasi dalam satu langganan.",
  alternates: { canonical: "/berlangganan" },
};

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    badge: null,
    priceMonthly: 99_000,
    priceAnnual: 79_000,
    desc: "Untuk individu yang ingin mulai belajar.",
    color: "var(--brand-cyan)",
    features: [
      "Akses 50+ kursus pilihan",
      "5 e-book per bulan",
      "Sertifikat kelulusan",
      "Forum diskusi komunitas",
      "Update materi bulanan",
    ],
    cta: "Mulai Starter",
    href: "/daftar?plan=starter",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Star,
    badge: "Paling Populer",
    priceMonthly: 199_000,
    priceAnnual: 159_000,
    desc: "Untuk profesional yang serius berkembang.",
    color: "var(--brand-pink-strong)",
    features: [
      "Akses semua kursus (150+)",
      "E-book tanpa batas",
      "Sertifikat bersertifikasi nasional",
      "Akses rekaman semua event",
      "1-on-1 mentoring (2x/bulan)",
      "Download materi offline",
      "Badge profil eksklusif",
    ],
    cta: "Mulai Pro",
    href: "/daftar?plan=pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    badge: null,
    priceMonthly: null,
    priceAnnual: null,
    desc: "Untuk tim & perusahaan dengan kebutuhan khusus.",
    color: "#F59E0B",
    features: [
      "Semua fitur Pro",
      "LMS whitelabel untuk perusahaan",
      "Manajemen tim & progress report",
      "Kursus custom sesuai kebutuhan",
      "Dedicated account manager",
      "SLA & support prioritas",
    ],
    cta: "Hubungi Kami",
    href: "/contact?subject=Enterprise",
  },
];

const FAQS = [
  {
    q: "Apa yang termasuk dalam langganan?",
    a: "Langganan memberikan akses ke kursus, e-book, rekaman event, dan fitur sesuai paket yang dipilih. Kursus baru ditambahkan setiap bulan.",
  },
  {
    q: "Apakah saya bisa upgrade atau downgrade paket?",
    a: "Ya. Kamu bisa upgrade kapan saja dan tagihan akan disesuaikan secara proporsional. Downgrade berlaku di siklus billing berikutnya.",
  },
  {
    q: "Bagaimana metode pembayaran yang tersedia?",
    a: "Kami mendukung transfer bank, kartu kredit/debit, GoPay, OVO, DANA, dan QRIS melalui gateway pembayaran Midtrans.",
  },
  {
    q: "Apakah ada uji coba gratis?",
    a: "Kamu bisa mendaftar gratis dan mengakses konten preview tanpa kartu kredit. Upgrade kapan saja jika ingin akses penuh.",
  },
  {
    q: "Apakah sertifikat termasuk dalam langganan?",
    a: "Semua paket (Starter, Pro, Enterprise) menyertakan sertifikat kelulusan untuk setiap kursus yang diselesaikan. Paket Pro mendapatkan sertifikat bersertifikasi nasional.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function PriceDisplay({
  monthly,
  annual,
  isAnnual,
}: {
  monthly: number | null;
  annual: number | null;
  isAnnual: boolean;
}) {
  if (monthly === null) {
    return (
      <div className="sb-price-custom">
        <span className="sb-price-label">Harga Khusus</span>
        <span className="sb-price-sub">Hubungi tim kami</span>
      </div>
    );
  }
  const price = isAnnual ? annual! : monthly;
  return (
    <div className="sb-price-wrap">
      <span className="sb-price-rp">Rp</span>
      <span className="sb-price-num">{price.toLocaleString("id-ID")}</span>
      <span className="sb-price-per">/bln</span>
      {isAnnual && (
        <span className="sb-price-save">
          Hemat {Math.round((1 - annual! / monthly) * 100)}%
        </span>
      )}
    </div>
  );
}

// ─── Server Component (no useState needed — FAQ uses CSS) ──────────────────

export default function BerlanggananPage() {
  return (
    <main className="sb-root">
      {/* Hero */}
      <section className="sb-hero">
        <div className="sb-hero-inner">
          <span className="sb-eyebrow">💎 Jago Akademi Premium</span>
          <h1 className="sb-hero-title">
            Satu Langganan,<br />
            <span className="sb-hero-gradient">Akses Semua Konten</span>
          </h1>
          <p className="sb-hero-desc">
            Ratusan kursus, ribuan e-book, rekaman event eksklusif, mentoring,
            dan sertifikasi — semuanya dalam satu paket terjangkau.
          </p>

          {/* Stats row */}
          <div className="sb-stats">
            {[
              { val: "150+", label: "Kursus aktif" },
              { val: "50+", label: "Mentor expert" },
              { val: "10rb+", label: "Pelajar aktif" },
              { val: "98%", label: "Kepuasan pengguna" },
            ].map((s) => (
              <div key={s.label} className="sb-stat-item">
                <span className="sb-stat-val">{s.val}</span>
                <span className="sb-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="sb-hero-glow" aria-hidden="true" />
      </section>

      {/* Billing toggle hint */}
      <section className="sb-billing-note">
        <span className="sb-billing-badge">💡 Bayar tahunan lebih hemat hingga 20%</span>
      </section>

      {/* Plans */}
      <section className="sb-plans-section">
        <div className="sb-plans-grid">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.id}
                className={`sb-plan-card ${plan.badge ? "sb-plan-featured" : ""}`}
                style={{ "--plan-color": plan.color } as React.CSSProperties}
              >
                {plan.badge && (
                  <div className="sb-plan-badge">{plan.badge}</div>
                )}
                <div className="sb-plan-header">
                  <div className="sb-plan-icon-wrap">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="sb-plan-name">{plan.name}</h2>
                    <p className="sb-plan-desc">{plan.desc}</p>
                  </div>
                </div>

                <div className="sb-plan-price-area">
                  <PriceDisplay
                    monthly={plan.priceMonthly}
                    annual={plan.priceAnnual}
                    isAnnual={false}
                  />
                  {plan.priceMonthly && (
                    <p className="sb-plan-annual-note">
                      atau Rp {plan.priceAnnual!.toLocaleString("id-ID")}/bln jika bayar tahunan
                    </p>
                  )}
                </div>

                <ul className="sb-features">
                  {plan.features.map((f) => (
                    <li key={f} className="sb-feature-item">
                      <CheckCircle2 size={15} className="sb-feature-icon" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className={`sb-cta-btn ${plan.badge ? "sb-cta-featured" : "sb-cta-default"}`}>
                  {plan.cta}
                </Link>
              </article>
            );
          })}
        </div>

        <p className="sb-plans-note">
          Semua paket dilengkapi garansi uang kembali 7 hari.{" "}
          <Link href="/contact" className="sb-plans-link">Butuh bantuan memilih?</Link>
        </p>
      </section>

      {/* Feature comparison banner */}
      <section className="sb-compare">
        <div className="sb-compare-inner">
          <h2 className="sb-compare-title">Sudah berlangganan?</h2>
          <p className="sb-compare-desc">
            Akses langsung dashboard kamu untuk melihat status dan riwayat langganan.
          </p>
          <Link href="/dashboard/berlangganan" className="sb-compare-btn">
            Lihat Status Langganan →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="sb-faq-section">
        <div className="sb-faq-inner">
          <h2 className="sb-faq-title">Pertanyaan Umum</h2>
          <div className="sb-faq-list">
            {FAQS.map((faq, i) => (
              <details key={i} className="sb-faq-item">
                <summary className="sb-faq-q">
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="sb-faq-chevron" />
                </summary>
                <p className="sb-faq-a">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="sb-bottom-cta">
        <div className="sb-bottom-cta-inner">
          <h2 className="sb-bottom-title">Mulai belajar hari ini, gratis</h2>
          <p className="sb-bottom-desc">
            Daftar gratis, jelajahi konten preview, upgrade kapan saja.
          </p>
          <div className="sb-bottom-btns">
            <Link href="/daftar" className="sb-btn-primary">Daftar Gratis</Link>
            <Link href="/e-course" className="sb-btn-outline">Jelajahi Kursus</Link>
          </div>
        </div>
      </section>

      <style>{`
        .sb-root {
          min-height: 100vh;
          background: var(--surface-page, #0a1628);
          color: var(--text-primary, #fff);
          font-family: var(--font-body, 'Inter', sans-serif);
        }

        /* Hero */
        .sb-hero {
          position: relative;
          overflow: hidden;
          padding: 96px 24px 64px;
          text-align: center;
          background: linear-gradient(180deg, #050d1a 0%, #0a1628 100%);
        }
        .sb-hero-inner { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; }
        .sb-hero-glow {
          position: absolute;
          top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 600px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0,119,168,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .sb-eyebrow {
          display: inline-block;
          font-size: 13px; font-weight: 600; letter-spacing: 0.05em;
          color: var(--brand-cyan, #00d4ff);
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 100px; padding: 4px 14px;
          margin-bottom: 20px;
        }
        .sb-hero-title {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800; line-height: 1.15;
          letter-spacing: -0.03em;
          color: #fff; margin-bottom: 20px;
        }
        .sb-hero-gradient {
          background: linear-gradient(135deg, #00d4ff, #cc0052);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sb-hero-desc {
          font-size: 1.05rem; line-height: 1.7;
          color: rgba(255,255,255,0.62);
          max-width: 560px; margin: 0 auto 36px;
        }
        .sb-stats {
          display: flex; justify-content: center; gap: 0;
          flex-wrap: wrap;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; overflow: hidden;
          max-width: 600px; margin: 0 auto;
        }
        .sb-stat-item {
          flex: 1; min-width: 120px;
          padding: 18px 16px; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .sb-stat-item:last-child { border-right: none; }
        .sb-stat-val {
          display: block; font-size: 1.5rem; font-weight: 800;
          color: var(--brand-cyan, #00d4ff);
        }
        .sb-stat-label { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; }

        /* Billing note */
        .sb-billing-note {
          text-align: center; padding: 16px 24px;
          background: rgba(0,212,255,0.04);
          border-top: 1px solid rgba(0,212,255,0.08);
          border-bottom: 1px solid rgba(0,212,255,0.08);
        }
        .sb-billing-badge {
          font-size: 13px; color: rgba(255,255,255,0.6);
        }

        /* Plans */
        .sb-plans-section { padding: 64px 24px 48px; max-width: 1200px; margin: 0 auto; }
        .sb-plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .sb-plan-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
          display: flex; flex-direction: column; gap: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sb-plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .sb-plan-featured {
          border-color: var(--plan-color);
          background: linear-gradient(135deg, rgba(204,0,82,0.08), rgba(0,119,168,0.05));
          box-shadow: 0 0 0 1px var(--plan-color), 0 12px 40px rgba(204,0,82,0.15);
        }
        .sb-plan-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: var(--plan-color);
          color: #fff; font-size: 11px; font-weight: 700;
          padding: 4px 14px; border-radius: 100px;
          letter-spacing: 0.04em; white-space: nowrap;
        }
        .sb-plan-header { display: flex; align-items: flex-start; gap: 14px; }
        .sb-plan-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.07);
          color: var(--plan-color);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sb-plan-name { font-size: 1.2rem; font-weight: 700; color: #fff; }
        .sb-plan-desc { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 2px; }

        /* Price */
        .sb-plan-price-area { }
        .sb-price-wrap { display: flex; align-items: baseline; gap: 4px; }
        .sb-price-rp { font-size: 14px; color: rgba(255,255,255,0.5); font-weight: 500; }
        .sb-price-num {
          font-size: 2rem; font-weight: 800; color: #fff;
          font-variant-numeric: tabular-nums;
        }
        .sb-price-per { font-size: 13px; color: rgba(255,255,255,0.45); }
        .sb-price-save {
          margin-left: 8px; font-size: 11px; font-weight: 700;
          color: #22c55e;
          background: rgba(34,197,94,0.12); border-radius: 100px;
          padding: 2px 8px;
        }
        .sb-price-custom { }
        .sb-price-label { display: block; font-size: 1.5rem; font-weight: 800; color: #fff; }
        .sb-price-sub { font-size: 13px; color: rgba(255,255,255,0.45); }
        .sb-plan-annual-note { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 6px; }

        /* Features */
        .sb-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .sb-feature-item { display: flex; align-items: flex-start; gap: 9px; font-size: 13.5px; color: rgba(255,255,255,0.75); }
        .sb-feature-icon { flex-shrink: 0; margin-top: 1px; color: var(--plan-color, #00d4ff); }

        /* CTA Buttons */
        .sb-cta-btn {
          display: block; text-align: center;
          padding: 12px 20px; border-radius: 12px;
          font-size: 14px; font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }
        .sb-cta-default {
          background: rgba(255,255,255,0.07);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .sb-cta-default:hover { background: rgba(255,255,255,0.12); }
        .sb-cta-featured {
          background: linear-gradient(135deg, #cc0052, #0077A8);
          color: #fff;
          box-shadow: 0 4px 20px rgba(204,0,82,0.35);
        }
        .sb-cta-featured:hover { opacity: 0.9; transform: translateY(-1px); }

        .sb-plans-note { text-align: center; font-size: 13px; color: rgba(255,255,255,0.4); }
        .sb-plans-link { color: var(--brand-cyan, #00d4ff); text-decoration: underline; }

        /* Compare CTA */
        .sb-compare {
          background: rgba(0,212,255,0.04);
          border-top: 1px solid rgba(0,212,255,0.1);
          border-bottom: 1px solid rgba(0,212,255,0.1);
          padding: 48px 24px; text-align: center;
        }
        .sb-compare-inner { max-width: 560px; margin: 0 auto; }
        .sb-compare-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .sb-compare-desc { color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 20px; }
        .sb-compare-btn {
          display: inline-block;
          background: rgba(0,212,255,0.12);
          color: var(--brand-cyan, #00d4ff);
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 10px; padding: 10px 22px;
          font-size: 14px; font-weight: 600;
          text-decoration: none; transition: all 0.2s;
        }
        .sb-compare-btn:hover { background: rgba(0,212,255,0.2); }

        /* FAQ */
        .sb-faq-section { padding: 72px 24px; }
        .sb-faq-inner { max-width: 720px; margin: 0 auto; }
        .sb-faq-title {
          font-size: 1.75rem; font-weight: 700; color: #fff;
          text-align: center; margin-bottom: 40px;
        }
        .sb-faq-list { display: flex; flex-direction: column; gap: 12px; }
        .sb-faq-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; overflow: hidden;
        }
        .sb-faq-item[open] { border-color: rgba(0,212,255,0.2); }
        .sb-faq-q {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px;
          font-size: 14px; font-weight: 600; color: #fff;
          cursor: pointer; list-style: none;
          gap: 12px;
        }
        .sb-faq-q::-webkit-details-marker { display: none; }
        .sb-faq-chevron {
          flex-shrink: 0; color: rgba(255,255,255,0.4);
          transition: transform 0.25s;
        }
        .sb-faq-item[open] .sb-faq-chevron { transform: rotate(180deg); }
        .sb-faq-a {
          padding: 0 20px 18px;
          font-size: 13.5px; line-height: 1.7;
          color: rgba(255,255,255,0.55);
        }

        /* Bottom CTA */
        .sb-bottom-cta {
          background: linear-gradient(135deg, #050d1a, #0d1f3c);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 80px 24px; text-align: center;
        }
        .sb-bottom-cta-inner { max-width: 560px; margin: 0 auto; }
        .sb-bottom-title { font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 12px; }
        .sb-bottom-desc { color: rgba(255,255,255,0.5); font-size: 15px; margin-bottom: 32px; }
        .sb-bottom-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .sb-btn-primary {
          display: inline-block; padding: 13px 28px;
          background: linear-gradient(135deg, #0077A8, #cc0052);
          color: #fff; font-size: 14px; font-weight: 700;
          border-radius: 12px; text-decoration: none;
          box-shadow: 0 4px 20px rgba(0,119,168,0.35);
          transition: all 0.2s;
        }
        .sb-btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
        .sb-btn-outline {
          display: inline-block; padding: 13px 28px;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 14px; font-weight: 600;
          border-radius: 12px; text-decoration: none;
          transition: all 0.2s;
        }
        .sb-btn-outline:hover { background: rgba(255,255,255,0.1); }

        @media (max-width: 640px) {
          .sb-hero { padding: 72px 16px 48px; }
          .sb-hero-title { font-size: 1.75rem; }
          .sb-plans-section { padding: 48px 16px 32px; }
          .sb-plans-grid { grid-template-columns: 1fr; }
          .sb-stats { flex-direction: row; }
          .sb-stat-item { min-width: 80px; }
        }
      `}</style>
    </main>
  );
}
