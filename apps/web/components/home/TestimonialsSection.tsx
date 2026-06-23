import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rizky Pratama",
    role: "Digital Marketer",
    company: "Tokopedia",
    avatar: "RP",
    rating: 5,
    text: "Jago Akademi benar-benar mengubah karier saya. Setelah ikut program Trainer, penghasilan saya naik 3x lipat dalam 6 bulan. Materinya praktis dan langsung bisa diterapkan.",
    color: "cyan",
  },
  {
    name: "Sari Dewi",
    role: "HRD Manager",
    company: "Astra International",
    avatar: "SD",
    rating: 5,
    text: "Kami pakai Paket LMS dari Jago Akademi untuk training 500 karyawan. Hasilnya luar biasa — completion rate 94% dan engagement lebih tinggi dari platform lain yang pernah kami coba.",
    color: "pink",
  },
  {
    name: "Budi Santoso",
    role: "Entrepreneur",
    company: "Founder FinTech Startup",
    avatar: "BS",
    rating: 5,
    text: "E-Course tentang financial management-nya sangat komprehensif. Instrukturnya expert, materinya up-to-date, dan sertifikatnya diakui di industri. Worth every rupiah!",
    color: "cyan",
  },
];

const avatarColors: Record<string, string> = {
  cyan: "bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]",
  pink: "bg-[#ff0066]/10 border-[#ff0066]/30 text-[#ff0066]",
};

export function TestimonialsSection() {
  return (
    <section className="section bg-[#0d0d0d]">
      <div className="container-pad">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge badge-cyan mb-4">Testimoni</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Dipercaya ribuan{" "}
            <span className="text-gradient-brand">profesional Indonesia</span>
          </h2>
          <p className="text-[#a3a3a3] max-w-lg mx-auto">
            Bukan sekadar kata-kata. Lihat bagaimana Jago Akademi membantu para
            profesional dan perusahaan tumbuh lebih cepat.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, company, avatar, rating, text, color }) => (
            <div key={name} className="card-glow p-6 flex flex-col gap-5">
              {/* Quote icon */}
              <Quote size={24} className={color === "cyan" ? "text-[#00d4ff]/40" : "text-[#ff0066]/40"} />

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={`star-${i}`} size={14} aria-hidden="true" className="text-amber-400 fill-current" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-[#a3a3a3] leading-relaxed flex-1">
                &ldquo;{text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[color]}`}
                >
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f5f5f5]">{name}</p>
                  <p className="text-xs text-[#525252]">
                    {role} · {company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {[
            { value: "50K+", label: "Pelajar Aktif" },
            { value: "4.9★", label: "Rating Platform" },
            { value: "200+", label: "Kursus & Materi" },
            { value: "500+", label: "Trainer Bersertifikat" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-[#111] px-6 py-5 text-center">
              <p className="text-2xl font-bold font-display text-gradient-cyan">{value}</p>
              <p className="text-xs text-[#737373] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
