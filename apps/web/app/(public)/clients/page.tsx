import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klien Kami | Jago Akademi",
  description:
    "Dipercaya oleh 50+ perusahaan terkemuka di Indonesia untuk program pelatihan dan pengembangan SDM melalui platform LMS Jago Akademi.",
};

const CLIENTS = [
  { name: "Bank BCA", sector: "Perbankan" },
  { name: "Telkom Indonesia", sector: "Telekomunikasi" },
  { name: "Astra International", sector: "Otomotif & Industri" },
  { name: "Tokopedia", sector: "E-Commerce" },
  { name: "Gojek", sector: "Teknologi" },
  { name: "Unilever Indonesia", sector: "FMCG" },
  { name: "Bank Mandiri", sector: "Perbankan" },
  { name: "Pertamina", sector: "Energi" },
  { name: "Indofood", sector: "Makanan & Minuman" },
  { name: "Garuda Indonesia", sector: "Penerbangan" },
  { name: "BRI", sector: "Perbankan" },
  { name: "XL Axiata", sector: "Telekomunikasi" },
];

const TESTIMONIALS = [
  {
    quote:
      "Jago Akademi membantu kami mendigitalisasi program pelatihan internal. Hasil kuantifikasi kompetensi karyawan meningkat 40% dalam 6 bulan.",
    name: "Rina Kusuma",
    role: "HR Director",
    company: "PT. Maju Bersama",
  },
  {
    quote:
      "Platform LMS-nya sangat intuitif. Tim kami bisa onboard dalam 2 hari dan langsung produktif. Support timnya juga sangat responsif.",
    name: "Budi Santoso",
    role: "Learning & Development Manager",
    company: "TechCorp Indonesia",
  },
  {
    quote:
      "Kami berhasil mengupskill 500 karyawan dalam 3 bulan dengan biaya 60% lebih hemat dibanding pelatihan konvensional.",
    name: "Dewi Anggraini",
    role: "Chief People Officer",
    company: "Startup Nusantara",
  },
];

const STATS = [
  { value: "50+", label: "Klien Korporat" },
  { value: "15.000+", label: "Karyawan Terlatih" },
  { value: "95%", label: "Tingkat Kepuasan" },
  { value: "60%", label: "Penghematan Biaya Pelatihan" },
];

export default function ClientsPage() {
  return (
    <main id="main-content">
      {/* Hero */}
      <section className="bg-[#F5F5F7] pt-20 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#CC0052]">Klien Kami</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F]">
            Dipercaya Perusahaan Terkemuka di Indonesia
          </h1>
          <p className="text-lg text-[#6E6E73]">
            Lebih dari 50 perusahaan dari berbagai industri telah mempercayakan program pengembangan SDM
            mereka kepada Jago Akademi.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0077A8] py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center text-white">
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-white/80 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Client grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1D1D1F] text-center mb-12">Perusahaan yang Mempercayai Kami</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CLIENTS.map((client) => (
              <div
                key={client.name}
                className="bg-[#F5F5F7] rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0077A8] to-[#CC0052] flex items-center justify-center text-white font-bold text-lg">
                  {client.name.charAt(0)}
                </div>
                <p className="font-semibold text-sm text-[#1D1D1F]">{client.name}</p>
                <p className="text-xs text-[#6E6E73]">{client.sector}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#F5F5F7]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1D1D1F] text-center mb-12">Apa Kata Mereka</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-[#E5E5EA]">
                <p className="text-[#3C3C43] leading-relaxed text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="border-t border-[#E5E5EA] pt-4">
                  <p className="font-semibold text-sm text-[#1D1D1F]">{t.name}</p>
                  <p className="text-xs text-[#6E6E73]">{t.role}</p>
                  <p className="text-xs text-[#0077A8] font-medium">{t.company}</p>
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
          <a href="/contact" className="btn-primary inline-block px-8 py-3">
            Hubungi Tim Sales
          </a>
        </div>
      </section>
    </main>
  );
}
