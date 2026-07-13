"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth/token";

type Props = {
  ebookId: string;
  ebookSlug: string;
  price: number;
  title: string;
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}


export default function EBookActions({ ebookId, ebookSlug, price }: Props) {
  const router = useRouter();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    // Check if user already owns it
    fetch(`${getApiBase()}/api/ebooks/${ebookId}/file`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setHasPurchased(true);
          setFileUrl(data.data.fileUrl);
        }
      })
      .catch(() => {});
  }, [ebookId]);

  async function handleBuy() {
    router.push(`/checkout/${ebookSlug}?type=ebook`);
  }

  if (hasPurchased && fileUrl) {
    const fullUrl = fileUrl.startsWith("http")
      ? fileUrl
      : `${getApiBase()}${fileUrl}`;
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium">
          ✓ Anda sudah memiliki e-book ini
        </div>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Baca E-Book
        </a>
        <a
          href={fullUrl}
          download
          className="block w-full text-center py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          Unduh PDF
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}
      <button
        onClick={handleBuy}
        disabled={buying}
        className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {buying ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Memproses...
          </>
        ) : (
          `Beli – Rp ${Number(price).toLocaleString("id-ID")}`
        )}
      </button>
      <p className="text-xs text-gray-400 text-center">Akses seumur hidup setelah pembelian</p>
    </div>
  );
}
