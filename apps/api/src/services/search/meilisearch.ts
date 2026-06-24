import { MeiliSearch } from "meilisearch";
import { env } from "../../config/env.js";

let _client: MeiliSearch | null = null;

export function getMeiliClient(): MeiliSearch {
  if (!_client) {
    _client = new MeiliSearch({
      host: env.MEILISEARCH_URL,
      apiKey: env.MEILISEARCH_KEY,
    });
  }
  return _client;
}

export const COURSE_INDEX = "courses";

export async function indexCourse(course: {
  id: string;
  slug: string;
  title: string;
  shortDesc?: string | null;
  description?: string | null;
  status: string;
  categoryName?: string | null;
  level?: string | null;
  price: string | number;
  thumbnailUrl?: string | null;
  avgRating: string | number;
  totalEnrolled: number;
  isFeatured: boolean;
}): Promise<void> {
  try {
    const client = getMeiliClient();
    const index = client.index(COURSE_INDEX);
    await index.addDocuments([
      {
        id: course.id,
        slug: course.slug,
        title: course.title,
        shortDesc: course.shortDesc ?? "",
        description: course.description ?? "",
        status: course.status,
        categoryName: course.categoryName ?? "",
        level: course.level ?? "",
        price: Number(course.price),
        thumbnailUrl: course.thumbnailUrl ?? "",
        avgRating: Number(course.avgRating),
        totalEnrolled: course.totalEnrolled,
        isFeatured: course.isFeatured,
      },
    ]);
  } catch {
    // Meilisearch is optional — indexing failure must never crash the API
  }
}

export async function deleteCourseFromIndex(courseId: string): Promise<void> {
  try {
    const client = getMeiliClient();
    await client.index(COURSE_INDEX).deleteDocument(courseId);
  } catch {
    // silent
  }
}

export async function searchCourses(
  query: string,
  opts?: { limit?: number; offset?: number; filter?: string },
): Promise<{ id: string; slug: string; title: string }[]> {
  try {
    const client = getMeiliClient();
    const result = await client.index(COURSE_INDEX).search(query, {
      limit: opts?.limit ?? 20,
      offset: opts?.offset ?? 0,
      filter: opts?.filter,
      attributesToRetrieve: ["id", "slug", "title", "shortDesc", "thumbnailUrl", "price", "avgRating", "categoryName"],
    });
    return result.hits as { id: string; slug: string; title: string }[];
  } catch {
    return [];
  }
}

export async function ensureCourseIndexSettings(): Promise<void> {
  try {
    const client = getMeiliClient();
    const index = client.index(COURSE_INDEX);
    await index.updateSearchableAttributes(["title", "shortDesc", "description", "categoryName"]);
    await index.updateFilterableAttributes(["status", "categoryName", "level", "isFeatured"]);
    await index.updateSortableAttributes(["price", "avgRating", "totalEnrolled"]);
  } catch {
    // Meilisearch may not be running in all environments
  }
}
