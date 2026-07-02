# RUNBOOK — Production Deployment (TASK-020)

> Eksekusi runbook ini adalah **aksi human-gated** (SSOT §9.6): butuh kredensial host, DNS, dan SSL milik Anda. Claude Code menyiapkan seluruh config; Anda (atau operator) menjalankan langkah bertanda 🖐️. Setelah first-deploy sukses, deploy rutin berjalan otomatis via `.github/workflows/deploy.yml` (dengan approval gate GitHub Environment).

## Arsitektur runtime

```
Internet → Nginx (80/443, TLS, rate-limit, gzip)
             ├── jagoakademi.com      → web (Next.js standalone :3000)
             └── api.jagoakademi.com  → api (Express :4000)
Backing: postgres:16 · meilisearch:v1.5 · redis:7 (BullMQ, TASK-022)
Volumes: postgres_data · meilisearch_data · redis_data · uploads · /etc/letsencrypt
```

## 0. Prasyarat host

- VPS Linux (Ubuntu 22.04+ disarankan), min 2 vCPU / 4 GB RAM / 40 GB disk.
- Docker Engine + Compose plugin ≥ v2.24 (`!reset` di override butuh compose modern):
  `curl -fsSL https://get.docker.com | sh`
- Port 80 + 443 terbuka. SSH key-based login untuk user deploy (non-root + docker group).

## 1. 🖐️ DNS

Buat A record (TTL 300 selama setup):

| Record | Host | Value |
|--------|------|-------|
| A | `jagoakademi.com` | IP VPS |
| A | `www.jagoakademi.com` | IP VPS |
| A | `api.jagoakademi.com` | IP VPS |

Verifikasi: `dig +short jagoakademi.com api.jagoakademi.com`

## 2. 🖐️ Bootstrap direktori & kode

```bash
sudo mkdir -p /opt/jago-akademi /var/www/certbot && sudo chown -R $USER /opt/jago-akademi
cd /opt/jago-akademi
git clone <REPO_URL> . && git checkout <release-tag-atau-branch>
```

## 3. 🖐️ Environment produksi

Buat `/opt/jago-akademi/.env` (dibaca docker compose; **jangan** commit):

```bash
# Database
POSTGRES_USER=jagouser
POSTGRES_PASSWORD=<strong-random-32>
# Auth
JWT_SECRET=<random-64>
JWT_REFRESH_SECRET=<random-64>
GOOGLE_CLIENT_ID=<dari Google Cloud Console>
GOOGLE_CLIENT_SECRET=<...>
GOOGLE_CALLBACK_URL=https://api.jagoakademi.com/api/auth/google/callback
# URLs
WEB_URL=https://jagoakademi.com
NEXT_PUBLIC_API_URL=https://api.jagoakademi.com
NEXT_PUBLIC_SITE_URL=https://jagoakademi.com
# Payment (DOKU) — mulai SANDBOX, pindah production saat TASK-030 lolos
DOKU_CLIENT_ID=<...>
DOKU_SECRET_KEY=<...>
DOKU_BASE_URL=https://api-sandbox.doku.com
# Email / WA
RESEND_API_KEY=<...>
EMAIL_FROM=noreply@jagoakademi.com
EMAIL_FROM_NAME=Jago Akademi
# Search
MEILISEARCH_KEY=<random-32>
# Observability (TASK-023)
SENTRY_DSN=
NEXT_PUBLIC_GA_ID=
```

`chmod 600 .env`. Generator rahasia: `openssl rand -base64 48`.

## 4. 🖐️ SSL (Let's Encrypt)

First issuance (port 80 masih bebas — nginx belum jalan):

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone \
  -d jagoakademi.com -d www.jagoakademi.com -d api.jagoakademi.com \
  --email admin@jagoakademi.com --agree-tos --no-eff-email
```

Sertifikat → `/etc/letsencrypt/live/jagoakademi.com/` (path yang dipakai `nginx/nginx.conf`).

**Renewal otomatis** (nginx sudah serve `/.well-known/acme-challenge/` dari `/var/www/certbot`):

```bash
sudo tee /etc/cron.d/certbot-renew <<'EOF'
0 3 * * * root certbot renew --webroot -w /var/www/certbot --deploy-hook "docker compose -f /opt/jago-akademi/docker-compose.prod.yml exec nginx nginx -s reload" >> /var/log/certbot-renew.log 2>&1
EOF
```

## 5. 🖐️ First deploy (build di host)

```bash
cd /opt/jago-akademi
docker compose -f docker-compose.prod.yml build        # ± beberapa menit
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy   # migrations ter-commit (TASK-021); DB lama hasil `db push` → baseline dulu, lihat RUNBOOK_DB.md §1
docker compose -f docker-compose.prod.yml up -d --wait
docker compose -f docker-compose.prod.yml ps           # semua "healthy"
```

### Smoke test
```bash
curl -fsS https://api.jagoakademi.com/api/health        # {"success":true,...}
curl -fsSI https://jagoakademi.com | head -5            # 200 + security headers
```
SSL rating: https://www.ssllabs.com/ssltest/ → target A.

## 6. 🖐️ GitHub — aktifkan CD

Repo → Settings:
1. **Environments → New: `production`** → centang *Required reviewers* (Anda) → ini gate approval tiap deploy.
2. **Secrets and variables → Actions → Secrets**: `DEPLOY_HOST` (IP), `DEPLOY_USER`, `DEPLOY_SSH_KEY` (private key), `DEPLOY_PATH` (`/opt/jago-akademi`).
3. **Variables**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`.

## 7. Deploy rutin (otomatis, human-approved)

```bash
git tag v1.0.0 && git push origin v1.0.0
```
Pipeline: build+push GHCR → **tunggu approval** environment `production` → SSH: pull → `prisma migrate deploy` → `up -d --wait` (healthcheck-gated ≈ zero-downtime) → smoke test.

## 8. Rollback drill (wajib diuji sekali saat gate)

Versi sebelumnya tercatat di `.last-deploy-api|web`:

```bash
cd /opt/jago-akademi
export API_IMAGE=ghcr.io/<org>/<repo>/api:<versi-sebelumnya>
export WEB_IMAGE=ghcr.io/<org>/<repo>/web:<versi-sebelumnya>
docker compose -f docker-compose.prod.yml -f docker-compose.registry.yml up -d --wait
```
⚠️ Rollback image **tidak** membatalkan migration — migration harus backward-compatible (aturan TASK-021), atau restore backup DB.

## 9. Backup sebelum tiap migrate (manual sampai TASK-021 mengotomasi)

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U jagouser jago_akademi | gzip > backup-$(date +%F-%H%M).sql.gz
```

## Validation Checklist (TASK-020)

- [ ] `docker compose ps` → semua service **healthy** 🖐️
- [ ] DNS resolve ke VPS 🖐️
- [ ] HTTPS valid, SSL Labs ≥ A 🖐️
- [ ] Rollback drill sukses 🖐️
- [x] Runbook ini ada + CD pipeline ter-author
- [x] compose dev/prod/registry + nginx (ACME renewal, rate-limit BL-15) siap

## Troubleshooting cepat

| Gejala | Aksi |
|--------|------|
| Service unhealthy | `docker compose logs <svc> --tail 100` |
| 502 dari nginx | cek `docker compose ps` api/web healthy; nginx resolve nama service saat start — restart nginx setelah api/web up |
| Cert renewal gagal | cek `/var/log/certbot-renew.log`; pastikan `/var/www/certbot` ter-mount di nginx |
| Migrate gagal | JANGAN retry buta — restore backup §9, investigasi, baru ulang |
