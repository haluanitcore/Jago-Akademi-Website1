import type { Metadata } from "next";
import FaqAccordion from "./FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — Pertanyaan Umum",
  description:
    "Temukan jawaban atas pertanyaan umum seputar Jago Akademi — cara beli kursus, sertifikat, pembayaran, refund, dan lainnya.",
};

export const FAQ_ITEMS = [
  {
    category: "Umum",
    items: [
      {
        q: "Apa itu Jago Akademi?",
        a: "Jago Akademi adalah platform edukasi digital yang menyediakan e-course video, e-book, event pelatihan, dan program trainer bersertifikat dalam satu ekosistem terintegrasi.",
      },
      {
        q: "Apakah saya perlu mendaftar untuk mengakses konten?",
        a: "Beberapa konten preview tersedia tanpa login. Namun untuk mengakses kursus penuh, Anda perlu membuat akun dan melakukan pembelian.",
      },
    ],
  },
  {
    category: "Pembelian & Pembayaran",
    items: [
      {
        q: "Metode pembayaran apa yang diterima?",
        a: "Kami menerima Transfer Bank (Virtual Account), QRIS, dan Kartu Kredit/Debit melalui gateway pembayaran DOKU yang aman.",
      },
      {
        q: "Apakah ada biaya berlangganan?",
        a: "Model kami adalah pay-per-course — Anda membeli kursus yang ingin dipelajari tanpa biaya berlangganan bulanan. E-Book tersedia sebagai benefit premium.",
      },
      {
        q: "Bagaimana cara menggunakan voucher diskon?",
        a: "Masukkan kode voucher pada halaman checkout sebelum melakukan pembayaran. Voucher berlaku sekali pakai per akun untuk pembelian yang ditentukan.",
      },
    ],
  },
  {
    category: "Kursus & Pembelajaran",
    items: [
      {
        q: "Berapa lama saya bisa mengakses kursus setelah membeli?",
        a: "Akses kursus bersifat seumur hidup (lifetime access). Setelah membeli, Anda bisa belajar kapan saja tanpa batas waktu.",
      },
      {
        q: "Apakah kursus bisa diakses di perangkat mobile?",
        a: "Ya, platform kami responsif dan dapat diakses melalui browser di smartphone, tablet, maupun desktop.",
      },
      {
        q: "Bagaimana sistem progres belajar bekerja?",
        a: "Sistem otomatis melacak video yang sudah Anda tonton dan quiz yang sudah dikerjakan. Progres tersimpan secara real-time dan bisa dilanjutkan dari mana saja.",
      },
    ],
  },
  {
    category: "Sertifikat",
    items: [
      {
        q: "Bagaimana cara mendapatkan sertifikat?",
        a: "Sertifikat diberikan otomatis setelah Anda menyelesaikan minimal 80% dari seluruh materi kursus. Sertifikat dalam format PDF dan dapat diunduh kapan saja.",
      },
      {
        q: "Apakah sertifikat bisa diverifikasi?",
        a: "Ya, setiap sertifikat memiliki kode unik dan QR code yang bisa dipindai untuk verifikasi keaslian di halaman verify.jagoakademi.com.",
      },
      {
        q: "Bisakah saya membagikan sertifikat ke LinkedIn?",
        a: "Tentu! Tersedia tombol berbagi langsung ke LinkedIn dari halaman sertifikat Anda.",
      },
    ],
  },
  {
    category: "Refund",
    items: [
      {
        q: "Apakah pembelian kursus bisa di-refund?",
        a: "Refund dapat diajukan dengan mengirimkan bukti pembelian dan alasan yang reasonable kepada tim kami. Setiap permintaan diproses manual dalam 3–5 hari kerja.",
      },
      {
        q: "Bagaimana cara mengajukan refund?",
        a: "Hubungi tim support kami melalui halaman Kontak dengan menyertakan nomor order dan alasan refund. Tim kami akan merespons dalam 1 hari kerja.",
      },
    ],
  },
  {
    category: "Korporat & LMS",
    items: [
      {
        q: "Apakah ada paket untuk perusahaan?",
        a: "Ya! Kami memiliki paket LMS untuk korporat dengan fitur manajemen karyawan, laporan progres, dan konten yang dapat dikustomisasi. Hubungi tim sales kami.",
      },
      {
        q: "Berapa minimal pengguna untuk paket korporat?",
        a: "Paket korporat tersedia mulai dari 10 pengguna hingga unlimited. Harga disesuaikan dengan jumlah pengguna dan kebutuhan spesifik organisasi Anda.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main id="main-content">
      <section className="bg-[#F5F5F7] pt-20 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#CC0052]">FAQ</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F]">Pertanyaan yang Sering Ditanyakan</h1>
          <p className="text-[#6E6E73]">
            Tidak menemukan jawaban yang Anda cari?{" "}
            <a href="/contact" className="text-[#0077A8] hover:underline">
              Hubungi kami
            </a>
            .
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-10">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </main>
  );
}
