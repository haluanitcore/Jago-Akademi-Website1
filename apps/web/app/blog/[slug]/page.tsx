import type { Metadata } from "next";
import BlogArticleClient from "./BlogArticleClient";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Props = {
  params: Promise<{ slug: string }>;
};

// Server-side fetch so crawlers get real metadata even though the article body
// is rendered by a client island (interactive reviews/rating form).
type BlogPostMeta = {
  title: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
};

async function getPost(slug: string): Promise<BlogPostMeta | null> {
  try {
    const res = await fetch(`${API}/api/blog/${slug}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.json();
    return body.success ? (body.data as BlogPostMeta) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Artikel tidak ditemukan — Jago Akademi" };
  }

  const description =
    post.excerpt ?? post.content.slice(0, 160).replace(/\s+/g, " ").trim();

  return {
    title: `${post.title} — Blog Jago Akademi`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      ...(post.coverUrl ? { images: [{ url: post.coverUrl }] } : {}),
    },
  };
}

export default function BlogDetailPage() {
  // The client island reads the slug via useParams and fetches its own data,
  // preserving all existing interactive behavior unchanged.
  return <BlogArticleClient />;
}
