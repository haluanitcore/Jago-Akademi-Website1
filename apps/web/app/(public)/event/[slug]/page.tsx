import type { Metadata } from "next";
import EventDetailClient from "./EventDetailClient";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Props = {
  params: Promise<{ slug: string }>;
};

// Server-side fetch so crawlers get real metadata even though the interactive
// booking/countdown UI is rendered by a client island.
type EventMeta = {
  title: string;
  description: string | null;
  coverUrl: string | null;
};

async function getEvent(slug: string): Promise<EventMeta | null> {
  try {
    const res = await fetch(`${API}/api/events/${slug}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.json();
    return body.success ? (body.data as EventMeta) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: "Event tidak ditemukan — Jago Akademi" };
  }

  const description =
    event.description?.slice(0, 160).replace(/\s+/g, " ").trim() ??
    `Ikuti ${event.title} bersama Jago Akademi.`;

  return {
    title: `${event.title} — Event Jago Akademi`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "website",
      ...(event.coverUrl ? { images: [{ url: event.coverUrl }] } : {}),
    },
  };
}

export default function EventDetailPage() {
  // The client island reads the slug via useParams and fetches its own data,
  // preserving all existing interactive behavior unchanged.
  return <EventDetailClient />;
}
