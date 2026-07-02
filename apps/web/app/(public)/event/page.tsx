import Link from "next/link";

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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Event & Workshop</h1>
          <p className="text-violet-100 text-lg max-w-xl mx-auto">
            Tingkatkan keahlian melalui event langsung bersama praktisi terbaik.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🗓️</div>
            <p className="text-lg">Event akan segera hadir.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-8">{meta.total} event tersedia</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/event/${ev.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Cover */}
                  <div className="aspect-video bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center overflow-hidden">
                    {ev.coverUrl ? (
                      <img src={ev.coverUrl} alt={ev.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🎤</span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                        {TYPE_LABEL[ev.type] ?? ev.type}
                      </span>
                      {ev.isFeatured && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          Featured
                        </span>
                      )}
                    </div>

                    <h2 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors">
                      {ev.title}
                    </h2>

                    {ev.speakerName && (
                      <p className="text-sm text-gray-500 mb-2">🎙️ {ev.speakerName}</p>
                    )}

                    <p className="text-sm text-gray-600 mb-3">
                      📅 {formatDate(ev.startDate)}
                    </p>

                    {ev.type !== "online" && ev.venue && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-1">📍 {ev.venue}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-violet-600 text-sm">
                        {formatPrice(ev.price, ev.salePrice)}
                      </span>
                      {ev.quota && (
                        <span className="text-xs text-gray-400">
                          {ev.quota - ev.totalSold} tempat tersisa
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
