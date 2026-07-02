# RUNBOOK — Database Production (TASK-021)

> Migration, backup, restore drill, index, dan seed untuk Postgres produksi. Operasi bertanda 🖐️ = human-gated (migrate produksi & restore destruktif — **backup dulu, selalu**).

## 1. Migration workflow (dev → prod)

Migrations kini ter-commit di `apps/api/prisma/migrations/` (baseline `00000000000000_init` — 41 tabel + 44 index, dibuat via `prisma migrate diff`, tanpa DB).

| Situasi | Perintah |
|---------|----------|
| **Prod DB BARU (kosong)** | `docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy` 🖐️ |
| **Prod DB EXISTING dari `db push`** (sudah ada tabel) | Baseline dulu (sekali): `docker compose ... run --rm api npx prisma migrate resolve --applied 00000000000000_init` 🖐️ → selanjutnya `migrate deploy` normal |
| Dev lokal | `docker compose -f docker-compose.dev.yml up -d` → `npx prisma migrate dev` |
| Schema berubah (task berikutnya) | `npx prisma migrate dev --name <nama>` di dev → commit folder migration → CD menjalankan `migrate deploy` |

**Aturan migration (wajib):**
- 🖐️ **Backup sebelum setiap `migrate deploy`** (§2) — CD melakukannya juga via cron harian, tapi pre-migrate manual snapshot untuk perubahan besar.
- Migration harus **backward-compatible** dengan image versi sebelumnya (rollback image tidak membatalkan migration): tambah kolom nullable → backfill → baru NOT NULL di migration berikutnya; jangan DROP kolom yang masih dibaca versi lama.
- Migration destruktif (DROP/ALTER TYPE) → review manusia + restore drill terbaru.

## 2. Backup

Otomatis via `scripts/backup.sh` (pg_dump → gzip → retensi 14 hari → opsional R2 via rclone):

```bash
# host, sekali:
chmod +x /opt/jago-akademi/scripts/backup.sh
sudo tee /etc/cron.d/jago-backup <<'EOF'
15 2 * * * root COMPOSE_DIR=/opt/jago-akademi R2_REMOTE=r2:jago-backups /opt/jago-akademi/scripts/backup.sh >> /var/log/jago-backup.log 2>&1
EOF
# R2: rclone config → remote "r2" (S3-compatible, endpoint akun Cloudflare)
```

Manual sebelum migrate: `COMPOSE_DIR=/opt/jago-akademi ./scripts/backup.sh`

## 3. 🖐️ Restore drill (uji SEKALI saat gate TASK-021, lalu tiap kuartal)

Restore ke database **scratch** (bukan menimpa produksi) untuk membuktikan backup valid:

Automated via **`scripts/restore.sh`** — restores the latest backup into a scratch
DB, verifies schema (≥ 40 tables) + row counts, then drops it (never touches prod):

```bash
cd /opt/jago-akademi
COMPOSE_DIR=/opt/jago-akademi ./scripts/restore.sh
# → "restore drill PASSED — backup is valid; scratch DB dropped"
```

Run this **once now** to prove the backup (Validation Checklist), then quarterly.

**Restore produksi sungguhan (bencana)** 🖐️: stop api+worker → `dropdb`/`createdb` → restore dump → `migrate resolve` bila perlu → start. Jangan improvisasi — ikuti urutan ini.

## 4. Index verification (setelah deploy)

Index hot-path (TASK-021): `orders(userId,status,createdAt)`, `orders(status,createdAt)`, `payment_transactions(orderId,status)`, `course_enrollments(userId)`, `lms_enrollments(tenantId)`, `lms_enrollments(userId)`.

Run **`scripts/index-audit.sql`** — lists the indexes (reliable even on empty DB)
and EXPLAINs the hot queries:

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U jagouser -d jago_akademi -f - < scripts/index-audit.sql
```

> On an empty/small DB Postgres may still choose `Seq Scan` (cheaper) — the
> **index-present list (A)** is the reliable check now; re-check `EXPLAIN` (B)
> once real data volume exists.

## 5. Seed produksi (minimal)

> 🔴 **VERIFIED live (2 Jul 2026):** production DB migrated but **EMPTY** — `/api/categories` = `[]`, `/api/courses` total 0. **Seeding (or admin content creation) is REQUIRED before Soft Launch** so the catalog isn't blank.

`prisma/seed.ts` = admin + kategori + konten demo. Jalankan **sekali** dari mesin dev dengan tunnel SSH ke prod:

```bash
ssh -N -L 5433:localhost:5432 user@VPS &   # tunnel
cd apps/api
DATABASE_URL="postgresql://jagouser:<pw>@localhost:5433/jago_akademi" \
SEED_ADMIN_EMAIL="admin@jagoakademi.com" \
SEED_ADMIN_PASSWORD="<STRONG — WAJIB set, jangan pakai default!>" \
npx tsx prisma/seed.ts
```

⚠️ `seed.ts` punya default password lemah (`Admin@2024!`) — **selalu** set `SEED_ADMIN_PASSWORD` di produksi.

## Validation Checklist (TASK-021)

- [x] Folder `prisma/migrations/` + baseline init ter-commit (41 tabel, 44 index)
- [x] Index hot-path §3.4 ada di schema + SQL + `scripts/index-audit.sql`
- [x] `scripts/backup.sh` (cron + retensi + R2) + **`scripts/restore.sh`** (drill otomatis)
- [x] ✅ **`migrate deploy` sukses di prod** — verified live `/api/ready` → `db: ok`
- [ ] 🖐️ Backup cron aktif (`scripts/backup.sh` + `/etc/cron.d/jago-backup`)
- [ ] 🖐️ Restore drill dijalankan sekali (`./scripts/restore.sh` → PASSED)
- [ ] 🖐️ Index audit dijalankan (`scripts/index-audit.sql` → indexes present)
- [ ] 🔴 🖐️ **Seed produksi** — DB verified EMPTY, wajib sebelum Soft Launch (§5)
- [ ] 🖐️ `EXPLAIN` menunjukkan index terpakai
