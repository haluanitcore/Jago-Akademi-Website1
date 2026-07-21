import { prisma } from "../../db/prisma.js";
import { searchCourses } from "../search/meilisearch.js";
import { enqueueSearchIndex } from "../../jobs/queues.js";

export type CourseListFilter = {
  categorySlug?: string;
  level?: string;
  q?: string;
  featured?: boolean;
  status?: string;
  format?: "regular" | "private_class";
  page?: number;
  limit?: number;
};

const COURSE_SELECT = {
  id: true,
  slug: true,
  title: true,
  shortDesc: true,
  price: true,
  salePrice: true,
  status: true,
  level: true,
  thumbnailUrl: true,
  totalDuration: true,
  totalLessons: true,
  totalEnrolled: true,
  avgRating: true,
  totalReviews: true,
  isFeatured: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  trainer: { select: { id: true, name: true, avatarUrl: true } },
} as const;

export async function listCourses(filter: CourseListFilter = {}) {
  const { categorySlug, level, q, featured, status = "published", format, page = 1, limit = 20 } = filter;
  const skip = (page - 1) * limit;

  // BL-47: private classes must never pollute the general catalog. Without an
  // explicit format the list serves regular courses only; callers opt in to
  // private classes with format=private_class.
  const formatWhere = format ?? { not: "private_class" };

  if (q) {
    const hits = await searchCourses(q, { limit, offset: skip, filter: `status = "${status}"` });
    if (hits.length > 0) {
      const slugs = hits.map((h) => h.slug);
      // Format is not part of the search index, so the format constraint is
      // re-applied on the Prisma fetch (search hits outside the requested
      // format are dropped here).
      const courses = await prisma.course.findMany({
        where: { slug: { in: slugs }, status, format: formatWhere },
        select: COURSE_SELECT,
      });
      const ordered = slugs.map((s) => courses.find((c) => c.slug === s)).filter(Boolean);
      return { data: ordered, total: ordered.length, page, limit };
    }
    // Fallback to Prisma ILIKE search
    const where = {
      status,
      format: formatWhere,
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { shortDesc: { contains: q, mode: "insensitive" as const } },
      ],
    };
    const [data, total] = await Promise.all([
      prisma.course.findMany({ where, select: COURSE_SELECT, skip, take: limit, orderBy: { publishedAt: "desc" } }),
      prisma.course.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  const where: Record<string, unknown> = { status, format: formatWhere };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (level) where.level = level;
  if (featured !== undefined) where.isFeatured = featured;

  const [data, total] = await Promise.all([
    prisma.course.findMany({ where, select: COURSE_SELECT, skip, take: limit, orderBy: { publishedAt: "desc" } }),
    prisma.course.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    select: {
      ...COURSE_SELECT,
      description: true,
      previewVideo: true,
      metaTitle: true,
      metaDesc: true,
      language: true,
      // BL-47: checkout must know the course format. waGroupLink and
      // onboardingContact stay OUT of every public select — they are only
      // revealed on the owner-scoped order detail after payment.
      format: true,
      sections: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          sortOrder: true,
          lessons: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              isPreview: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });
}

export type CreateCourseDto = {
  slug: string;
  title: string;
  description?: string;
  shortDesc?: string;
  price: number;
  salePrice?: number;
  categoryId?: string;
  level?: string;
  thumbnailUrl?: string;
  previewVideo?: string;
};

export async function createCourse(trainerId: string, dto: CreateCourseDto) {
  const course = await prisma.course.create({
    data: {
      slug: dto.slug,
      title: dto.title,
      description: dto.description,
      shortDesc: dto.shortDesc,
      price: dto.price,
      salePrice: dto.salePrice,
      categoryId: dto.categoryId,
      level: dto.level,
      thumbnailUrl: dto.thumbnailUrl,
      previewVideo: dto.previewVideo,
      trainerId,
      status: "draft",
    },
    include: { category: { select: { name: true, slug: true } } },
  });

  await enqueueSearchIndex({
    type: "index-course",
    course: {
      ...course,
      price: course.price.toString(),
      avgRating: course.avgRating.toString(),
      categoryName: course.category?.name,
    },
  });

  return course;
}

export type UpdateCourseDto = Partial<Omit<CreateCourseDto, "slug">>;

export async function updateCourse(id: string, dto: UpdateCourseDto) {
  const course = await prisma.course.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.shortDesc !== undefined && { shortDesc: dto.shortDesc }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.salePrice !== undefined && { salePrice: dto.salePrice }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.level !== undefined && { level: dto.level }),
      ...(dto.thumbnailUrl !== undefined && { thumbnailUrl: dto.thumbnailUrl }),
      ...(dto.previewVideo !== undefined && { previewVideo: dto.previewVideo }),
    },
    include: { category: { select: { name: true, slug: true } } },
  });

  await enqueueSearchIndex({
    type: "index-course",
    course: {
      ...course,
      price: course.price.toString(),
      avgRating: course.avgRating.toString(),
      categoryName: course.category?.name,
    },
  });

  return course;
}

export async function publishCourse(id: string) {
  const course = await prisma.course.update({
    where: { id },
    data: { status: "published", publishedAt: new Date() },
    include: { category: { select: { name: true, slug: true } } },
  });

  await enqueueSearchIndex({
    type: "index-course",
    course: {
      ...course,
      price: course.price.toString(),
      avgRating: course.avgRating.toString(),
      categoryName: course.category?.name,
    },
  });

  return course;
}

export async function deleteCourse(id: string) {
  await enqueueSearchIndex({ type: "delete-course", courseId: id });
  await prisma.course.delete({ where: { id } });
}
