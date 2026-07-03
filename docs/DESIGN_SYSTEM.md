# Jago Akademi — Design System (v1, Jul 2026)

> Bahasa desain untuk `apps/web`. Referensi arah: **Udacity DNA** (editorial, premium, outcome-driven) diterapkan pada **light theme Jago** + token brand cyan/pink. Satu sumber gaya: token di `app/globals.css`; komponen di `components/ui/*` + `components/shared/MediaPlaceholder.tsx`.

## 1. Prinsip

1. **Data jujur.** Angka/testimoni/logo hanya dari data real & ber-consent. Tidak ada → **omit section** atau `EmptyState`. (`StatBlock`/`TestimonialCard` membawa aturan ini di JSDoc-nya.)
2. **Media jujur.** Semua slot foto/video = `MediaPlaceholder` (✕ + label "VIDEO/FOTO", aspect-ratio terkunci → zero layout shift). Tidak ada stock/AI imagery.
3. **Satu aksen per heading.** Heading = ink solid (`--text-primary`), aksen **satu kata** via `.text-accent` (cyan-strong). ~~Gradient kata-per-kata~~ dilarang; `.text-gradient-*` = deprecated.
4. **Eyebrow, bukan pill.** Label section = `.eyebrow` (uppercase 12px + garis pendek), bukan badge-pill + emoji.
5. **Ritme variatif.** Header section default **left-aligned** dengan `action` kanan; center = pengecualian. Komposisi bergantian: asimetris / grid / split / dark band (`Section tone="ink"`).
6. **Ikon = lucide** konsisten (stroke 1.75), bukan emoji.
7. **Motion bermakna:** `Reveal` (fade + rise 16px, sekali, ease-out-expo), hormati `prefers-reduced-motion`.

## 2. Token (di `globals.css :root`)

| Kelompok | Token kunci |
|---|---|
| Brand | `--brand-cyan #00d4ff` (fill), `--brand-cyan-strong #0077A8` (teks di putih, 4.67:1), `--brand-pink #ff0066`, `--brand-pink-strong #CC0052` (4.84:1) |
| Surface | `--surface-page #F5F5F7`, `--surface-card #FFF`, `--surface-sunken #FAFAFA`, `--surface-accent-soft`, `--surface-pink-soft` |
| Text | `--text-primary #1D1D1F` (ink), `--text-secondary #636366`, `--text-muted #6E6E73`, `--text-on-accent #001318` |
| Border | `--border-default #E5E5E5`, `--border-subtle`, `--border-strong`, `--border-focus #0077A8` |
| Elevation | `--shadow-e0..e4` + `--shadow-focus-cyan` |
| Radius | `--radius-sm .5rem` → `--radius-xl 1.5rem`, `--radius-full` |
| Rhythm | 8pt grid; `--section-py 6rem` / `--section-py-sm 4rem`; container 1200px (`.container-pad`) |
| Motion | `--transition-fast/base/slow`, `--ease-out-expo` |
| Font | `--font-display` Plus Jakarta Sans (heading/btn), `--font-body` Inter |

**Peran warna:** cyan = aksi & aksen utama; pink = highlight hemat (badge/pilar kedua); ink = teks & band gelap. Tidak ada warna ketiga.

## 3. Kelas CSS inti

| Kelas | Peran |
|---|---|
| `.eyebrow` / `.eyebrow-center` | Label section editorial (garis + uppercase) |
| `.text-accent` / `.text-accent-pink` | Aksen 1 kata pada heading |
| `.link-arrow` | Link editorial "Lihat semua →" (gap melebar saat hover) |
| `.card` (alias `.card-dark`) | Kartu kanonik: putih, border, radius-lg, e1→hover e2 + lift 2px |
| `.btn` + `.btn-primary/-accent/-outline/-ghost` + `-sm/-lg/-xl` | Tombol (radius full, display font) |
| `.badge` + `-cyan/-pink/-neutral` | Chip status kecil (untuk label data, bukan header section) |
| `.section` / `.section-sm` / `.container-pad` | Ritme vertikal + container |
| `.input-dark` | Input (border-strong, fokus ring cyan) |
| `.stat-number` | Angka besar display (hanya data real) |
| `.skeleton` | Loading shimmer |

## 4. Komponen (`components/ui/*`)

| Komponen | Props inti | Catatan |
|---|---|---|
| `Section` | `tone: default\|sunken\|ink`, `size` | `ink` = band gelap editorial |
| `SectionHeader` | `eyebrow, title, lede, align, action, onInk` | Default left + action kanan |
| `Reveal` | `delay, y` | Wrapper motion; client |
| `ProgramCard` | `href, title, description, unitLabel, unitIcon, meta{rating,level,duration,count}, media` | Kartu program ala Udacity; meta falsy → tak dirender |
| `CategoryCard` | `href, icon, name, description, note, accent` | Tile "Jelajahi bidang" |
| `EmptyState` | `icon, title, description, action` | Jawaban elegan saat data kosong |
| `StatBlock` | `value, label, hint, onInk` | ⚠️ hanya angka real |
| `TestimonialCard` | `quote, name, role, company, photo` | ⚠️ hanya orang real + consent (BL-24) |
| `MediaPlaceholder` (`components/shared/`) | `type: video\|foto, ratio, label, showRatio` | Rasio: video 16:9, foto 1:1; banner 21:9 |

## 5. Type scale (disiplin)

Display (Plus Jakarta Sans, tracking-tight): H1 hero `text-4xl→6xl`, H2 section `text-3xl→4xl`, H3 card `text-base/lg` bold. Body (Inter): lede `text-lg`, body `text-[15px]/base`, meta `text-xs/[13px]`, eyebrow/chip `text-[11-12px] uppercase tracking-wide`. Maks 2 font — tidak ada pengecualian.

## 6. A11y baseline

Kontras teks AA (cyan-strong & pink-strong sudah lolos di putih); fokus `:focus-visible` ring cyan global; touch target ≥40px; ikon dekoratif `aria-hidden`; `MediaPlaceholder` ber-`role="img"`+label; reduced-motion mematikan semua animasi.
