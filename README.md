# 📸 CeEZe Studio - Luxury Client Photo Proofing & Showcase Platform

> **CeEZe Studio** (`ceeze-studio.my.id`) adalah platform web modern untuk fotografer dan studio foto yang mengonversi folder Google Drive menjadi galeri foto klien yang interaktif, mewah, elegan, dan siap kurasi—terinspirasi dari platform proofing kelas dunia seperti.

Platform ini dirancang dengan prinsip **Zero-Build & Ultra-Lightweight**: tanpa dependensi server yang berat, loading instan di semua perangkat (PC, tablet, dan smartphone), serta memanfaatkan CDN Google Drive untuk menyajikan foto resolusi penuh.

---

## 🧭 Struktur Halaman Web (Application Map)

Aplikasi CeEZe Studio V2 terbagi menjadi **4 halaman utama** yang saling terintegrasi:

```
                  ┌─────────────────────────────────────────┐
                  │    🏠 HOMEPAGE (index.html)             │
                  │    • Perkenalan Platform CeEZe Studio   │
                  │    • Interactive Live Mini-Demo         │
                  │    • Gate Akses "+ Buat Galeri"         │
                  └────────────────────┬────────────────────┘
                                       │ (Masukkan License Key)
                                       ▼
┌──────────────────────────────────────┴──────────────────────────────────────┐
│  🎨 STUDIO EDITOR (editor.html)                                             │
│  • Panel pengaturan studio berdesain gelap paten (Fixed Studio UI)         │
│  • Sinkronisasi Google Drive (auto-fetch ratusan foto secara berurutan)     │
│  • Kustomisasi visual: Preset tema, layout masonry/grid, font, dan slider   │
│  • Pratinjau responsif: Layar Desktop vs. Realistic Smartphone Mockup       │
│  • Pengaturan masa aktif tautan (7, 14, 30, 90 hari, atau selamanya)        │
│  • Generator tautan bersih klien (Clean URL: /gallery.html?f=FOLDER_ID)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ (Kirim Link ke Klien)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  📸 CLIENT GALLERY (gallery.html)                                           │
│  • Tampilan galeri khusus klien yang bersih dan bebas distraksi editor      │
│  • Pengecekan masa aktif galeri otomatis (Expired Protection Gate)          │
│  • Kurasi foto pilihan (❤️ Love Selection)                                  │
│  • Filter foto pilihan (hanya menampilkan foto yang disukai)                │
│  • Unduh sekaligus dalam format ZIP (Batch ZIP Download)                    │
│  • Ekspor daftar foto pilihan langsung ke WhatsApp studio                   │
│  • Fullscreen Lightbox dengan navigasi keyboard & swipe sentuh              │
└─────────────────────────────────────────────────────────────────────────────┘

                                       ▲
                                       │ (Kelola Kunci & Kuota)
┌──────────────────────────────────────┴──────────────────────────────────────┐
│  🛡️ MASTER ADMIN PORTAL (admin.html)                                        │
│  • Akses rahasia pemilik studio terproteksi Master PIN                      │
│  • Generator lisensi unik klien: CEEZE-<NAMA>-<KODE>                        │
│  • Pembatasan kuota pembuatan galeri (misal: 1 galeri, 2 galeri, dsb)       │
│  • Pelacak status penggunaan kuota galeri aktif                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Gambaran Detail Setiap Halaman

### 1. 🏠 Homepage (`index.html`)
- **Tampilan Depan:** Menghadirkan identitas CeEZe Studio dengan tipografi modern, aksen luxury dark, dan informasi fitur unggulan.
- **Interactive Live Mini-Demo:** Di bagian showcase demo, pengunjung atau fotografer dapat langsung mencoba berganti layout (*Masonry Flow* vs *Grid Simetris*) serta berganti tema (*Dark Luxury*, *Clean White*, *Warm Beige*) secara langsung di tempat.
- **Akses Cepat "+ Buat Galeri":** Modal aman yang meminta License Key unik sebelum diarahkan ke halaman editor.

---

### 2. 🎨 Studio Editor (`editor.html`)
- **Fixed Studio Interface:** Seluruh navbar header, logo **CeEZe Studio**, tombol-tombol navigasi, dan panel sidebar pengaturan terkunci dalam tema gelap studio profesional (*Dark Studio UI*). Mengubah warna tema klien tidak akan merusak warna UI editor maupun warna slider.
- **Google Drive Synchronizer:** Cukup masukkan link folder Google Drive publik. Sistem secara cerdas memproses ID folder, melakukan auto-paginasi (tanpa batas 100 foto), dan mengurutkan nama file secara natural (`001`, `002`, `003`... hingga ribuan foto).
- **Pengaturan Lengkap:**
  - **Preset Tema:** *Dark Luxury*, *Clean White*, *Warm Beige*, *Velvet Noir*, dan *Editorial White*.
  - **Color Pickers:** Pilihan bebas warna background, teks, dan aksen galeri.
  - **Slider Pengaturan:**
    - Kolom di PC / Laptop (2 – 6 kolom)
    - Kolom di HP / Mobile (1 – 2 kolom)
    - Jarak Antar Foto (*Gap*: 0 – 40px)
    - Sudut Melengkung Foto (*Border Radius*: 0 – 24px)
  - **Tipografi:** Pilihan font editorial seperti *Plus Jakarta Sans*, *Playfair Display*, *Cinzel*, dan *Inter*.
  - **Urutan Foto:** Pilihan sorting normal (`1 ➔ 999`) atau terbalik (`999 ➔ 1`).
- **Pratinjau Dua Mode (Desktop & Smartphone Mockup):**
  - **Mode Desktop:** Melihat galeri dalam format layar lebar.
  - **Mode Mobile:** Layar kanvas bertransformasi menjadi **mockup smartphone realistis** (dilengkapi bingkai bezel elegan, *dynamic notch* atas, dan *home bar* bawah) dengan susunan foto 1 kolom rapi.
- **Masa Aktif & Penerbitan:** Menentukan berapa lama klien dapat mengakses galeri sebelum link dinonaktifkan secara otomatis. Menghasilkan tautan bersih khusus klien (*Clean URL*).

---

### 3. 📸 Client Gallery (`gallery.html`)
- **Tampilan Bersih & Eksklusif:** Halaman murni tanpa sidebar atau menu editor. Klien disuguhkan foto-foto dengan estetika tinggi sesuai tema yang telah diatur oleh studio.
- **Sistem Kurasi Foto Favorit (❤️):**
  - Klien dapat menandai foto yang mereka sukai dengan menekan tombol hati.
  - Icon aksi pada foto di mobile berukuran ringkas (*compact 28px glassmorphism*) di sudut foto sehingga tidak menutupi keindahan karya foto.
- **Filter Foto Pilihan:** Menekan tombol hati di navbar atas otomatis menyaring galeri untuk hanya menampilkan foto-foto yang telah disukai.
- **Kirim ke WhatsApp:** Sekali klik, sistem menyusun nomor file foto favorit klien ke dalam pesan rapi yang siap dikirim langsung ke WhatsApp studio.
- **Download Satuan & Download ZIP:**
  - Klien dapat mengunduh foto satuan beresolusi penuh.
  - Klien dapat mengunduh seluruh foto favorit sekaligus dalam format **ZIP** langsung dari browser tanpa aplikasi tambahan.
- **Fullscreen Lightbox:** Melihat foto satu per satu dalam layar penuh, lengkap dengan navigasi tombol panah keyboard di komputer dan navigasi geser (*swipe touch*) di layar smartphone.
- **Expired Protection:** Jika masa aktif galeri telah habis, sistem otomatis menutup akses galeri dan menampilkan halaman pengingat masa aktif dengan tombol kontak WhatsApp studio.

---

### 4. 🛡️ Master Admin Portal (`admin.html`)
- **Proteksi Master PIN:** Portal diamankan dengan PIN master studio sehingga hanya tim CeEZe Studio yang dapat mengaksesnya.
- **Generator License Key Klien:** Membuat kunci akses unik dengan format nama klien, contoh: `CEEZE-ARIS-7X29`.
- **Manajemen Kuota Galeri:** Mengatur batas kuota berapa banyak galeri yang boleh dibuat oleh pemegang kunci (misal: 1 galeri, 2 galeri, atau lebih). Klien yang telah menghabiskan kuotanya tidak akan bisa mempublikasikan galeri baru sampai kuotanya ditambah.
- **Quota Tracker:** Menampilkan daftar kunci yang sudah dibuat, tanggal pembuatan, status aktif, dan sisa kuota yang belum terpakai.

---

## 🛠️ Ringkasan Teknologi (Technology Stack)

| Komponen | Spesifikasi & Teknologi |
| :--- | :--- |
| **Arsitektur** | Zero-Build Static Web (HTML5, Modern CSS3, Vanilla JavaScript ES6+) |
| **Penyimpanan Foto** | Google Drive Cloud Storage (Direct Google User Content CDN) |
| **API** | Google Drive API v3 (Auto-pagination `pageSize=1000` & Natural Alphanumeric Sort) |
| **File Compression** | JSZip (Client-side in-memory ZIP archiver tanpa beban server) |
| **State Management** | LocalStorage Engine untuk Lisensi, Kuota, Metadata Galeri, & Foto Favorit |
| **Desain & Responsif** | CSS Custom Properties (Variables), Flexbox Flow, CSS Grid, Touch Gestures |
| **Deployment Target** | Vercel Serverless Edge Network & Custom Domain `ceeze-studio.my.id` |

---

## 📁 Struktur Direktori File

```
├── index.html            # Halaman utama CeEZe Studio & Interactive Mini-Demo
├── gallery.html          # Halaman galeri khusus klien & proofing
├── editor.html           # Studio editor untuk fotografer
├── admin.html            # Master admin portal untuk generate kunci & kuota
├── vercel.json           # Konfigurasi routing & header keamanan Vercel
├── netlify.toml          # Konfigurasi deployment alternatif Netlify
├── README.md             # Dokumentasi resmi aplikasi
│
├── css/
│   ├── style.css         # Desain utama, tema luxury, smartphone frame & layout
│   └── responsive.css    # Optimasi breakpoint smartphone, tablet, & touch controls
│
└── js/
    ├── app.js            # Inisialisasi aplikasi & router pembantu
    ├── auth.js           # Sistem otentikasi PIN, validasi lisensi, & kuota
    ├── demo-data.js      # Data foto sample untuk pratinjau offline & demo
    ├── drive.js          # Google Drive API Service, link extractor, & pagination
    ├── editor.js         # Engine customizer realtime & styling protector
    ├── favorites.js      # Pengelola kurasi favorit, WhatsApp exporter & ZIP
    └── lightbox.js       # Penampil foto fullscreen dengan gestur swipe mobile
```

---

<p align="center">
  <b>CeEZe Studio Platform V2</b> • Crafted for Modern Visual Storytellers
</p>
