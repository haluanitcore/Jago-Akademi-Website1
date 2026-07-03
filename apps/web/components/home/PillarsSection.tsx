import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const PILLARS = [
  {
    number: "01",
    title: "Belajar dengan praktik",
    body: "Materi disusun dari studi kasus dan worksheet aplikatif — bukan sekadar teori yang selesai ditonton.",
    rule: "bg-[var(--brand-cyan)]",
  },
  {
    number: "02",
    title: "Dibimbing praktisi",
    body: "Kurikulum dirancang bersama praktisi industri agar relevan dengan kebutuhan kerja hari ini.",
    rule: "bg-[var(--brand-pink)]",
  },
  {
    number: "03",
    title: "Hasil yang terukur",
    body: "Progres tercatat, dan setiap kelulusan menghasilkan sertifikat ber-QR yang bisa diverifikasi publik.",
    rule: "bg-[var(--text-primary)]",
  },
] as const;

/** Three editorial pillars — numbered, each with a distinct accent rule. */
export function PillarsSection() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Cara kami mengajar"
        title={
          <>
            Dirancang untuk <span className="text-accent">hasil</span>, bukan sekadar tontonan
          </>
        }
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.number} delay={i * 0.08}>
            <article className="group">
              <div className="flex items-center gap-4">
                <span className={`h-0.5 w-10 rounded-full transition-all duration-300 group-hover:w-14 ${pillar.rule}`} />
                <span className="font-display text-sm font-bold tracking-[0.1em] text-[var(--text-muted)]">
                  {pillar.number}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {pillar.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--text-secondary)]">{pillar.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
