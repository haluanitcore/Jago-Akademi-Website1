import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Jago Akademi",
  description: "Syarat dan ketentuan penggunaan layanan Jago Akademi.",
};

const sections = [
  {
    h: "1. Penerimaan Ketentuan",
    p: "Dengan mengakses dan menggunakan Jago Akademi, Anda menyetujui syarat dan ketentuan ini serta Kebijakan Privasi kami.",
  },
  {
    h: "2. Akun",
    p: "Anda bertanggung jawab menjaga kerahasiaan kredensial akun dan atas seluruh aktivitas pada akun Anda. Data yang Anda berikan harus akurat.",
  },
  {
    h: "3. Pembelian & Akses Materi",
    p: "Pembelian kursus/materi memberi Anda lisensi pribadi non-transferable untuk mengakses konten. Konten tidak boleh didistribusikan ulang tanpa izin.",
  },
  {
    h: "4. Pembayaran & Refund",
    p: "Pembayaran diproses melalui penyedia pihak ketiga (DOKU). Kebijakan pengembalian dana mengikuti ketentuan yang berlaku pada masing-masing produk dan akan diinformasikan saat pembelian.",
  },
  {
    h: "5. Konten & Hak Kekayaan Intelektual",
    p: "Seluruh materi di platform dilindungi hak cipta milik Jago Akademi atau pemberi lisensinya. Dilarang menyalin, memodifikasi, atau mendistribusikan tanpa izin tertulis.",
  },
  {
    h: "6. Batasan Tanggung Jawab",
    p: "Layanan disediakan 'sebagaimana adanya'. Kami berupaya menjaga ketersediaan dan kualitas, namun tidak menjamin bebas gangguan sepenuhnya.",
  },
  {
    h: "7. Perubahan Ketentuan",
    p: "Kami dapat memperbarui ketentuan ini. Perubahan material akan diinformasikan melalui platform.",
  },
];

export default function TermsPage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-2">Syarat &amp; Ketentuan</h1>
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
        Dokumen ini merupakan ringkasan ketentuan dan dapat diperbarui. Versi final ditinjau oleh penasihat hukum.
      </p>
    </main>
  );
}
