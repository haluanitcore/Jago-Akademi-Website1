# Rencana Desain & Dokumentasi Platform Jago Akademi

Rencana ini merinci langkah-langkah pembuatan rangkaian dokumen bisnis, produk, arsitektur sistem, dan rencana kerja (roadmap) untuk platform edukasi digital **Jago Akademi**. Desain ini dirancang dengan mengambil inspirasi dari platform **MySkill.id** sebagai tolok ukur (benchmark) utama, kemudian disesuaikan dengan 6 unit bisnis utama Jago Akademi:
1. **Trainer Program** (Sertifikasi & Program Profesional)
2. **Paket LMS** (B2B SaaS untuk Institusi)
3. **Event** (Internal & Kolaborasi Kreator/Komunitas)
4. **E-Course** (Video Learning Mandiri)
5. **E-Book** (Buku Digital)
6. **Marketplace Materi Event** (Penjualan Rekaman & Modul)

---

## User Review Required

> [!IMPORTANT]
> Dokumen rancangan yang akan dibuat merupakan cetak biru (blueprint) bagi tim bisnis dan tim engineering. Sebelum melanjutkan ke tahap penulisan detail spesifikasi, kami membutuhkan jawaban dan keputusan Anda untuk 31 pertanyaan di bawah ini guna menyelaraskan kebutuhan bisnis dan teknis.

---

## Pertanyaan Proyek (Open Questions - Minimal 30 Pertanyaan)

Berikut adalah daftar pertanyaan mendalam yang dibagi berdasarkan aspek bisnis, fungsional, dan teknis platform Jago Akademi. Mohon tinjau dan berikan arahan Anda:

### A. Model Bisnis & Monetisasi (Business Model & Monetization)
1. **Skema Pembayaran E-Course**: Apakah akses E-Course menggunakan model **Langganan Flat / Membership** (misal: langganan bulanan/tahunan untuk akses semua course seperti MySkill) atau model **Pay-per-Course** (beli putus per kelas)?
2. **Monetisasi E-Book**: Apakah E-Book akan dijual terpisah secara e-commerce (satuan), atau dimasukkan sebagai bagian dari keuntungan langganan premium?
3. **Bagi Hasil Marketplace Materi**: Untuk penjualan di Marketplace Materi Event, berapa persentase komisi bagi hasil (platform fee) yang akan diambil oleh Jago Akademi dari kreator luar?
4. **Kebijakan Refund**: Bagaimana aturan pengembalian dana (refund policy) untuk tiket event yang batal dihadiri peserta atau e-course yang ingin di-cancel oleh student?
5. **Sistem Afiliasi (Affiliate Program)**: Berapa persen komisi yang diberikan kepada affiliate partner, dan berapa lama masa aktif cookie pelacakan link afiliasi (misal: 30 hari)?
6. **Logika Kode Kupon/Promo**: Apakah kupon diskon dapat digunakan secara akumulatif (digabungkan dengan promo lain), atau hanya dibatasi satu kupon per transaksi?

### B. Unit Bisnis 1: Trainer Program
7. **Proses Seleksi Calon Trainer**: Apakah pendaftaran Trainer Program terbuka secara instan (siapa saja bisa beli), atau memerlukan seleksi berkas/administrasi oleh admin sebelum pembayaran dibuka?
8. **Alur Ujian & Sertifikasi**: Bagaimana mekanisme ujian kelulusan untuk mendapatkan sertifikat profesional? Apakah berupa kuis otomatis di web, tugas proyek/portofolio yang dinilai manual oleh asesor, atau wawancara langsung?
9. **Masa Berlaku Sertifikat**: Berapa lama masa berlaku sertifikat kompetensi trainer yang diterbitkan? Apakah ada proses ujian penyegaran (resertifikasi) secara berkala?

### C. Unit Bisnis 2: Paket LMS (B2B SaaS)
10. **Model Multi-Tenancy**: Apakah Paket LMS dirancang sebagai **Multi-Tenant SaaS** (setiap institusi memiliki subdomain tersendiri seperti `sekolah.jagoakademi.com` dengan isolasi data) atau sebagai server custom yang di-deploy terpisah untuk masing-masing klien?
11. **Fitur White-Labeling**: Apakah institusi dapat melakukan kustomisasi visual penuh (mengganti logo, warna tema, favicon, dan nama aplikasi)?
12. **Custom Domain**: Apakah institusi diizinkan menggunakan domain kustom mereka sendiri (misal: `lms.sekolah.sch.id`) untuk mengakses portal LMS mereka?
13. **Metrik Batasan Harga LMS**: Bagaimana model penetapan harga paket LMS ditentukan (berdasarkan jumlah user terdaftar, jumlah user aktif bulanan/MAU, atau kapasitas penyimpanan file)?
14. **Kepatuhan Integrasi Akademik**: Apakah platform LMS wajib terintegrasi dengan sistem eksternal seperti Dapodik (untuk sekolah), SIAKAD (untuk universitas), atau HRIS (untuk korporat)?

### D. Unit Bisnis 3 & 6: Event & Marketplace Materi Event
15. **Manajemen Tiket & Kehadiran**: Bagaimana verifikasi kehadiran peserta event (baik online maupun offline) dilakukan? Apakah menggunakan QR Code check-in, absensi manual, atau integrasi dengan Zoom API?
16. **Kolaborasi Kreator & Komunitas**: Bagaimana alur kerja sama dengan pihak eksternal untuk event kolaborasi? Apakah mereka akan mendapatkan dashboard khusus untuk memantau pendaftaran dan bagi hasil tiket?
17. **Status Kepemilikan Materi Marketplace**: Apakah produk di Marketplace Materi Event hanya berupa materi pasca-event resmi Jago Akademi, atau dibuka secara umum sehingga kreator luar bisa mengunggah dan menjual materi mereka sendiri (C2C)?
18. **Proteksi Hak Cipta Materi**: Apakah materi event (video rekaman, slide PDF, modul) boleh diunduh secara bebas oleh pembeli, atau wajib dilindungi (hanya bisa ditonton/dibaca di platform)?

