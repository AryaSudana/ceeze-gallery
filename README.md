# 📸 CeEZe Gallery - Google Drive Client Photo Gallery & Editor

**CeEZe Gallery** adalah web aplikasi modern yang mengonversi folder Google Drive menjadi website galeri foto klien yang interaktif, mewah, responsif, dan siap pakai—mirip seperti **Picspot**.

Aplikasi ini dirancang **ultra-ringan (0 dependensi build)**, aman, dan dapat dibuka dengan sangat cepat di smartphone (HP), tablet, maupun PC / laptop.

---

## 🌟 Fitur Utama

1. **Sinkronisasi Google Drive Tanpa Server Besar:**
   - Cukup masukkan link folder Google Drive publik.
   - Semua foto tetap disimpan di Google Drive kamu, bandwidth & resolusi tinggi ditanggung oleh CDN Google.
2. **Editor & Live Customizer Interaktif:**
   - **Preset Desain:** *Dark Luxury*, *Clean White*, *Warm Beige*, *Velvet Noir*, dan *Editorial White*.
   - **Tata Letak:** Pilihan layout *Masonry* (ala Pinterest) atau *Grid Kotak Simetris*.
   - **Pengaturan Kolom:** Slider kolom khusus PC (2–6 kolom) dan mobile HP (1–2 kolom).
   - **Custom Color & Font:** Color picker untuk latar belakang, teks, aksen, dan pilihan font editorial/wedding.
   - **Judul & Deskripsi:** Ubah judul dan tanggal pemotretan secara langsung.
3. **Client Proofing & Favorit (❤️ Selection):**
   - Klien bisa memilih foto favorit dengan menekan tombol hati.
   - Tombol **Kirim ke WhatsApp**: Mengirimkan daftar nomor foto yang dipilih langsung ke WhatsApp fotografer/studio dalam format rapi.
4. **Touch & Keyboard Lightbox:**
   - Tampilan foto layar penuh dengan navigasi panah keyboard di PC dan gestur usap (*swipe*) di HP/tablet.
   - Tombol download langsung untuk mengunduh foto resolusi asli.
5. **Bagikan Desain Seketika (Share Link):**
   - Menghasilkan link khusus yang sudah menyertakan seluruh konfigurasi tema kamu tanpa perlu database terpisah!

---

## 🚀 Cara Menjalankan Secara Lokal (Di Komputer Kamu)

Karena web ini dibangun dengan standar web modern tanpa proses kompilasi (`npm install` yang rumit):
1. Buka folder ini di File Explorer: `c:\DATA\1. CRM\ARYA`
2. Klik dua kali pada file `index.html`.
3. Web langsung terbuka di browser (Chrome, Edge, Safari, dll) dan bisa langsung dicoba!

---

## 🌐 Cara Mengonlinekan dengan Domain Milikmu (Gratis Hosting)

Kamu bisa menggunakan **Vercel** atau **Netlify**:

### Langkah 1: Upload ke GitHub
1. Buat repositori baru di [GitHub.com](https://github.com), misalnya beri nama `ceeze-gallery`.
2. Upload semua file dari folder ini ke repositori tersebut.

### Langkah 2: Hubungkan ke Vercel
1. Buka [Vercel.com](https://vercel.com) dan login dengan akun GitHub kamu.
2. Klik **"Add New Project"** > pilih repositori `ceeze-gallery`.
3. Klik **"Deploy"** (tanpa perlu ubah pengaturan apapun).
4. Web kamu langsung aktif dengan URL sementara.

### Langkah 3: Sambungkan Domain Kamu
1. Di dashboard Vercel, buka menu **Settings** > **Domains**.
2. Masukkan nama domain kamu (misal: `domainkamu.com` atau `gallery.domainkamu.com`).
3. Buka dashboard tempat kamu membeli domain (Niagahoster, Domainesia, Namecheap, Cloudflare, dll):
   - Masuk ke menu **DNS Management**.
   - Tambahkan record sesuai instruksi Vercel:
     - **Tipe A:** Host `@`, Target `76.76.21.21` (untuk domain utama)
     - **Tipe CNAME:** Host `www` atau subdomain (misal `gallery`), Target `cname.vercel-dns.com`
4. Selesai! Web kamu sudah aktif di domain sendiri dengan sertifikat keamanan SSL/HTTPS gratis.

---

## 🔑 Cara Mendapatkan Google Drive API Key (Gratis)

Untuk membaca folder Google Drive sendiri:
1. Masuk ke [Google Cloud Console](https://console.cloud.google.com/).
2. Buat Project baru (misal: *CeEZe Gallery*).
3. Buka menu **APIs & Services** > **Library** > cari dan aktifkan **Google Drive API**.
4. Buka menu **Credentials** > klik **Create Credentials** > pilih **API Key**.
5. Salin API Key tersebut, lalu masukkan ke dalam tombol **"Drive API"** di bagian atas website.
6. Pastikan folder Google Drive yang ingin kamu tampilkan sudah disetel izinnya menjadi: **"Anyone with the link can view"** (Siapa saja yang memiliki link dapat melihat).
