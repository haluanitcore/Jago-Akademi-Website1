import { indexCourse, deleteCourseFromIndex } from "../../services/search/meilisearch.js";
import type { SearchIndexJob } from "../types.js";

/** Keep the Meilisearch course index in sync with the DB. Leaf processor. */
export async function processSearchIndex(job: SearchIndexJob): Promise<void> {
  if (job.type === "index-course") {
    await indexCourse(job.course);
    return;
  }
  await deleteCourseFromIndex(job.courseId);
}
