# BACKLOG — Gap Ditemukan Selama Eksekusi

> Per SSOT §9.4: gap baru yang ditemukan saat eksekusi dicatat di sini (tidak dikerjakan di luar urutan kecuali P0/blocker). Ditinjau saat perencanaan fase.

| ID | Temuan | Ditemukan saat | Severity | Rekomendasi | Target Fase |
|----|--------|----------------|----------|-------------|-------------|
| BL-01 | **5 apps di monorepo** (`admin`, `api`, `lms`, `trainer`, `web`), bukan 2. `apps/admin`, `apps/lms`, `apps/trainer` hanya scaffold `create-next-app` default (1 boilerplate `page.tsx` masing-masing). Fungsi asli admin/lms/trainer ada di dalam `apps/web`. | TASK-001 | 🟡 Medium | Hapus 3 scaffold mati atau putuskan repurpose. SSOT hanya mengakui `apps/api` + `apps/web`. Konfirmasi stakeholder. | Phase 2 (cleanup) |
| BL-02 | **52 type error API** (`trainer.ts` 21, `lms.ts` 14, dll) — referensi field/relasi Prisma yang tidak ada di schema. | TASK-000 | 🔴 High | Diselesaikan di **TASK-002**. | Phase 1 |
| BL-03 | **Bug runtime `lms.ts:288`** — `POST /api/lms/invite/:token/accept` → 500. | TASK-000 | 🔴 High | Fix + regression test di **TASK-002**. | Phase 1 |
| BL-04 | **API lint tak berjalan** — `eslint.config.js` (flat config v9) tidak ada di `apps/api`. | TASK-000 | 🟡 Medium | Tambah config referensi `@repo/eslint-config` di **TASK-002/004**. | Phase 1 |
| BL-05 | **Web lint diblok** — 24 warning `turbo/no-undeclared-env-vars` (env `CI` di `playwright.config.ts` tak dideklarasi `turbo.json`) vs `--max-warnings 0`. | TASK-000 | 🟢 Low | Deklarasikan `CI` di `turbo.json` `globalEnv` atau sesuaikan. **TASK-002/004**. | Phase 1 |
| BL-06 | **Coverage % belum terukur** — klaim 60% tak berbukti. | TASK-000 | 🟡 Medium | Ukur resmi di **TASK-010** (`vitest --coverage`). | Phase 2 |
| BL-07 | **docs & report belum di-push** — commit lokal saja (per instruksi reviewer: jangan push tanpa konfirmasi). | TASK-001 | 🟢 Low | Push setelah konfirmasi reviewer. | Phase 1 |
| BL-08 | **13 `<img>` elemen** memicu `@next/next/no-img-element`. Rule di-disable sementara di `apps/web/eslint.config.js` karena banyak `<img>` merender URL user arbitrer (avatar, thumbnail, cover) yang akan rusak dengan next/image domain allowlist. | TASK-002 | 🟡 Medium | Migrasi ke next/image dengan custom CDN loader (mendukung URL arbitrer), lalu re-enable rule. | Phase 5 (TASK-060 performance) |
| BL-09 | **`console.error` di `apps/web/app/error.tsx`** (client error boundary) — melanggar "no console in production" (§9.5). | TASK-002 | 🟢 Low | Ganti dengan Sentry client capture saat observability aktif. | Phase 3 (TASK-023) |
| BL-10 | **`tsconfig.test.json` melonggarkan `noUncheckedIndexedAccess`** untuk scaffolding mock. Produksi tetap strict. | TASK-002 | 🟢 Low | Pertimbangkan helper mock typed (deep-mock) agar bisa strict kembali. | Phase 2 (TASK-010) |
