/**
 * Production seed — creates demo content for launch:
 * - 1 super admin user
 * - 5 categories
 * - 6 published courses
 * - 4 events
 * - 6 e-books
 * - 3 blog posts
 *
 * Usage: npx tsx prisma/seed.ts
 * Or via: npx prisma db seed (if configured in package.json)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Jago Akademi production data...");

  // ─── Super Admin ───────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@jagoakademi.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@2024!";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin Jago Akademi",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      isVerified: true,
      isActive: true,
      authProvider: "local",
      roles: { create: { role: "super_admin" } },
    },
  });
  console.log(`✓ Admin created: ${admin.email}`);

  // ─── Categories ────────────────────────────────────────────────────────────
  const categories = [
    { name: "Marketing Digital", slug: "marketing-digital", sortOrder: 1 },
    { name: "Desain Grafis", slug: "desain-grafis", sortOrder: 2 },
    { name: "Programming & Tech", slug: "programming-tech", sortOrder: 3 },
    { name: "Bisnis & Keuangan", slug: "bisnis-keuangan", sortOrder: 4 },
    { name: "HR & Kepemimpinan", slug: "hr-kepemimpinan", sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.courseCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✓ ${categories.length} categories seeded`);

  // ─── Trainer users ─────────────────────────────────────────────────────────
  const trainers = [
    { email: "trainer1@jagoakademi.com", name: "Budi Santoso" },
    { email: "trainer2@jagoakademi.com", name: "Rina Kusuma" },
    { email: "trainer3@jagoakademi.com", name: "Kevin Wijaya" },
  ];

  const trainerIds: string[] = [];
  for (const t of trainers) {
    const trainer = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        name: t.name,
        passwordHash: await bcrypt.hash("Trainer@2024!", 12),
        isVerified: true,
        isActive: true,
        authProvider: "local",
        roles: { create: { role: "trainer" } },
      },
    });
    trainerIds.push(trainer.id);
  }
  console.log(`✓ ${trainers.length} trainers seeded`);

  // ─── Courses ───────────────────────────────────────────────────────────────
  const marketingCatId = await prisma.courseCategory
    .findUnique({ where: { slug: "marketing-digital" } })
    .then((c) => c!.id);

  const designCatId = await prisma.courseCategory
    .findUnique({ where: { slug: "desain-grafis" } })
    .then((c) => c!.id);

  const techCatId = await prisma.courseCategory
    .findUnique({ where: { slug: "programming-tech" } })
    .then((c) => c!.id);

  const courses = [
    {
      slug: "digital-marketing-fundamentals",
      title: "Digital Marketing Fundamentals",
      shortDesc: "Kuasai dasar-dasar pemasaran digital dari nol hingga mahir.",
      level: "beginner", price: 299000, status: "published",
      categoryId: marketingCatId, trainerId: trainerIds[0],
    },
    {
      slug: "social-media-marketing-advanced",
      title: "Social Media Marketing Advanced",
      shortDesc: "Strategi konten dan iklan berbayar di Instagram, TikTok, Facebook.",
      level: "intermediate", price: 399000, status: "published",
      categoryId: marketingCatId, trainerId: trainerIds[0],
    },
    {
      slug: "ui-ux-design-figma",
      title: "UI/UX Design dengan Figma",
      shortDesc: "Belajar desain antarmuka modern menggunakan Figma dari nol.",
      level: "beginner", price: 349000, status: "published",
      categoryId: designCatId, trainerId: trainerIds[1],
    },
    {
      slug: "web-development-react-nextjs",
      title: "Full Stack Web Development: React & Next.js",
      shortDesc: "Bangun aplikasi web modern dengan React 18 dan Next.js 14.",
      level: "intermediate", price: 499000, status: "published",
      categoryId: techCatId, trainerId: trainerIds[2],
    },
    {
      slug: "seo-mastery",
      title: "SEO Mastery: Ranking #1 di Google",
      shortDesc: "Teknik SEO on-page dan off-page terkini untuk bisnis Anda.",
      level: "intermediate", price: 279000, status: "published",
      categoryId: marketingCatId, trainerId: trainerIds[0],
    },
    {
      slug: "brand-design-canva",
      title: "Brand Design dengan Canva Pro",
      shortDesc: "Buat identitas merek profesional tanpa keahlian desain sebelumnya.",
      level: "beginner", price: 0, status: "published",
      categoryId: designCatId, trainerId: trainerIds[1],
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: { status: course.status },
      create: course,
    });
  }
  console.log(`✓ ${courses.length} courses seeded`);

  // ─── Events ────────────────────────────────────────────────────────────────
  const now = new Date();
  const events = [
    {
      slug: "webinar-marketing-digital-2024",
      title: "Webinar: Tren Digital Marketing 2024",
      type: "online", status: "published",
      startDate: new Date(now.getTime() + 7 * 86400000),
      endDate: new Date(now.getTime() + 7 * 86400000 + 7200000),
      location: "Zoom Webinar", isOnline: true, isPaid: false, price: 0,
      quota: 500, isFeatured: true,
    },
    {
      slug: "workshop-ui-ux-jakarta",
      title: "Workshop UI/UX Design — Jakarta",
      type: "offline", status: "published",
      startDate: new Date(now.getTime() + 14 * 86400000),
      endDate: new Date(now.getTime() + 14 * 86400000 + 28800000),
      location: "Co-working Space Jakarta Selatan", isOnline: false, isPaid: true, price: 350000,
      quota: 30, isFeatured: false,
    },
    {
      slug: "seminar-startup-indonesia",
      title: "Seminar: Membangun Startup Indonesia",
      type: "hybrid", status: "published",
      startDate: new Date(now.getTime() + 21 * 86400000),
      endDate: new Date(now.getTime() + 21 * 86400000 + 14400000),
      location: "Jakarta Convention Center", isOnline: true, isPaid: true, price: 150000,
      quota: 1000, isFeatured: true,
    },
    {
      slug: "bootcamp-fullstack-dev",
      title: "Bootcamp Full Stack Developer — 2 Hari",
      type: "online", status: "draft",
      startDate: new Date(now.getTime() + 30 * 86400000),
      endDate: new Date(now.getTime() + 31 * 86400000),
      location: "Live Streaming YouTube", isOnline: true, isPaid: true, price: 500000,
      quota: 200, isFeatured: false,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    });
  }
  console.log(`✓ ${events.length} events seeded`);

  // ─── E-Books ───────────────────────────────────────────────────────────────
  const ebooks = [
    { slug: "panduan-digital-marketing-2024", title: "Panduan Digital Marketing 2024", category: "Marketing", isFree: true, price: 0, status: "published" },
    { slug: "desain-logo-profesional", title: "Desain Logo Profesional dengan Canva", category: "Desain", isFree: true, price: 0, status: "published" },
    { slug: "seo-guide-indonesia", title: "SEO Guide for Indonesian Business", category: "Marketing", isFree: false, price: 79000, status: "published" },
    { slug: "financial-planning-freelancer", title: "Financial Planning untuk Freelancer", category: "Keuangan", isFree: false, price: 99000, status: "published" },
    { slug: "react-best-practices", title: "React Best Practices 2024", category: "Teknologi", isFree: false, price: 129000, status: "published" },
    { slug: "hr-playbook-startup", title: "HR Playbook untuk Startup Indonesia", category: "HR", isFree: true, price: 0, status: "published" },
  ];

  for (const ebook of ebooks) {
    await prisma.eBook.upsert({
      where: { slug: ebook.slug },
      update: {},
      create: {
        ...ebook,
        description: `Panduan lengkap tentang ${ebook.title}`,
        fileUrl: `https://media.jagoakademi.com/ebooks/${ebook.slug}.pdf`,
      },
    });
  }
  console.log(`✓ ${ebooks.length} e-books seeded`);

  // ─── Blog Posts ────────────────────────────────────────────────────────────
  const blogPosts = [
    {
      slug: "cara-belajar-digital-marketing",
      title: "Cara Belajar Digital Marketing dari Nol",
      excerpt: "Panduan lengkap untuk pemula yang ingin memulai karir di dunia digital marketing.",
      content: "<p>Digital marketing adalah salah satu keahlian yang paling dicari di era digital ini...</p>",
      category: "Marketing", status: "published", publishedAt: new Date(),
      authorId: admin.id,
    },
    {
      slug: "tips-ui-ux-designer-pemula",
      title: "10 Tips untuk UI/UX Designer Pemula",
      excerpt: "Kumpulan tips praktis yang wajib diketahui oleh UI/UX designer yang baru memulai.",
      content: "<p>Menjadi UI/UX designer yang handal membutuhkan latihan dan pemahaman yang mendalam...</p>",
      category: "Desain", status: "published", publishedAt: new Date(),
      authorId: admin.id,
    },
    {
      slug: "tren-teknologi-2024",
      title: "Tren Teknologi yang Wajib Dikuasai di 2024",
      excerpt: "Dari AI hingga Web3, ini adalah teknologi yang akan mendominasi industri tahun ini.",
      content: "<p>Tahun 2024 membawa banyak perubahan dalam dunia teknologi...</p>",
      category: "Teknologi", status: "published", publishedAt: new Date(),
      authorId: admin.id,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`✓ ${blogPosts.length} blog posts seeded`);

  console.log("\n✅ Seeding complete!");
  console.log(`   Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("   Please change the admin password immediately after first login.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
