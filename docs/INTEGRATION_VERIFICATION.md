# INTEGRATION VERIFICATION MATRIX (TASK-030)

> End-to-end verification of every external integration before Soft Launch (GAP-07/CRIT-04). **Every step here is 🖐️ human-gated** — it requires the deployed host (TASK-020), real credentials, and (for DOKU) sandbox money. Do NOT run against production payment/real cards until sandbox passes. Record evidence (screenshots/log ids) in the Evidence column.
>
> **Prerequisite:** production stack is live (`docker compose ps` all healthy), `/api/ready` returns 200 (DB + Meilisearch + Redis all `ok`).

## Pre-flight

```bash
curl -fsS https://api.jagoakademi.com/api/health   # {"status":"healthy"}
curl -fsS https://api.jagoakademi.com/api/ready | jq # deps: db/search/redis = ok
docker compose -f docker-compose.prod.yml ps        # api, worker, web, nginx, postgres, redis, meilisearch = healthy
```

## 1. DOKU Payment (start in SANDBOX)

`DOKU_BASE_URL=https://api-sandbox.doku.com`, sandbox credentials.

| Step | Action | Expected | Evidence |
|------|--------|----------|----------|
| 1.1 | Create order via `/api/checkout` (small nominal, e.g. Rp 10.000) | 200 + `paymentUrl` | |
| 1.2 | Open paymentUrl, pay with DOKU sandbox VA/QRIS | DOKU success page | |
| 1.3 | DOKU fires webhook → `/api/webhooks/doku` | 200 `{received:true}`; worker log "job completed" (queue=webhook) | |
| 1.4 | Verify fulfillment | order `status=paid`, `courseEnrollment` created | |
| 1.5 | **Webhook signature** | Replay webhook with tampered body → 401 | |
| 1.6 | **Idempotency** | Re-send the same success webhook → no duplicate enrollment/commission | |
| 1.7 | Buyer receives payment-success email + invoice (§2) | inbox | |
| 1.8 | Switch to **production** DOKU creds; repeat 1.1–1.4 with a **real minimal** transaction (reviewer-approved) | live payment fulfilled | |

## 2. Resend (transactional email)

| Step | Action | Expected | Evidence |
|------|--------|----------|----------|
| 2.1 | Trigger payment-pending (checkout) | email delivered; Resend dashboard shows "delivered" | |
| 2.2 | Trigger payment-success + invoice (webhook 1.4) | 2 emails delivered | |
| 2.3 | Domain auth (SPF/DKIM) | not in spam; DKIM pass | |

## 3. Fonnte (WhatsApp)

| Step | Action | Expected | Evidence |
|------|--------|----------|----------|
| 3.1 | Order with a user that has `profile.phone`, complete payment | WA payment-success received | |
| 3.2 | Fonnte token invalid → best-effort | fulfillment still succeeds; warn logged (no crash) | |

## 4. Cloudflare Stream + R2

| Step | Action | Expected | Evidence |
|------|--------|----------|----------|
| 4.1 | Course lesson video playback (enrolled user) | HLS plays via signed URL | |
| 4.2 | Signed URL expiry | expired URL → denied | |
| 4.3 | R2 upload (course thumbnail / e-book) | object stored + served | |
| 4.4 | E-book PDF signed download | authorized download works | |

## 5. Meilisearch

| Step | Action | Expected | Evidence |
|------|--------|----------|----------|
| 5.1 | Publish a course (admin) | worker "search-index" job completes | |
| 5.2 | Search `/api/search?q=...` | new course appears in hits | |
| 5.3 | Delete course | removed from index | |

## 6. Sentry + logging

| Step | Action | Expected | Evidence |
|------|--------|----------|----------|
| 6.1 | Trigger a deliberate 500 (temporary test route or force error) | Sentry issue created with `requestId` tag + release | |
| 6.2 | Correlate | `docker compose logs api \| grep <requestId>` shows the JSON error line | |
| 6.3 | Remove the test route | | |

## 7. Analytics (GA / Mixpanel)

| Step | Action | Expected | Evidence |
|------|--------|----------|----------|
| 7.1 | Load site with `NEXT_PUBLIC_GA_ID` set | GA realtime shows the pageview | |
| 7.2 | (If Mixpanel wired) key events fire | events land in Mixpanel | |

## 8. Queue / worker under load

| Step | Action | Expected | Evidence |
|------|--------|----------|----------|
| 8.1 | Complete a course to 100% | auto-certificate job runs; cert issued | |
| 8.2 | Inspect failed jobs | `redis-cli LLEN bull:*:failed` = 0 (or investigated) | |

## Go/No-Go for Soft Launch (10B)

- [ ] DOKU sandbox e2e green (incl. signature + idempotency)
- [ ] DOKU production minimal txn green (reviewer-approved)
- [ ] Email + WA delivered
- [ ] Video HLS + signed URL + R2 working
- [ ] Search index sync working
- [ ] Sentry receives errors + logs correlate by requestId
- [ ] Analytics receiving events
- [ ] Worker processes jobs; no unexplained failed jobs
- [ ] `/api/ready` 200; all containers healthy; backups + restore drill done (RUNBOOK_DB)

> When all boxes are checked, proceed to the **Soft Launch checkpoint** (Playbook 10B) — a separate human Go/No-Go decision.
