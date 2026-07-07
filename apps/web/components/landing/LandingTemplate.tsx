import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { LeadCaptureForm } from "@/components/landing/LeadCaptureForm";

type Benefit = { icon: LucideIcon; title: string; body: string };

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  lede: string;
  benefits: Benefit[];
  formSource: "affiliate" | "lms" | "trainer" | "free-class" | "other";
  formTitle: string;
  formLede: string;
  withCompany?: boolean;
  submitLabel?: string;
};

/**
 * Shared marketing landing layout (TASK-040): asymmetric hero with an inline
 * lead-capture form, then a benefits grid. Built on the editorial design
 * system; honest (no fabricated numbers).
 */
export function LandingTemplate({
  eyebrow,
  title,
  lede,
  benefits,
  formSource,
  formTitle,
  formLede,
  withCompany,
  submitLabel,
}: Props) {
  return (
    <div className="pt-16">
      {/* Hero + form */}
      <section className="border-b border-[var(--border-subtle)] bg-white">
        <div className="container-pad grid grid-cols-1 items-start gap-12 py-16 md:py-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow mb-5">{eyebrow}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--text-primary)] text-balance md:text-5xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">{lede}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <p className="mb-1 font-display text-lg font-bold text-[var(--text-primary)]">{formTitle}</p>
              <p className="mb-4 text-sm text-[var(--text-secondary)]">{formLede}</p>
              <LeadCaptureForm source={formSource} withCompany={withCompany} submitLabel={submitLabel} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <Section tone="sunken">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <Reveal key={b.title} delay={(i % 3) * 0.06}>
                <article className="flex gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)] border border-[rgba(0,119,168,0.15)] bg-[var(--surface-accent-soft)] text-[var(--brand-cyan-strong)]">
                    <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)]">{b.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--text-secondary)]">{b.body}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
