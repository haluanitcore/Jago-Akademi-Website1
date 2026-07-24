# Design Tokens Final + Prompt Stitch — Jago Akademi

> Lanjutan dari `REDESIGN_BRIEF.md`. Berisi (A) token desain final arah **evolusi brand**, dan (B) prompt Google Stitch siap-tempel untuk tema + shell + template Gelombang 1.
> Cara pakai: tempel **§B.0 Prompt Tema** dulu di Stitch (jadi acuan), lalu tempel prompt shell & template satu per satu. Setiap prompt sudah menyebut ulang tema agar konsisten.

---

## A. TOKEN DESAIN FINAL

Brand inti dipertahankan (cyan `#0077A8`, gradien cyan→ungu→pink, Plus Jakarta Sans + Inter). Yang dimodernkan: skala sistematis, netral lebih bersih, shadow lebih lembut & berlapis, spasi lebih lega.

### A1. Warna

**Brand cyan (ramp):**
| Token | Hex | Pakai |
|---|---|---|
| `--cyan-50` | `#E6F4FA` | latar aksen sangat lembut |
| `--cyan-100` | `#C0E3F1` | chip, highlight |
| `--cyan-500` | `#0077A8` | **primary** — tombol, link, aksen |
| `--cyan-600` | `#005F87` | hover |
| `--cyan-700` | `#004A6B` | active/tekan |

**Aksen (gradien signature):**
| Token | Hex |
|---|---|
| `--purple-500` | `#7C3AED` |
| `--pink-500` | `#CC0052` |
| **Gradien brand** | `linear-gradient(100deg, #0077A8 0%, #7C3AED 55%, #CC0052 100%)` |

**Netral:**
| Token | Hex (light) | Hex (dark) |
|---|---|---|
| `--text-primary` | `#1D1D1F` | `#F5F5F7` |
| `--text-secondary` | `#6E6E73` | `#A1A1A6` |
| `--text-muted` | `#9CA3AF` | `#8E8E93` |
| `--surface-page` | `#F5F5F7` | `#0B0B0D` |
| `--surface-card` | `#FFFFFF` | `#1C1C1E` |
| `--surface-sunken` | `#EDEDF0` | `#141416` |
| `--border` | `#E5E5EA` | `#2C2C2E` |
| `--border-strong` | `#D1D1D6` | `#3A3A3C` |

**Semantik:**
| Peran | Teks | Latar |
|---|---|---|
| Sukses | `#16A34A` | `#DCFCE7` |
| Bahaya | `#DC2626` | `#FEE2E2` |
| Peringatan | `#B45309` | `#FEF3C7` |
| Info | `#0077A8` | `#E6F4FA` |

### A2. Tipografi
- **Display/heading:** Plus Jakarta Sans — 600/700/800.
- **Body/UI:** Inter — 400/500/600.

| Token | Ukuran / line-height | Pakai |
|---|---|---|
| `display` | 48–60px / 1.05, 800 | hero |
| `h1` | 36px / 1.15, 700 | judul halaman |
| `h2` | 30px / 1.2, 700 | judul section |
| `h3` | 24px / 1.25, 600 | sub-judul |
| `h4` | 20px / 1.3, 600 | kartu |
| `body-lg` | 18px / 1.6, 400 | lead paragraph |
| `body` | 16px / 1.6, 400 | teks utama |
| `body-sm` | 14px / 1.5, 400 | caption, tabel |
| `label` | 13px / 1.4, 600 | label form, badge |

### A3. Spasi (skala 4px)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96` → token `--space-1..9`. Section publik: padding vertikal 64–96px. Kartu: padding 20–24px.

### A4. Radius
`--radius-sm 8 · --radius-md 12 · --radius-lg 16 · --radius-xl 20 · --radius-pill 999`.

### A5. Shadow (lebih lembut & berlapis)
| Token | Nilai |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(16,24,40,.06)` |
| `--shadow-md` | `0 4px 12px rgba(16,24,40,.08)` |
| `--shadow-lg` | `0 12px 32px rgba(16,24,40,.12)` |
| `--shadow-brand` | `0 8px 24px rgba(0,119,168,.20)` (tombol/kartu utama) |

### A6. Motion
Transisi `150–250ms cubic-bezier(.4,0,.2,1)`. Hover: angkat 1–2px + shadow naik. Hormati `prefers-reduced-motion`.

---

## B. PROMPT GOOGLE STITCH (siap tempel)

### B.0 — PROMPT TEMA (tempel PERTAMA, jadikan acuan)

```
Buat design system untuk platform edukasi "Jago Akademi" (bahasa Indonesia).
Gaya: modern, bersih, premium, ramah — terinspirasi kejernihan Apple dengan aksen
gradien energik.

