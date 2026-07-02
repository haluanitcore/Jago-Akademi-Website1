import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Paket LMS untuk Perusahaan | Jago Akademi",
  description:
    "Digitalkan program pelatihan dan pengembangan SDM perusahaan Anda dengan LMS B2B Jago Akademi — kelola batch, tugaskan kursus, dan pantau progres karyawan.",
};

// Real product capabilities (no fabricated clients/stats/testimonials — TASK-052).
const CAPABILITIES = [
  { icon: "🏢", title: "Workspace Multi-tenant", desc: "Ruang belajar khusus perusahaan Anda dengan branding sendiri." },
  { icon: "👥", title: "Kelola Batch & Peserta", desc: "Undang karyawan, kelompokkan ke batch, dan tugaskan kursus." },
  { icon: "📊", title: "Laporan Progres", desc: "Pantau completion rate dan kemajuan belajar tim secara real-time." },
  { icon: "🎓", title: "Sertifikat Perusahaan", desc: "Terbitkan sertifikat kelulusan ber-branding institusi Anda." },
];

export default function ClientsPage() {
  return (
    <main id="main-content">
      {/* Hero */}
      <section className="bg-[#F5F5F7] pt-20 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#CC0052]">Paket LMS B2B</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F]">
            Pelatihan Karyawan, Terpusat &amp; Terukur
          </h1>
          <p className="text-lg text-[#6E6E73]">
            Digitalkan program pengembangan SDM perusahaan Anda dalam satu platform.
            Jago Akademi baru saja dibuka — jadilah salah satu institusi pertama yang bergabung.
          </p>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1D1D1F] text-center mb-12">Yang Anda Dapatkan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="flex gap-4 bg-[#F5F5F7] rounded-2xl p-6">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">{c.title}</p>
                  <p className="text-sm text-[#6E6E73] mt-1">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#1D1D1F] text-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Mulai Program Pelatihan Korporat Anda</h2>
          <p className="text-[#A1A1A6]">
            Konsultasikan kebutuhan pelatihan tim Anda dengan tim kami dan dapatkan proposal yang disesuaikan.
          </p>
          <Link href="/contact" className="btn-primary inline-block px-8 py-3">
            Hubungi Tim Kami
          </Link>
        </div>
      </section>
    </main>
  );
}
