"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { BookMarked, Search, X, Tag } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type EBook = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: string;
  salePrice: string | null;
  coverUrl: string | null;
  author: string | null;
  pages: number | null;
  category: string | null;
  totalSold: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: string, salePrice: string | null) {
  const num = salePrice ? Number(salePrice) : Number(price);
  if (num === 0) return "Gratis";
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function getDiscount(price: string, salePrice: string | null): number | null {
  if (!salePrice) return null;
  const orig = Number(price);
  const sale = Number(salePrice);
  if (orig <= 0 || sale >= orig) return null;
  return Math.round(((orig - sale) / orig) * 100);
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card overflow-hidden !p-0">
      <div className="skeleton" style={{ aspectRatio: "3/4" }} />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton mt-1 h-5 w-24" />
      </div>
    </div>
  );
}

// ─── E-Book card ──────────────────────────────────────────────────────────────

function EBookCard({ book }: { book: EBook }) {
  const discount = getDiscount(book.price, book.salePrice);
  const saleNum = book.salePrice ? Number(book.salePrice) : Number(book.price);

  return (
    <Link
      href={`/ebook/${book.slug}`}
      className="card group flex flex-col overflow-hidden !p-0"
      aria-label={book.title}
    >
      {/* Cover */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "3/4" }}
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3"
            style={{ background: "linear-gradient(135deg, var(--surface-accent-soft) 0%, rgba(124,58,237,0.06) 100%)" }}
          >
            <BookMarked
              size={40}
              aria-hidden="true"
              style={{ color: "var(--brand-cyan-strong)", opacity: 0.6 }}
            />
            <p
              className="px-4 text-center text-xs font-semibold leading-tight"
              style={{ color: "var(--text-secondary)" }}
            >
              {book.title}
            </p>
          </div>
        )}

        {/* Discount badge */}
        {discount && (
          <span
            className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{ background: "var(--brand-pink)", color: "#fff" }}
          >
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {book.category && (
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--brand-cyan-strong)" }}>
            {book.category}
          </p>
        )}
        <h3
          className="font-display text-sm font-bold leading-snug text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--brand-cyan-strong)] transition-colors"
        >
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{book.author}</p>
        )}

        <div className="mt-auto pt-2">
          {book.salePrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold" style={{ color: "var(--brand-cyan-strong)" }}>
                {`Rp ${Number(book.salePrice).toLocaleString("id-ID")}`}
              </span>
              <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                {`Rp ${Number(book.price).toLocaleString("id-ID")}`}
              </span>
            </div>
          ) : (
            <span className="text-base font-bold" style={{ color: saleNum === 0 ? "#16A34A" : "var(--brand-cyan-strong)" }}>
              {formatPrice(book.price, book.salePrice)}
            </span>
          )}
          {book.pages && (
            <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{book.pages} halaman</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Marketplace catalog (client component for filtering) ─────────────────────

function MarketplaceCatalog() {
  const [books, setBooks] = useState<EBook[] | null>(null);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fetchBooks(q: string, cat: string) {
    setBooks(null);
    const qs = new URLSearchParams({ limit: "24" });
    if (cat) qs.set("category", cat);

    fetch(`${API}/api/ebooks?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) {
          let data: EBook[] = Array.isArray(d.data) ? d.data : [];
          // Client-side text filter when API doesn't support ?q=
          if (q) {
            const lq = q.toLowerCase();
            data = data.filter(
              (b) =>
                b.title.toLowerCase().includes(lq) ||
                (b.author?.toLowerCase().includes(lq)) ||
                (b.category?.toLowerCase().includes(lq)),
            );
          }
          setBooks(data);
          setTotal(d.meta?.total ?? data.length);

          // Collect unique categories
          const cats = [...new Set(data.map((b) => b.category).filter(Boolean))] as string[];
          if (cats.length > 0) setCategories(cats);
        } else {
          setBooks([]);
          setTotal(0);
        }
      })
      .catch(() => { setBooks([]); setTotal(0); });
  }

  useEffect(() => {
    fetchBooks("", "");
  }, []);

  function handleSearch(q: string) {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchBooks(q, activeCategory), 350);
  }

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    fetchBooks(query, cat);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">

      {/* Section header */}
      <div className="mb-8">
        <p className="eyebrow mb-3">Marketplace</p>
        <h1
          className="mb-3 text-4xl font-extrabold tracking-tight"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
        >
          E-Book & Modul <span className="text-accent">Eksklusif</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Beli e-book, modul, dan materi digital langsung dari trainer dan kreator terbaik Jago Akademi. Akses seumur hidup, download kapan saja.
        </p>
      </div>

      {/* Features strip */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: "📥", text: "Download PDF" },
          { icon: "♾️", text: "Akses Seumur Hidup" },
          { icon: "💳", text: "Bayar Sekali" },
          { icon: "⭐", text: "Konten Terkurasi" },
        ].map((f) => (
          <div
            key={f.text}
            className="flex items-center gap-2.5 rounded-xl p-3"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-e1)" }}
          >
            <span className="text-xl">{f.icon}</span>
            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="mb-7 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative" style={{ minWidth: "220px", maxWidth: "360px", flex: 1 }}>
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
          <input
            id="marketplace-search-input"
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari e-book atau modul..."
            className="input-dark w-full pl-9 pr-8"
            aria-label="Cari e-book"
          />
          {query && (
            <button
              id="marketplace-search-clear-btn"
              onClick={() => handleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors hover:bg-[var(--border-subtle)]"
              aria-label="Hapus pencarian"
            >
              <X size={14} style={{ color: "var(--text-muted)" }} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              id="marketplace-cat-all-btn"
              onClick={() => handleCategory("")}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all"
              style={
                activeCategory === ""
                  ? { background: "var(--brand-cyan)", color: "var(--text-on-accent)" }
                  : { background: "var(--surface-card)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }
              }
            >
              <Tag size={12} aria-hidden="true" />
              Semua
            </button>
            {categories.map((cat) => (
              <button
                id={`marketplace-cat-${cat.toLowerCase().replace(/\s+/g, "-")}-btn`}
                key={cat}
                onClick={() => handleCategory(cat)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all"
                style={
                  activeCategory === cat
                    ? { background: "var(--brand-cyan)", color: "var(--text-on-accent)" }
                    : { background: "var(--surface-card)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {books !== null && (
        <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
          {books.length > 0 ? `${books.length} produk tersedia` : ""}
          {query && ` untuk "${query}"`}
        </p>
      )}

      {/* Grid */}
      {books === null ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-2xl py-16 text-center"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "var(--surface-accent-soft)" }}
          >
            <BookMarked size={32} style={{ color: "var(--brand-cyan-strong)" }} />
          </div>
          <div>
            <h2 className="mb-1 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {query ? `Tidak ada hasil untuk "${query}"` : "E-Book segera hadir"}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {query ? "Coba kata kunci lain atau hapus filter." : "Kami sedang menyiapkan koleksi e-book terbaik untukmu."}
            </p>
          </div>
          {query && (
            <button onClick={() => handleSearch("")} className="btn btn-outline btn-sm">
              Hapus Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((book) => <EBookCard key={book.id} book={book} />)}
        </div>
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100vh" }}>
      <MarketplaceCatalog />
    </div>
  );
}
