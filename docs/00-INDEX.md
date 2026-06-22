# JAGO AKADEMI — Master Documentation Index

> Platform Edukasi Digital Terintegrasi
> Versi Dokumen: 1.1.0 | Tanggal: 22 Juni 2026
> Status: **COMPLETE — Ready for Stakeholder Review**

---

## Daftar Dokumen

| No | Dokumen | File | Halaman | Status |
|----|---------|------|---------|--------|
| 1 | Business Requirement Document | [01-BRD.md](./01-BRD.md) | ~25 hal | ✅ Done |
| 2 | Product Requirement Document | [02-PRD.md](./02-PRD.md) | ~35 hal | ✅ Done |
| 3 | System Architecture | [03-SYSTEM-ARCHITECTURE.md](./03-SYSTEM-ARCHITECTURE.md) | ~40 hal | ✅ Done |
| 4 | User Journey & Flow | [04-USER-JOURNEY.md](./04-USER-JOURNEY.md) | ~30 hal | ✅ Done |
| 5 | Implementation Roadmap | [05-IMPLEMENTATION-ROADMAP.md](./05-IMPLEMENTATION-ROADMAP.md) | ~40 hal | ✅ Done |
| 6 | Design System & Visual Identity | [06-DESIGN-SYSTEM.md](./06-DESIGN-SYSTEM.md) | ~55 hal | ✅ Done |

**Total dokumentasi: ~225 halaman** (6 dokumen)

---

## Executive Summary

**Jago Akademi** adalah platform edukasi digital B2C dan B2B yang mengintegrasikan enam unit bisnis utama dalam satu ekosistem terintegrasi.

### 6 Unit Bisnis

| Unit | Produk | Revenue Model | Target M12 |
|------|--------|---------------|------------|
| **Trainer Program** | Sertifikasi trainer profesional | One-time + renewal | 500 certified trainer |
| **Paket LMS** | SaaS LMS untuk institusi | Monthly subscription | 50 klien B2B |
| **Event** | Internal & kolaborasi event | Ticket + sponsorship | 50 event/tahun |
| **E-Course** | Kelas online video-based | Per-course + subscription | 200 kursus aktif |
| **E-Book** | Buku digital | Per-judul | 500 judul |
| **Marketplace Materi** | Rekaman & modul pasca-event | Per-bundle | 300 produk |

### Financial Target (12 Bulan)

| Metric | Target |
|--------|--------|
| Total Registered User | 50.000 |
| Paying Customer | 10.000 |
| Monthly Recurring Revenue | Rp 500 Juta |
| Annual Run Rate | Rp 6 Miliar |
| B2B LMS Client | 50 institusi |
| Gross Margin | > 65% |

### Positioning
> "Platform pertama di Indonesia yang menyatukan ekosistem belajar, berlatih, dan berkarier dalam satu pintu digital."

---

## Roles & Permissions Overview

| Role | Deskripsi | Akses Utama |
|------|-----------|-------------|
| Visitor | Pengguna belum login | Public pages, preview gratis |
| Student | Pengguna terdaftar + pembeli | Dashboard, kursus, sertifikat |
| Trainer | Instruktur bersertifikat | Course builder, analytics, payout |
| Trainer Candidate | Peserta program trainer | Modul trainer, assignment |
| Event Participant | Peserta event terdaftar | Tiket, rekaman, sertifikat event |
| Corporate Client | Admin perusahaan/institusi | LMS workspace, laporan |
| LMS Sub-User | Karyawan/mahasiswa klien LMS | Kursus yang di-assign |
| Partner/Creator | Kolaborator event & konten | Upload produk marketplace, event |
| Affiliate | Anggota referral program | Dashboard affiliate, pencairan |
| Admin Konten | Internal: kelola konten | CMS, review kursus, blog |
| Admin Event | Internal: kelola event | Event management, peserta |
| Admin CRM | Internal: kelola B2B leads | Pipeline, leads, aktivitas |
| Admin Keuangan | Internal: kelola finance | Transaksi, payout, laporan |
| Super Admin | Full access | Semua modul |

---

## Tech Stack Summary

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| State Management | Zustand + TanStack Query |
| Backend | Node.js, Express.js/Hono, TypeScript |
| Database | PostgreSQL 16 (Prisma ORM) |
| Cache/Queue | Redis 7 + BullMQ |
| Search | Meilisearch |
| Storage | Cloudflare R2 |
| Video | Cloudflare Stream (HLS + signed URL) |
| Auth | JWT + Google OAuth |
| Payment | Midtrans (primer) + Xendit (backup) |
| Email | Resend / AWS SES |
| WA Notif | Fonnte API |
| Push Notif | OneSignal |
| Monitoring | Sentry + Grafana |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |
| Container | Docker + Kubernetes |

