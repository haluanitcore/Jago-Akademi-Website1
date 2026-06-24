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
  cyan: "bg-[rgba(0,212,255,0.08)] border-[rgba(0,119,168,0.25)] text-[#0077A8]",
  pink: "bg-[rgba(255,0,102,0.07)] border-[rgba(204,0,82,0.25)] text-[#CC0052]",
};

export function TestimonialsSection() {
  return (
    <section className="section bg-[#F5F5F7]">
      <div className="container-pad">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge badge-cyan mb-4">Testimoni</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Dipercaya ribuan{" "}
            <span className="text-gradient-brand">profesional Indonesia</span>
          </h2>
          <p className="text-[#636366] max-w-lg mx-auto">
            Bukan sekadar kata-kata. Lihat bagaimana Jago Akademi membantu para
            profesional dan perusahaan tumbuh lebih cepat.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, company, avatar, rating, text, color }) => (
            <div key={name} className="card-glow p-6 flex flex-col gap-5">
              {/* Quote icon */}
              <Quote
                size={24}
                className={color === "cyan" ? "text-[#0077A8]/25" : "text-[#CC0052]/25"}
              />

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={`star-${i}`} size={14} aria-hidden="true" className="text-amber-400 fill-current" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-[#636366] leading-relaxed flex-1">
                &ldquo;{text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#EFEFEF]">
                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[color]}`}
                >
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1D1D1F]">{name}</p>
                  <p className="text-xs text-[#6E6E73]">
                    {role} · {company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5] rounded-2xl overflow-hidden border border-[#E5E5E5]">
          {[
            { value: "50K+", label: "Pelajar Aktif" },
            { value: "4.9★", label: "Rating Platform" },
            { value: "200+", label: "Kursus & Materi" },
            { value: "500+", label: "Trainer Bersertifikat" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white px-6 py-5 text-center">
              <p className="text-2xl font-bold font-display text-gradient-cyan">{value}</p>
              <p className="text-xs text-[#636366] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