WARNA:
- Primary cyan #0077A8 (hover #005F87). Latar halaman #F5F5F7, kartu putih #FFFFFF.
- Teks utama #1D1D1F, teks sekunder #6E6E73.
- Aksen gradien signature: linear-gradient(100deg,#0077A8,#7C3AED,#CC0052) —
  dipakai HANYA untuk judul hero & elemen unggulan, jangan berlebihan.
- Sukses #16A34A, bahaya #DC2626, peringatan #B45309, info #0077A8.
- Sediakan varian dark mode (latar #0B0B0D, kartu #1C1C1E, teks #F5F5F7).

TIPOGRAFI: heading pakai Plus Jakarta Sans (bold), body pakai Inter.
Hero 48–60px, H1 36, H2 30, H3 24, body 16 line-height 1.6.

BENTUK: sudut membulat (kartu 12–16px, tombol pill 999px). Shadow lembut berlapis,
bukan tebal. Spasi lega (section 64–96px).

KOMPONEN yang harus konsisten di semua layar: tombol (primary gradien/cyan,
secondary outline, ghost), input & form field dengan label, kartu, tabel,
modal, badge status (sukses/pending/gagal), empty-state ramah, skeleton loading.

Semua layar WAJIB: responsif (desktop + mobile, tanpa scroll horizontal),
mendukung light & dark mode, aksesibel (kontras cukup, fokus terlihat).
```

### B.1 — SHELL S1: Navbar + Footer publik

```
Pakai design system Jago Akademi. Desain NAVBAR global publik:
- Kiri: logo "Jago Akademi". Tengah: menu E-Course, Event, dropdown "Produk"
  (E-Book, Kelas Gratis, Trainer Program, Paket LMS, Marketplace, Private Class),
  dropdown "Komunitas" (Alumni, Portofolio Member, Community), Blog, Tentang.
- Kanan: link "Kolaborasi" + tombol "Masuk" (outline) & "Dashboard" (primary).
- Sticky, latar putih blur, border bawah tipis. Versi mobile: hamburger →
  drawer full-screen dengan grup menu yang sama.
Lalu desain FOOTER: 4 kolom (Belajar, Program, Perusahaan, Kontak) + logo +
sosial + tombol WhatsApp + copyright. Sertakan versi light & dark.
```

### B.2 — SHELL S2: Auth shell

```
Pakai design system Jago Akademi. Desain kerangka halaman AUTENTIKASI:
kartu tengah (max 420px) di atas latar bersih dengan sentuhan gradien brand
halus di sudut, logo di atas kartu, tanpa navbar/footer. Kartu punya judul,
sub-teks, area form, dan link bantuan di bawah. Responsif + dark mode.
```

### B.3 — T1: Homepage

```
Pakai design system Jago Akademi. Desain HOMEPAGE:
1. Hero: badge "Early Bird Diskon 40%", judul besar 2 baris dengan kata kunci
   memakai gradien brand, sub-teks, dan kartu countdown (jam:menit:detik) +
   form tangkap email di sisi kanan.
2. Grid kategori kursus (kartu ikon).
3. Section "Kenapa Jago Akademi" (pillars, 3–4 kartu benefit).
4. Spotlight e-course (carousel/grid kartu kursus dengan harga).
5. Testimoni (kartu kutipan + rating; sediakan juga versi kosong yang rapi).
6. Band B2B (ajakan Paket LMS perusahaan).
7. Band early-access penutup dengan CTA.
Responsif + dark mode. Sertakan state hero saat form loading & sukses.
```

### B.4 — T2: Marketing landing (template)

```
Pakai design system Jago Akademi. Desain TEMPLATE landing marketing (dipakai
untuk About, Kolaborasi, Afiliasi, Trainer Program, Paket LMS, Early Access,
Private Class, Community):
- Hero: judul + sub-teks + 1 CTA utama + ilustrasi/visual kanan.
- Grid benefit (4–6 kartu ikon).
- Section penjelasan alur (langkah bernomor).
- Form lead (nama, email, telepon, pesan) dengan state: idle, submitting,
  sukses ("Terima kasih"), error. + CTA sekunder tombol WhatsApp.
- Untuk varian "paket" (Private Class): tampilkan kartu paket bertingkat
  dengan badge "Paling Populer", checklist benefit, harga (+harga coret promo).
Responsif + dark mode.
```

### B.5 — T3: Listing / katalog grid (template)

```
Pakai design system Jago Akademi. Desain TEMPLATE halaman katalog (dipakai
untuk E-Course, E-Book, Event, Blog, Marketplace, Kelas Gratis, Alumni,
Portofolio Member):
- Header halaman (judul + deskripsi singkat).
- Bar filter/search + tab kategori (chip).
- Grid kartu (thumbnail, judul, meta, harga/label, tombol). 3–4 kolom desktop,
  1–2 mobile.
- Pagination / "Muat lebih banyak".
Sertakan 3 state: loading (skeleton kartu), kosong (empty-state ramah + CTA),
dan berisi data. Responsif + dark mode.
```

### B.6 — T4: Detail item (template)

```
Pakai design system Jago Akademi. Desain TEMPLATE halaman detail (dipakai untuk
detail E-Book, Event, Blog, Mentor, Portofolio Member, materi E-Course):
- Header: judul, meta (kategori, tanggal, penulis/mentor), thumbnail/cover besar.
- Kolom konten utama (deskripsi/artikel/kurikulum) + sidebar sticky berisi
  kartu aksi (harga + tombol "Beli"/"Daftar"/"Mulai", info tambahan).
- Section terkait di bawah (kartu rekomendasi).
- State: loading (skeleton) & 404 ("Konten tidak ditemukan" yang rapi).
Responsif (sidebar pindah ke bawah di mobile) + dark mode.
```

### B.7 — T11: Auth form (template, 6 varian)

```
Pakai design system Jago Akademi + auth shell. Desain form AUTENTIKASI dalam
kartu tengah, 6 varian:
1. Masuk: email + password + "lupa password?" + tombol masuk + tombol Google +
   link "Daftar".
2. Daftar: nama + email + password + tombol daftar + Google + link "Masuk".
3. Lupa password: email + tombol kirim + state "email terkirim".
4. Reset password: password baru + konfirmasi + tombol simpan.
5. Verifikasi email: pesan status (loading / berhasil / gagal) + CTA.
6. Callback OAuth: layar loading singkat.
Setiap form punya state error (pesan merah di bawah field) & loading (tombol
spinner). Responsif + dark mode.
```

### B.8 — T8: Checkout

```
Pakai design system Jago Akademi. Desain halaman CHECKOUT satu item:
- Kiri: kartu ringkasan item (thumbnail, judul, harga), input kode kupon dengan
  tombol "Terapkan" (+ state kupon valid/invalid), rincian total.
- Kanan/bawah: tombol "Bayar Sekarang" besar + logo metode pembayaran + catatan
  keamanan.
- State: loading item, kupon diproses, dan sedang redirect ke pembayaran.
Responsif + dark mode.
```

### B.9 — T9: Hasil pembayaran (1 template, 3 status)

```
Pakai design system Jago Akademi. Desain halaman HASIL PEMBAYARAN, 3 varian:
1. Sukses: ikon centang animasi, "Pembayaran Berhasil", ringkasan pesanan,
   daftar "Apa selanjutnya?", tombol "Mulai Belajar" & "Lihat Pesanan".
   + Varian khusus Private Class: kartu onboarding (langkah 1–4, tombol
   "Chat Admin" WhatsApp & "Join Grup Mentoring").
2. Pending: ikon jam, "Menunggu Pembayaran", instruksi + tombol cek status.
3. Gagal: ikon silang, "Pembayaran Gagal", alasan + tombol "Coba Lagi" &
   "Kembali ke Beranda".
Responsif + dark mode.
```

---

## C. Setelah Semua Template Jadi

Lanjut ke Gelombang 2–4 (dashboard member, admin/trainer, LMS) dengan pola prompt yang sama. Lalu implementasi mengikuti **kontrak presentation-only** di `REDESIGN_BRIEF.md` §5: buat layer token (§A) di kode dulu, bangun kit komponen, reskin per template di branch terpisah, jaga 458 test API + 120 E2E tetap hijau.
