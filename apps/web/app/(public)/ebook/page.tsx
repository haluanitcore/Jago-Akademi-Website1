import Link from "next/link";

type EBook = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  coverUrl: string | null;
  author: string | null;
  pages: number | null;
  category: string | null;
};

async function getEBooks(): Promise<EBook[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ebooks?limit=24`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function EBookPage() {
  const ebooks = await getEBooks();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Toko E-Book</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Referensi digital berkualitas untuk mendukung perjalanan belajar Anda.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {ebooks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-lg">E-Book akan segera hadir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {ebooks.map((book) => {
              const displayPrice = book.salePrice ?? book.price;
              return (
                <Link
                  key={book.id}
                  href={`/ebook/${book.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-5xl">📖</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">{book.category ?? "E-Book"}</p>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-xs text-gray-400 mb-2">{book.author}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        Rp {Number(displayPrice).toLocaleString("id-ID")}
                      </span>
                      {book.salePrice && (
                        <span className="text-xs text-gray-400 line-through">
                          Rp {Number(book.price).toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
