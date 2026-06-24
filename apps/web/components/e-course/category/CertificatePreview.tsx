import { BookOpen, QrCode, Share2, ExternalLink } from "lucide-react";
import type { Category } from "@/lib/e-course/types";

type CertificatePreviewProps = {
  category: Category;
};

export function CertificatePreview({ category }: CertificatePreviewProps) {
  return (
    <section className="bg-white border-b border-[#E5E5E5] py-10">
      <div className="max-w-[1152px] mx-auto px-8 flex flex-col gap-8">
        <header className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold font-display text-[#1D1D1F]">
            Sertifikat Resmi Jago Akademi
          </h2>
          <p className="text-[#6E6E73] text-sm">
            Selesaikan 80% materi dan dapatkan sertifikat ini
          </p>
        </header>

        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl shadow-e3 p-8 max-w-lg mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0077A8] via-[#00d4ff] to-[#CC0052]" />

          <div className="flex items-center justify-center gap-2 mt-2">
            <BookOpen size={18} className="text-[#0077A8]" />
            <span className="font-display font-bold text-[#0077A8] tracking-wide">
              JAGO AKADEMI
            </span>
          </div>

          <p className="text-center uppercase tracking-widest text-[#1D1D1F] text-sm mt-4">
            Sertifikat Penyelesaian
          </p>

          <h3 className="text-center font-display text-2xl font-bold text-[#1D1D1F] mt-2 leading-tight">
            {category.title}
          </h3>

          <div className="flex flex-col items-center gap-0.5 mt-5">
            <p className="text-[#6E6E73] text-xs">Diberikan kepada</p>
            <p className="italic text-[#0077A8] text-xl font-display">NAMA PESERTA</p>
          </div>

          <div className="grid grid-cols-3 items-end gap-3 mt-8">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#F5F5F7] border border-[#E5E5E5] rounded flex items-center justify-center">
                <QrCode size={24} className="text-[#AEAEB2]" />
              </div>
              <span className="text-[#AEAEB2] text-[10px]">Verifikasi</span>
            </div>

            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-[#6E6E73] text-[10px] uppercase tracking-wide">
                Tanggal
              </span>
              <span className="text-[#1D1D1F] text-xs font-medium">22 Juni 2026</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <span className="font-display text-[#1D1D1F] text-sm italic leading-none">
                Jago
              </span>
              <span className="w-full border-t border-[#1D1D1F] pt-1 text-[#6E6E73] text-[10px]">
                Founder &amp; CEO
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[rgba(0,119,168,0.06)] to-transparent pointer-events-none" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[#6E6E73] text-sm text-center max-w-md">
            Dapat dibagikan ke LinkedIn, CV, dan platform profesional lainnya
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Bagikan ke LinkedIn"
              className="inline-flex items-center gap-1.5 text-[#0077A8] text-sm font-medium px-3 py-1.5 rounded-lg border border-[rgba(0,119,168,0.2)] bg-[rgba(0,119,168,0.04)] hover:bg-[rgba(0,119,168,0.08)] transition-colors cursor-pointer"
            >
              <ExternalLink size={15} aria-hidden="true" />
              LinkedIn
            </button>
            <button
              type="button"
              aria-label="Bagikan sertifikat"
              className="inline-flex items-center gap-1.5 text-[#636366] text-sm font-medium px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F5F5F7] transition-colors cursor-pointer"
            >
              <Share2 size={15} aria-hidden="true" />
              Bagikan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
