import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami | Jago Akademi",
  description:
    "Jago Akademi adalah platform edukasi digital yang mengintegrasikan e-course, event, e-book, dan program trainer dalam satu ekosistem belajar.",
};

// Real product offerings (no fabricated metrics — TASK-052).
const STATS = [
  { value: "E-Course", label: "Kursus online bersertifikat" },
  { value: "Event", label: "Webinar & workshop" },
  { value: "LMS B2B", label: "Untuk perusahaan" },
  { value: "Trainer", label: "Program sertifikasi" },
];

const VALUES = [
  {
    icon: "🎯",
    title: "Relevan",
    desc: "Kurikulum dirancang bersama praktisi industri sehingga selalu relevan dengan kebutuhan dunia kerja.",
  },
  {
    icon: "🤝",
    title: "Terpercaya",
    desc: "Setiap trainer melewati proses seleksi ketat. Kami menjamin kualitas pembelajaran yang konsisten.",
  },
  {
    icon: "🚀",
    title: "Aksesibel",
    desc: "Belajar kapan saja, di mana saja. Platform kami dirancang untuk memaksimalkan fleksibilitas Anda.",
  },
  {
    icon: "💡",
    title: "Berdampak",
    desc: "Kami mengukur keberhasilan dari karier dan pertumbuhan nyata yang dialami pelajar kami.",
  },
];

export default function AboutPage() {
  return (
    <main id="main-content">
      {/* Hero */}
      <section className="bg-[#F5F5F7] pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight">
            Membangun Indonesia yang <span className="text-[#0077A8]">Lebih Kompeten</span>
          </h1>
          <p className="text-lg text-[#6E6E73] max-w-2xl mx-auto">
            Jago Akademi hadir untuk menjembatani kesenjangan antara dunia pendidikan dan kebutuhan industri,
            melalui ekosistem belajar yang terintegrasi dan berorientasi pada hasil nyata.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-[#E5E5EA]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-[#0077A8]">{s.value}</p>
              <p className="text-sm text-[#6E6E73] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 bg-[#F5F5F7]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#CC0052]">Misi Kami</p>
            <h2 className="text-3xl font-bold text-[#1D1D1F]">
              Pendidikan Berkualitas untuk Semua Orang Indonesia
            </h2>
            <p className="text-[#6E6E73] leading-relaxed">
              Kami percaya bahwa setiap orang berhak mendapat akses ke pendidikan berkualitas tinggi yang
              relevan dengan kebutuhan karier mereka. Jago Akademi menghadirkan pengalaman belajar yang
              terstruktur, praktis, dan didukung oleh komunitas yang solid.
            </p>
            <p className="text-[#6E6E73] leading-relaxed">
              Dengan memadukan teknologi terkini dan keahlian para praktisi terbaik, kami membantu individu
              dan organisasi berkembang lebih cepat di era digital ini.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#0077A8] to-[#CC0052] rounded-2xl p-8 text-white space-y-4">
            <p className="text-2xl font-bold">Visi 2030</p>
            <p className="text-white/90 leading-relaxed">
              Menjadi platform edukasi digital #1 di Indonesia yang menghasilkan 1 juta tenaga profesional
              kompeten dan berkontribusi pada pertumbuhan ekonomi digital nasional.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#CC0052] mb-2">Nilai Kami</p>
            <h2 className="text-3xl font-bold text-[#1D1D1F]">Apa yang Mendorong Kami</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-[#F5F5F7] rounded-2xl p-6 space-y-3">
                <span className="text-3xl" role="img" aria-label={v.title}>{v.icon}</span>
                <h3 className="font-semibold text-[#1D1D1F]">{v.title}</h3>
                <p className="text-sm text-[#6E6E73] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#1D1D1F] text-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Bergabunglah Bersama Kami</h2>
          <p className="text-[#A1A1A6]">
            Mulai perjalanan belajar Anda hari ini dan jadilah bagian dari komunitas profesional yang terus berkembang.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/daftar" className="btn-primary px-8 py-3">
              Mulai Belajar Gratis
            </a>
            <a href="/contact" className="px-8 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors">
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
