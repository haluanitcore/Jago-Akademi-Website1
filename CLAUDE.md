# CLAUDE.md — Jago Akademi

> Petunjuk wajib untuk setiap sesi Claude Code di repo ini. **Baca sebelum menyentuh kode.**

## (a) Single Source of Truth

**`PROJECT_PROGRESS_REPORT_V2.md`** (root) adalah **Single Source of Truth (SSOT)**. Jika terjadi konflik antara SSOT dan dokumen lain (`PROJECT_PROGRESS_REPORT.md`, `docs/*.md`, memory, komentar kode), **SSOT yang menang** sampai diperbarui eksplisit.

- Kondisi baseline faktual (hasil TASK-000): **`docs/BASELINE_AUDIT.md`**.
- Setiap sesi: **baca Part IX (Claude Code Execution Instructions) SSOT lebih dulu**, lalu eksekusi Part VI sesuai urutan Part IV.

## (b) Aturan Wajib (ringkasan Part IX — rujuk detail di SSOT)

- **Coding standards** → SSOT §9.5: TypeScript strict, no `any` tanpa alasan tertulis; Prettier + ESLint `--max-warnings 0`; validasi **Zod di setiap boundary**; tak ada `console.log` di produksi (pakai `logger`); komentar jelaskan *why* (Bahasa Inggris untuk kode).
- **Architecture rules** → SSOT §9.6: layering **Route → Service → Repository/Prisma** (route tanpa business logic; service tanpa `req/res`); envelope `{success,data,error,meta}` dari `packages/types`; **setiap query LMS wajib ter-scope `tenantId`**; tak ada file route > 400 baris; perubahan arsitektur → tulis **ADR** (`docs/adr/`).
- **Dependency rules** → SSOT §9.7: pin **exact version**; cek kompatibilitas React 19/Next 16 (`docs/COMPATIBILITY_MATRIX.md`); `npm ci` reproducible; jalankan `npm audit` tiap perubahan dependency.
- **Testing rules** → SSOT §9.8: unit (logic) + integration (endpoint) + E2E (alur kritis); coverage modul kritis (**auth, commerce/payment, orders, lms**) **≥ 80%**; test deterministik; bug fix wajib **regression test**; CI hijau sebelum merge.
- **Commit strategy** → SSOT §9.9: **Conventional Commits** `feat|fix|chore|docs|test|refactor|perf|ci(scope): subject`; commit kecil & atomik; referensikan ID task (mis. `feat(lms): split routes (TASK-012)`); jangan commit secret/`.env`/build artifact.
- **Validation strategy** → SSOT §9.11: sebelum Done jalankan berlapis — (1) `tsc --noEmit` + ESLint 0 warning, (2) `vitest --coverage` + threshold, (3) Playwright E2E terkait, (4) `turbo run build`, (5) Validation Checklist task, (6) self-review diff, (7) high-stakes → review.
- **Definisi Done global** → SSOT §A.6.

## (c) Work Order (SSOT §9.2)

```
TASK-000 → 001 → 002 → (003 ∥ 004 ∥ 011) → (012 ∥ 013) → [QUALITY GATE 010]
→ 020 → (021 ∥ 022 ∥ 023) → 030 → 🚀 SOFT LAUNCH
→ (040 ∥ 050 ∥ 051) → (041 ∥ 042* ∥ 043) → 🚀 PUBLIC LAUNCH → 060 → 070 → 080
```
`∥` = boleh berurutan-cepat tanpa saling blokir. `042*` = pecah dulu jadi subtask. Ikuti dependency graph **SSOT §4.1**; **jangan lompat dependency**.

## (d) Aturan Sesi

1. **Setiap sesi**, baca **SSOT Part IX** sebelum menyentuh kode; jangan percaya klaim tier **[C]** tanpa verifikasi.
2. **Satu task = satu branch/PR**; commit atomik referensi task; **jangan merge/push tanpa konfirmasi reviewer**.
3. **Jangan tambah fitur baru selama Phase 1–4** (Stabilize→Integration). Fitur (termasuk EPIC 7) hanya setelah Soft Launch.
4. **Aksi sensitif** (deploy ke host, DNS/SSL, migration destruktif, transaksi uang nyata) → siapkan config + runbook, lalu **minta konfirmasi human reviewer** (SSOT §9.6). Jangan eksekusi sendiri.
5. Gap baru → catat di `docs/BACKLOG.md` (jangan kerjakan di luar urutan kecuali P0/blocker).
6. Dokumentasi diperbarui **dalam PR yang sama** dengan perubahan kode (docs-as-code, SSOT §9.10).

## Progress Tracker (per fase — SSOT §9.12)

- [x] **TASK-000** — Baseline audit (`docs/BASELINE_AUDIT.md`)
- [ ] **Phase 1 STABILIZE** — TASK-001..004 (commit, build fix, pin deps, CI)
- [ ] **Phase 2 QUALITY GATE** — TASK-010..013 (coverage, envelope, split lms, security P1)
- [ ] **Phase 3 INFRA** — TASK-020..023 (deploy, DB, queue, observability)
- [ ] **Phase 4 LIVE INTEGRATION** — TASK-030
- [ ] 🚀 **Soft Launch (10B)** → Phase 5–6 → Public Launch (10C) → Scale (10D)

## Perintah Cepat

```bash
# Verifikasi berlapis (per §9.11)
cd apps/api && npx tsc --noEmit && npm run test
cd apps/web && npm run build
# Metrics
grep -cE '^model ' apps/api/prisma/schema.prisma
```

---
*Detail penuh selalu di `PROJECT_PROGRESS_REPORT_V2.md`. File ini hanya pointer + ringkasan; jangan duplikasi isi SSOT.*