---

## Roadmap Summary (10 Fase)

| Fase | Nama | Durasi | Periode | Output Utama |
|------|------|--------|---------|-------------|
| 1 | Discovery & Strategy | 2 minggu | M1 | BRD, PRD, team setup |
| 2 | Product Validation & UX | 3 minggu | M1–2 | User research, wireframe |
| 3 | UI Design System | 4 minggu | M2–3 | Design system, mockup |
| 4 | System Architecture Setup | 3 minggu | M3 | Infra, CI/CD, baseline |
| 5 | Core Development (MVP) | 8 minggu | M3–5 | Auth, course, dashboard |
| 6 | E-Commerce & Payment | 4 minggu | M5–6 | Payment live → **SOFT LAUNCH** |
| 7 | LMS Development (B2B) | 6 minggu | M6–8 | Multi-tenant LMS |
| 8 | Phase 2 Features | 8 minggu | M7–9 | Trainer hub, affiliate, blog |
| 9 | Testing & QA | 4 minggu | M9–10 | Bug-free, performant |
| 10 | Launch, Growth & Scale | Ongoing | M10+ | **FULL PUBLIC LAUNCH** |

---

## Halaman Website Public

| Halaman | URL | Priority |
|---------|-----|----------|
| Home | / | MVP |
| Tentang Kami | /tentang-kami | MVP |
| Klien Sebelumnya | /klien | MVP |
| Event Sebelumnya | /event-sebelumnya | MVP |
| Kolaborasi | /kolaborasi | MVP |
| FAQ | /faq | MVP |
| Hubungi Kami | /hubungi-kami | MVP |
| Katalog Kursus | /kursus | MVP |
| Detail Kursus | /kursus/[slug] | MVP |
| Event | /event | MVP |
| Detail Event | /event/[slug] | MVP |
| E-Book | /ebook | Phase 2 |
| Trainer Program | /trainer-program | Phase 2 |
| Paket LMS | /lms | Phase 2 |
| Marketplace Materi | /marketplace | Phase 2 |
| Blog | /blog | Phase 2 |
| Program Afiliasi | /afiliasi | Phase 2 |

---

## Feature Priority Matrix

### MVP (Fase 5–6, Bulan 3–6)
- ✅ Auth (register, login, Google OAuth, email verify)
- ✅ Public website (7 halaman utama)
- ✅ E-Course (listing, detail, player, progress, quiz, sertifikat)
- ✅ Event (listing, detail, registrasi, tiket QR, reminder)
- ✅ Payment (Midtrans full: VA, QRIS, e-wallet, CC)
- ✅ Student dashboard (kursus, progress, sertifikat)
- ✅ Admin panel dasar (user, kursus, transaksi)
- ✅ Email transaksional (konfirmasi, invoice, sertifikat)
- ✅ Sertifikat otomatis + QR verifikasi

### Phase 2 (Fase 7–8, Bulan 6–9)
- 🔵 Trainer Hub (course builder, analytics, payout)
- 🔵 Trainer Program (landing, purchase, modul, assessment)
- 🔵 E-Book (toko, in-browser reader, download)
- 🔵 Marketplace Materi Event
- 🔵 Affiliate & Referral System
- 🔵 LMS B2B (multi-tenant, course builder, laporan)
- 🔵 Coupon & promo system
- 🔵 Blog CMS
- 🔵 Review & Rating system
- 🔵 Push notification
- 🔵 WA notification

### Long-Term (Bulan 12+)
- 🟣 Mobile App (iOS & Android)
- 🟣 AI course recommendation
- 🟣 Live streaming terintegrasi
- 🟣 Gamifikasi (badge, XP, leaderboard)
- 🟣 Community forum
- 🟣 LMS Enterprise (white-label, SSO, API)
- 🟣 Multi-language (English)
- 🟣 Regional expansion (Malaysia, Singapura)

---

## Kontak & Ownership

| Dokumen | Owner | Reviewer |
|---------|-------|---------|
| BRD | Business Analyst / CEO | Finance, Legal |
| PRD | Product Manager | Engineering Lead, Design |
| System Architecture | Tech Lead | Backend Leads |
| User Journey | UX Lead | PM, Marketing |
| Implementation Roadmap | Product Manager + Tech Lead | CEO, All Leads |

---

*Semua dokumen ini bersifat confidential dan hanya untuk internal Jago Akademi.*
*Versi publik (redacted) tersedia untuk keperluan investor deck.*
