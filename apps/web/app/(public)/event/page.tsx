import Link from "next/link";
import { CalendarDays, MapPin, Mic2, Users } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Event = {
  id: string;
  slug: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  venue: string | null;
  price: string;
  salePrice: string | null;
  quota: number | null;
  totalSold: number;
  coverUrl: string | null;
  speakerName: string | null;
  isFeatured: boolean;
};

async function getEvents(): Promise<{ data: Event[]; meta: { total: number } }> {
  try {
    const res = await fetch(`${API}/api/events?limit=24`, { next: { revalidate: 300 } });
    const body = await res.json();
    return body.success ? body : { data: [], meta: { total: 0 } };
  } catch {
    return { data: [], meta: { total: 0 } };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price: string, salePrice: string | null) {
  const num = salePrice ? Number(salePrice) : Number(price);
  if (num === 0) return "Gratis";
  return `Rp ${num.toLocaleString("id-ID")}`;
}

const TYPE_LABEL: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

export default async function EventListPage() {
  const { data: events, meta } = await getEvents();

  return (
    <div className="pt-16">
      <Section>
        <SectionHeader
          eyebrow="Event & Workshop"
          title={
            <>
              Belajar langsung dari <span className="text-accent">praktisi</span>
            </>
          }
          lede="Webinar dan workshop intensif untuk mengasah keahlian bersama ahli di bidangnya."
        />

        {events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Belum ada event terjadwal"
            description="Event dan workshop akan segera hadir. Gabung early access agar tak ketinggalan jadwalnya."
            action={
              <Link href="/early-access" className="btn btn-primary">
                Gabung Early Access
              </Link>
            }
          />
        ) : (
          <>
            <p className="mb-6 text-sm text-[var(--text-muted)]">{meta.total} event tersedia</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev, i) => (
                <Reveal key={ev.id} delay={(i % 3) * 0.05}>
                  <Link
                    href={`/event/${ev.slug}`}
                    className="card group flex h-full flex-col overflow-hidden !p-0"
                  >
                    <div className="border-b border-[var(--border-subtle)]">
                      {ev.coverUrl ? (
                        <img src={ev.coverUrl} alt={ev.title} className="aspect-video w-full object-cover" />
                      ) : (
                        <MediaPlaceholder type="foto" ratio="16:9" showRatio={false} className="!rounded-none !border-0" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-cyan">{TYPE_LABEL[ev.type] ?? ev.type}</span>
                        {ev.isFeatured && <span className="badge badge-pink">Unggulan</span>}
                      </div>

                      <h2 className="font-display text-base font-bold leading-snug text-[var(--text-primary)] transition-colors line-clamp-2 group-hover:text-[var(--brand-cyan-strong)]">
                        {ev.title}
                      </h2>

                      <div className="mt-1 flex flex-col gap-1.5 text-[13px] text-[var(--text-secondary)]">
                        {ev.speakerName && (
                          <span className="inline-flex items-center gap-1.5">
                            <Mic2 size={13} aria-hidden="true" className="text-[var(--text-muted)]" />
                            {ev.speakerName}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} aria-hidden="true" className="text-[var(--text-muted)]" />
                          {formatDate(ev.startDate)}
                        </span>
                        {ev.type !== "online" && ev.venue && (
                          <span className="inline-flex items-center gap-1.5 line-clamp-1">
                            <MapPin size={13} aria-hidden="true" className="text-[var(--text-muted)]" />
                            {ev.venue}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                        <span className="text-sm font-bold text-[var(--brand-cyan-strong)]">
                          {formatPrice(ev.price, ev.salePrice)}
                        </span>
                        {ev.quota && (
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Users size={12} aria-hidden="true" />
                            {ev.quota - ev.totalSold} tersisa
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </Section>
    </div>
  );
}
