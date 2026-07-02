# Phase 10 — Deployment Guide

Step-by-step instructions for deploying Jago Akademi to production.

---

## Prerequisites

- Ubuntu 22.04 LTS server (min 4 vCPU, 8 GB RAM, 100 GB SSD)
- Docker Engine 25+ and Docker Compose v2
- Domain `jagoakademi.com` with DNS pointing to server IP
- SSL certificates obtained (Let's Encrypt via Certbot recommended)
- Accounts ready: DOKU merchant, Resend, Google OAuth, Cloudflare R2, Sentry

---

## 1. Server Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Install Docker Compose v2
apt-get install docker-compose-plugin

# Create deployment directory
mkdir -p /opt/jago-akademi
cd /opt/jago-akademi
```

---

## 2. SSL Certificates

```bash
# Install Certbot
apt-get install certbot

# Obtain certificates (standalone, port 80 must be free)
certbot certonly --standalone \
  -d jagoakademi.com \
  -d www.jagoakademi.com \
  -d api.jagoakademi.com \
  --email admin@jagoakademi.com \
  --agree-tos

# Copy to nginx ssl directory
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/jagoakademi.com/fullchain.pem nginx/ssl/jagoakademi.com.crt
cp /etc/letsencrypt/live/jagoakademi.com/privkey.pem nginx/ssl/jagoakademi.com.key
cp /etc/letsencrypt/live/api.jagoakademi.com/fullchain.pem nginx/ssl/api.jagoakademi.com.crt
cp /etc/letsencrypt/live/api.jagoakademi.com/privkey.pem nginx/ssl/api.jagoakademi.com.key

# Auto-renewal
echo "0 0 1 * * root certbot renew --quiet && docker compose -f /opt/jago-akademi/docker-compose.prod.yml restart nginx" >> /etc/crontab
```

---

## 3. Environment Configuration

```bash
# Copy the production env template
cp apps/api/.env.example .env.api
cp apps/web/.env.example .env.web

# Edit .env.api — fill in ALL values
nano .env.api

# Edit .env.web — fill in ALL values  
nano .env.web

# Create root .env for docker-compose interpolation
cat > .env << 'EOF'
POSTGRES_USER=jagouser
POSTGRES_PASSWORD=<strong-random-password>

JWT_SECRET=<openssl rand -base64 48>
JWT_REFRESH_SECRET=<openssl rand -base64 48>

WEB_URL=https://jagoakademi.com
NEXT_PUBLIC_API_URL=https://api.jagoakademi.com
NEXT_PUBLIC_SITE_URL=https://jagoakademi.com

GOOGLE_CLIENT_ID=<from Google Console>
GOOGLE_CLIENT_SECRET=<from Google Console>
GOOGLE_CALLBACK_URL=https://api.jagoakademi.com/api/auth/google/callback

RESEND_API_KEY=re_live_<key>
EMAIL_FROM=noreply@jagoakademi.com
EMAIL_FROM_NAME=Jago Akademi

DOKU_CLIENT_ID=<from DOKU merchant>
DOKU_SECRET_KEY=<from DOKU merchant>
DOKU_BASE_URL=https://api.doku.com

MEILISEARCH_KEY=<strong-random-key>

SENTRY_DSN=<from Sentry project>
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
EOF

chmod 600 .env .env.api .env.web
```

---

## 4. Clone Repository

```bash
cd /opt/jago-akademi
git clone https://github.com/your-org/jago-akademi-website.git .
git checkout main
```

---

## 5. Build and Deploy

```bash
# Pull base images
docker compose -f docker-compose.prod.yml pull

# Build application images
docker compose -f docker-compose.prod.yml build

# Start postgres and meilisearch first
docker compose -f docker-compose.prod.yml up -d postgres meilisearch

# Wait for postgres to be ready (~10 seconds)
sleep 10

# Run database migrations
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

# Run production seed (first deploy only)
docker compose -f docker-compose.prod.yml run --rm \
  -e SEED_ADMIN_EMAIL=admin@jagoakademi.com \
  -e SEED_ADMIN_PASSWORD=<secure-password> \
  api npx tsx prisma/seed.ts

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Verify all containers are running
docker compose -f docker-compose.prod.yml ps
```

---

## 6. Verify Deployment

```bash
# API health check
curl -s https://api.jagoakademi.com/api/health | jq

# Expected: { "status": "ok", "timestamp": "..." }

# Web app
curl -sI https://jagoakademi.com | head -20

# Check security headers
curl -sI https://jagoakademi.com | grep -E "X-Content|X-Frame|Strict-Transport|Referrer"

# Verify sitemap
curl -s https://jagoakademi.com/sitemap.xml | head -30

# Check robots.txt
curl -s https://jagoakademi.com/robots.txt
```

---

## 7. DNS Configuration

Add these records in your DNS provider:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `<server-ip>` | 300 |
| A | www | `<server-ip>` | 300 |
| A | api | `<server-ip>` | 300 |
| CNAME | media | `<r2-bucket>.r2.cloudflarestorage.com` | 300 |
| MX | @ | Resend MX records | 300 |
| TXT | @ | Resend SPF/DKIM records | 300 |

---

## 8. Ongoing Operations

### Deploy a new release

```bash
cd /opt/jago-akademi

# Pull latest code
git pull origin main

# Rebuild changed images only
docker compose -f docker-compose.prod.yml build api web

# Rolling restart (zero downtime)
docker compose -f docker-compose.prod.yml up -d --no-deps api web

# Run any new migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

### View logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# API only
docker compose -f docker-compose.prod.yml logs -f api

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail 100 api
```

### Database backup

```bash
# Manual backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U jagouser jago_akademi \
  > backup-$(date +%Y%m%d-%H%M%S).sql

# Automate (add to crontab)
# 0 3 * * * /opt/jago-akademi/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### Restore database

```bash
# Stop api to prevent writes during restore
docker compose -f docker-compose.prod.yml stop api

docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U jagouser jago_akademi < backup-YYYYMMDD.sql

docker compose -f docker-compose.prod.yml start api
```

### Certificate renewal

```bash
# Certbot auto-renewal is handled by crontab (set in step 2)
# Manual renewal:
certbot renew
cp /etc/letsencrypt/live/jagoakademi.com/fullchain.pem nginx/ssl/jagoakademi.com.crt
cp /etc/letsencrypt/live/jagoakademi.com/privkey.pem nginx/ssl/jagoakademi.com.key
docker compose -f docker-compose.prod.yml restart nginx
```

---

## 9. Rollback Procedure

```bash
# Identify the previous working image tag or commit
git log --oneline -5

# Revert to a previous commit
git checkout <commit-hash>

# Rebuild and redeploy
docker compose -f docker-compose.prod.yml build api web
docker compose -f docker-compose.prod.yml up -d --no-deps api web

# If the new migration broke the DB, restore from backup before this step
```

---

## 10. Troubleshooting

| Symptom | Check |
|---------|-------|
| API returns 502 | `docker compose logs api` — likely startup crash. Check env vars |
| Web shows blank page | `docker compose logs web` — missing `NEXT_PUBLIC_API_URL`? |
| Postgres connection refused | `docker compose ps postgres` — is it healthy? Check `DATABASE_URL` |
| Login fails | Check `JWT_SECRET` is set and consistent across restarts |
| Emails not sending | Verify `RESEND_API_KEY` and domain DNS records in Resend dashboard |
| Payment callback fails | Verify DOKU webhook URL and `DOKU_SECRET_KEY` |
| Search not working | `docker compose logs meilisearch` — check `MEILISEARCH_KEY` |
| SSL certificate error | Certificate expired? Re-run certbot renew and copy new certs |
