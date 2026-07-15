import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import EBookActions from "./EBookActions";

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
  totalSold: number;
};

async function getEBook(slug: string): Promise<EBook | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ebooks/${slug}`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export default async function EBookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getEBook(slug);
  if (!book) notFound();

  const displayPrice = book.salePrice ?? book.price;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-sm text-gray-400 mb-8">
          <Link href="/ebook" className="hover:text-gray-600">E-Book</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{book.title}</span>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          {/* Cover */}
          <div className="md:col-span-2">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
              {book.coverUrl ? (
                <Image src={book.coverUrl} alt={book.title} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
              ) : (
                <span className="text-8xl">📖</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-3">
            {book.category && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {book.category}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">{book.title}</h1>
            {book.author && <p className="text-gray-500 mb-4">oleh {book.author}</p>}

            {book.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{book.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              {book.pages && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Halaman</p>
                  <p className="font-semibold text-gray-900">{book.pages}</p>
                </div>
              )}
              {book.totalSold > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Terjual</p>
                  <p className="font-semibold text-gray-900">{book.totalSold.toLocaleString("id-ID")}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  Rp {Number(displayPrice).toLocaleString("id-ID")}
                </span>
                {book.salePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    Rp {Number(book.price).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              <EBookActions ebookId={book.id} ebookSlug={book.slug} price={displayPrice} title={book.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
