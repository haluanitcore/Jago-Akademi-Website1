import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Jago Akademi",
  description: "Kebijakan privasi Jago Akademi — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda sesuai UU PDP.",
};

const sections = [
  {
    h: "1. Data yang Kami Kumpulkan",
    p: "Kami mengumpulkan data yang Anda berikan saat mendaftar dan menggunakan layanan: nama, email, kata sandi (terenkripsi), nomor telepon (opsional), serta data profil yang Anda isi. Kami juga mencatat data teknis (alamat IP, perangkat) untuk keamanan.",
  },
  {
    h: "2. Dasar & Tujuan Penggunaan",
    p: "Data digunakan untuk menyediakan layanan (akun, kursus, pembayaran, sertifikat), mengirim notifikasi transaksional, serta menjaga keamanan. Pemrosesan dilakukan atas dasar persetujuan Anda dan pelaksanaan kontrak layanan.",
  },
  {
    h: "3. Persetujuan",
    p: "Dengan mendaftar, Anda menyetujui kebijakan ini. Anda dapat menarik persetujuan kapan saja dengan menghapus akun; sebagian data transaksi tetap disimpan untuk memenuhi kewajiban hukum/keuangan.",
  },
  {
    h: "4. Hak Anda (UU PDP)",
    p: "Anda berhak mengakses, memperbaiki, dan menghapus data pribadi Anda. Perbaikan profil tersedia di dashboard; penghapusan akun akan menganonimkan data pribadi Anda (data keuangan disimpan sesuai kewajiban hukum).",
  },
  {
    h: "5. Keamanan & Penyimpanan",
    p: "Kami menerapkan enkripsi kata sandi, koneksi HTTPS, kontrol akses berbasis peran, dan pembatasan laju. Data disimpan selama diperlukan untuk layanan dan kewajiban hukum.",
  },
  {
    h: "6. Pihak Ketiga & Transfer Data",
    p: "Kami menggunakan penyedia tepercaya untuk pembayaran (DOKU), email, penyimpanan media, dan analitik. Beberapa penyedia dapat memproses data di luar Indonesia; kami memastikan perlindungan yang memadai.",
  },
  {
    h: "7. Kontak",
    p: "Untuk pertanyaan privasi atau permintaan terkait data Anda, hubungi kami melalui halaman Hubungi Kami.",
  },
];

export default function PrivacyPage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-2">Kebijakan Privasi</h1>
      <p className="text-sm text-[#6E6E73] mb-10">Berlaku sejak peluncuran layanan Jago Akademi.</p>
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">{s.h}</h2>
            <p className="text-[#3C3C43] leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
      <p className="text-xs text-[#6E6E73] mt-12 border-t border-[#E5E5EA] pt-6">
        Dokumen ini merupakan ringkasan kebijakan dan dapat diperbarui. Versi final ditinjau oleh penasihat hukum.
      </p>
    </main>
  );
}