### E. Fungsionalitas & Keamanan Konten (Content Security & Features)
19. **Keamanan Video (Anti-Piracy DRM)**: Apakah video pembelajaran E-Course memerlukan proteksi DRM tingkat tinggi (seperti Widevine/FairPlay via AWS Elemental MediaPackage) untuk mencegah screen recording dan pengunduhan ilegal?
20. **Keamanan E-Book**: Apakah e-book akan disajikan lewat PDF/EPUB Reader internal dengan fitur proteksi salin (copy-paste disable), atau pengguna diperbolehkan mengunduh file PDF mentah?
21. **Verifikasi Keaslian Sertifikat**: Apakah sertifikat kelulusan yang diterbitkan akan dilengkapi dengan QR Code verifikasi unik yang dapat dipindai oleh publik/recruiter untuk memvalidasi keaslian sertifikat di domain Jago Akademi?

### F. Integrasi Sistem (System Integration & Infrastructure)
22. **Payment Gateway**: Apa saja payment gateway target utama untuk memproses pembayaran di Indonesia (misal: Midtrans, Xendit, atau Doku)?
23. **Sistem Notifikasi**: Saluran notifikasi apa saja yang akan digunakan (WhatsApp OTP & Transaksi, Email Notifikasi, atau Push Notification di Browser)? Jika WhatsApp, apakah ada vendor yang sudah disepakati (misal: Fonnte, Waba)?
24. **Alur Pencairan Dana (Payout)**: Apakah proses pencairan dana untuk kreator, partner kolaborasi, dan affiliate akan menggunakan sistem pencairan otomatis (disbursement API seperti Xendit XenDisburse) atau ditransfer secara manual oleh tim keuangan mingguan/bulanan?
25. **CRM (Customer Relationship Management)**: Apakah modul CRM (follow-up lead, broadcast email pemasaran) dibangun secara internal (in-house) atau diintegrasikan dengan platform pihak ketiga seperti HubSpot, Salesforce, atau ActiveCampaign?

### G. Arsitektur, Skalabilitas, & Kepatuhan (Architecture & Compliance)
26. **Estimasi Beban Pengguna (Scalability)**: Berapa estimasi target Monthly Active Users (MAU) dan Peak Concurrent Users (CCU) pada fase awal peluncuran untuk panduan rancangan infrastruktur cloud?
27. **Teknologi Pilihan (Tech Stack)**: Apakah ada batasan atau preferensi teknologi tertentu dari manajemen (misal: Next.js + Laravel, MERN stack, Go, PostgreSQL, AWS)?
28. **Kepatuhan Privasi Data (PDP)**: Apakah arsitektur basis data harus mematuhi UU Perlindungan Data Pribadi (UU PDP) Indonesia, seperti kewajiban menyimpan data pengguna di server lokal (cloud region Jakarta)?
29. **Manajemen Role & Permission**: Bagaimana detail hak akses untuk 8 peran pengguna (Visitor, Student, Trainer, Event Participant, Corporate Client, Partner, Creator, Super Admin)? Apakah menggunakan model RBAC (Role-Based Access Control) yang dinamis?
30. **Sistem Log & Audit Trail**: Apakah diperlukan sistem pelacakan aktivitas admin (Audit Trail) untuk mencatat setiap perubahan konfigurasi sistem, data pengguna, dan transaksi keuangan demi keamanan internal?
31. **Integrasi Analytics & SEO**: Alat analitik dan tracking pixel apa saja yang harus terpasang dari awal (misal: Google Analytics 4, Meta Pixel, Google Tag Manager), dan bagaimana mekanisme optimasi SEO on-page (dynamic meta tags, sitemap otomatis) untuk seluruh modul kursus dan e-book?

---

## Rencana Pembuatan Dokumen (Proposed Changes)

Setelah pertanyaan di atas mendapat arahan dari Anda, kami akan membuat dokumen-dokumen berikut di direktori `docs/` workspace:

1. **`docs/myskill_analysis.md`**: Analisis mendalam fitur, user flow, ekosistem belajar, dan strategi MySkill.id.
2. **`docs/brd.md`**: Business Requirement Document lengkap.
3. **`docs/prd.md`**: Product Requirement Document terperinci untuk tim developer.
4. **`docs/system_design.md`**: Arsitektur sistem, skema database, dan spesifikasi API.
5. **`docs/user_journey.md`**: Alur lengkap untuk 8 role pengguna (dalam diagram/tabel alur).
6. **`docs/roadmap.md`**: Rencana kerja 10 fase dari Discovery hingga Launch & Growth.

---

## Rencana Rencana Verifikasi (Verification Plan)

Kami akan melakukan pemeriksaan kualitas dokumen secara mandiri meliputi:
- **Kebenaran Markdown**: Memastikan semua link internal, tabel, dan format terbaca dengan baik.
- **Kesesuaian Mermaid**: Memvalidasi semua diagram arsitektur dan flowchart user journey agar ter-render sempurna tanpa error sintaks.
- **Kelengkapan Fitur**: Menjamin seluruh unit bisnis (LMS, E-Course, E-Book, Event, Trainer, Marketplace) terakomodasi secara konsisten di seluruh dokumen.
