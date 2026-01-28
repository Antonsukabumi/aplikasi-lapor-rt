# Epic Story: Aplikasi Lapor RT

## 📱 Platform Target
> **Mobile-First**: Aplikasi ini didesain UTAMA untuk HP (Warga & Pak RT), bisa juga di laptop.

| Platform | Prioritas |
|----------|----------|
| HP (Mobile) | ⭐⭐⭐ Utama |
| Tablet | ⭐⭐ Sekunder |
| Laptop | ⭐ Tersier |

---

## Epic 1: Pelaporan Darurat Warga
> Sebagai **warga**, saya ingin **melapor kejadian penting ke RT dengan cepat**, agar **Pak RT bisa segera merespons dan membantu**.

### User Stories

#### US-1.1: Melihat Menu Utama
- **Sebagai** warga
- **Saya ingin** melihat 3 tombol besar di halaman depan
- **Agar** saya langsung tahu cara melapor tanpa bingung
- **Acceptance Criteria:**
  - [x] Tombol "Kabar Duka" berwarna merah
  - [x] Tombol "Warga Sakit" berwarna kuning
  - [x] Tombol "Bencana" berwarna biru
  - [x] Tombol cukup besar untuk lansia

#### US-1.2: Mengisi Form Laporan
- **Sebagai** warga
- **Saya ingin** mengisi form pelaporan yang simpel
- **Agar** saya bisa lapor dalam hitungan detik
- **Acceptance Criteria:**
  - [x] Field nama pelapor
  - [x] Field lokasi
  - [x] Field deskripsi
  - [ ] Upload foto (opsional)
  - [ ] Pin lokasi di peta

#### US-1.3: Konfirmasi Laporan Terkirim
- **Sebagai** warga
- **Saya ingin** melihat konfirmasi setelah laporan terkirim
- **Agar** saya yakin Pak RT akan menerima laporan saya
- **Acceptance Criteria:**
  - [x] Halaman sukses dengan ikon centang hijau
  - [x] Tombol kembali ke beranda

---

## Epic 2: Dashboard Admin (Pak RT)
> Sebagai **Pak RT**, saya ingin **melihat dan mengelola semua laporan warga**, agar **saya bisa merespons dengan cepat dan terorganisir**.

### User Stories

#### US-2.1: Login Aman
- **Sebagai** Pak RT
- **Saya ingin** login dengan PIN sederhana
- **Agar** hanya saya yang bisa akses dashboard
- **Acceptance Criteria:**
  - [x] Form input PIN 4 digit
  - [x] Validasi PIN benar/salah
  - [ ] Ganti PIN

#### US-2.2: Melihat Daftar Laporan
- **Sebagai** Pak RT
- **Saya ingin** melihat semua laporan yang masuk
- **Agar** tidak ada laporan yang terlewat
- **Acceptance Criteria:**
  - [x] Daftar laporan dengan nama & deskripsi
  - [x] Label warna sesuai jenis laporan
  - [x] Indikator laporan baru (dot merah)
  - [ ] Filter berdasarkan status/jenis
  - [ ] Pencarian laporan

#### US-2.3: Menandai Status Laporan
- **Sebagai** Pak RT
- **Saya ingin** menandai laporan sebagai "Selesai"
- **Agar** saya tahu mana yang sudah ditangani
- **Acceptance Criteria:**
  - [ ] Tombol ubah status
  - [ ] Status: BARU → DIBACA → SELESAI

---

## Epic 3: Notifikasi & Respons Real-time
> Sebagai **Pak RT**, saya ingin **menerima notifikasi yang jelas saat ada laporan baru dan bisa langsung merespons**, agar **warga tahu laporan mereka sudah diterima**.

### User Stories

#### US-3.1: Notifikasi WhatsApp
- **Sebagai** Pak RT
- **Saya ingin** terima pesan WhatsApp saat ada laporan darurat
- **Agar** saya bisa langsung tahu meski tidak buka aplikasi
- **Acceptance Criteria:**
  - [ ] Integrasi WhatsApp API (Fonnte/Twilio)
  - [ ] Pesan berisi: jenis, nama pelapor, lokasi
  - [ ] Link langsung ke dashboard

#### US-3.2: Notifikasi Push dengan Bunyi
- **Sebagai** Pak RT
- **Saya ingin** HP saya berbunyi khusus saat ada laporan
- **Agar** saya pasti tahu meski HP di saku
- **Acceptance Criteria:**
  - [ ] Push notification ke HP
  - [ ] Bunyi notifikasi khusus (beda dari WA biasa)
  - [ ] Vibration pattern khusus untuk darurat

#### US-3.3: Alarm di Dashboard
- **Sebagai** Pak RT yang sedang buka laptop
- **Saya ingin** dengar bunyi alarm saat ada laporan baru
- **Agar** tidak terlewat meski sedang kerja hal lain
- **Acceptance Criteria:**
  - [ ] Bunyi sirene/bell saat laporan masuk
  - [ ] Visual indicator (flash merah)
  - [ ] Bisa dimatikan sementara

#### US-3.4: Terima Laporan (Konfirmasi ke Warga)
- **Sebagai** Pak RT
- **Saya ingin** klik tombol "Terima Laporan"
- **Agar** warga tahu laporannya sudah saya baca
- **Acceptance Criteria:**
  - [ ] Tombol "Terima Laporan" di setiap item
  - [ ] Status berubah: BARU → DITERIMA
  - [ ] Warga dapat notifikasi "Laporan sudah diterima Pak RT"

#### US-3.5: Balas Laporan dengan Pesan
- **Sebagai** Pak RT
- **Saya ingin** kirim pesan balasan ke pelapor
- **Agar** warga tahu tindakan apa yang akan saya lakukan
- **Acceptance Criteria:**
  - [ ] Form balas pesan singkat
  - [ ] Contoh: "Segera ditangani jam 14.00"
  - [ ] Pesan terkirim ke WA/notifikasi warga

#### US-3.6: Hubungi Pelapor Langsung
- **Sebagai** Pak RT
- **Saya ingin** langsung telepon/WA pelapor dari dashboard
- **Agar** bisa koordinasi lebih detail
- **Acceptance Criteria:**
  - [ ] Tombol "Telepon" (click-to-call)
  - [ ] Tombol "WhatsApp" (buka WA dengan nomor terisi)

#### US-3.7: Update Status Bertahap
- **Sebagai** Pak RT
- **Saya ingin** update status laporan bertahap
- **Agar** warga bisa tracking progress
- **Acceptance Criteria:**
  - [ ] Status: BARU → DITERIMA → DIPROSES → SELESAI
  - [ ] Warna berbeda tiap status
  - [ ] Warga bisa lihat status di riwayat laporan

---

## Epic 4: Fitur Darurat & SOS
> Sebagai **warga dalam keadaan darurat**, saya ingin **mengirim sinyal SOS dengan satu klik**, agar **bantuan datang secepat mungkin**.

### User Stories

#### US-4.1: Tombol SOS
- **Sebagai** warga
- **Saya ingin** menekan tombol SOS saat darurat
- **Agar** RT dan tetangga langsung tahu lokasi saya
- **Acceptance Criteria:**
  - [ ] Tombol SOS besar di halaman utama
  - [ ] Otomatis kirim lokasi GPS
  - [ ] Notifikasi ke RT + tetangga terdekat

#### US-4.2: Daftar Nomor Darurat
- **Sebagai** warga
- **Saya ingin** melihat daftar nomor penting
- **Agar** saya bisa langsung telepon saat darurat
- **Acceptance Criteria:**
  - [ ] Nomor ambulans, pemadam, polisi
  - [ ] Nomor PLN, PDAM
  - [ ] Tombol langsung telepon (click-to-call)

---

## Epic 5: Fitur Komunitas
> Sebagai **warga**, saya ingin **berinteraksi dengan tetangga secara digital**, agar **terbentuk komunitas yang saling membantu**.

### User Stories

#### US-5.1: Gotong Royong Digital
- **Sebagai** warga
- **Saya ingin** meminta/menawarkan bantuan
- **Agar** tetangga bisa saling membantu
- **Acceptance Criteria:**
  - [ ] Form minta bantuan
  - [ ] Form tawarkan bantuan
  - [ ] Daftar permintaan/penawaran aktif

#### US-5.2: Forum Diskusi
- **Sebagai** warga
- **Saya ingin** diskusi masalah lingkungan
- **Agar** masalah bisa diselesaikan bersama
- **Acceptance Criteria:**
  - [ ] Buat topik diskusi
  - [ ] Balas komentar
  - [ ] Moderasi oleh admin

#### US-5.3: Lihat Pengumuman RT
- **Sebagai** warga
- **Saya ingin** melihat pengumuman dari RT
- **Agar** tidak ketinggalan info penting
- **Acceptance Criteria:**
  - [ ] Halaman daftar pengumuman
  - [ ] Label prioritas (Biasa/Penting/Darurat)
  - [ ] Notifikasi saat ada pengumuman baru

#### US-5.4: Kalender Kegiatan
- **Sebagai** warga
- **Saya ingin** melihat jadwal kegiatan RT
- **Agar** bisa ikut berpartisipasi
- **Acceptance Criteria:**
  - [ ] Tampilan kalender bulanan
  - [ ] Detail kegiatan (waktu, tempat)
  - [ ] Reminder/notifikasi sebelum acara

#### US-5.5: Riwayat Laporan Saya
- **Sebagai** warga
- **Saya ingin** melihat riwayat laporan yang pernah saya kirim
- **Agar** bisa tracking status laporan
- **Acceptance Criteria:**
  - [ ] Daftar laporan saya
  - [ ] Status terbaru (BARU/DITERIMA/DIPROSES/SELESAI)
  - [ ] Pesan balasan dari admin

---

## Epic 6: Aksesibilitas
> Sebagai **warga lansia/difabel**, saya ingin **aplikasi mudah digunakan**, agar **saya tidak kesulitan melapor**.

### User Stories

#### US-6.1: Voice Input
- **Sebagai** lansia
- **Saya ingin** melapor dengan suara
- **Agar** tidak perlu mengetik
- **Acceptance Criteria:**
  - [ ] Tombol mikrofon di form
  - [ ] Speech-to-text untuk deskripsi

#### US-6.2: Mode Teks Besar
- **Sebagai** warga dengan gangguan penglihatan
- **Saya ingin** memperbesar teks
- **Agar** saya bisa membaca dengan jelas
- **Acceptance Criteria:**
  - [ ] Tombol perbesar/perkecil font
  - [ ] Simpan preferensi

#### US-6.3: Mode Gelap
- **Sebagai** warga
- **Saya ingin** tampilan gelap
- **Agar** nyaman dipakai malam hari
- **Acceptance Criteria:**
  - [ ] Toggle mode gelap/terang
  - [ ] Warna kontras yang baik

---

## Epic 7: Bank Sampah
> Sebagai **warga**, saya ingin **menjual sampah ke Bank Sampah RT dan mendapat poin/uang**, agar **sampah bernilai dan lingkungan lebih bersih**.

### User Stories

#### US-7.1: Melihat Info Bank Sampah
- **Sebagai** warga
- **Saya ingin** melihat informasi Bank Sampah RT
- **Agar** saya tahu siapa pengelolanya dan cara menukar sampah
- **Acceptance Criteria:**
  - [ ] Halaman info Bank Sampah
  - [ ] Nama & kontak pengelola
  - [ ] Daftar jenis sampah yang diterima
  - [ ] Harga/poin per jenis sampah

#### US-7.2: Request Jemput Sampah
- **Sebagai** warga
- **Saya ingin** minta sampah saya dijemput
- **Agar** tidak perlu bawa sendiri ke Bank Sampah
- **Acceptance Criteria:**
  - [ ] Form request jemput
  - [ ] Pilih jenis sampah (plastik, kertas, logam, dll)
  - [ ] Estimasi berat
  - [ ] Alamat jemput
  - [ ] Jadwal jemput

#### US-7.3: Lihat Saldo Poin/Uang
- **Sebagai** warga
- **Saya ingin** melihat saldo poin/uang dari sampah saya
- **Agar** saya tahu berapa yang sudah terkumpul
- **Acceptance Criteria:**
  - [ ] Dashboard saldo warga
  - [ ] Riwayat transaksi
  - [ ] Poin bisa ditukar uang atau voucher

#### US-7.4: Dashboard Pengelola Bank Sampah
- **Sebagai** pengelola Bank Sampah
- **Saya ingin** melihat request jemput dan mengelola transaksi
- **Agar** bisa melayani warga dengan teratur
- **Acceptance Criteria:**
  - [ ] Login khusus pengelola
  - [ ] Daftar request jemput
  - [ ] Konfirmasi jemput selesai
  - [ ] Input berat & hitung poin
  - [ ] Rekap setoran harian/bulanan

---

## Epic 8: Iuran Warga
> Sebagai **warga**, saya ingin **melihat dan membayar iuran bulanan**, agar **pembayaran tercatat dengan baik**.

### User Stories

#### US-8.1: Lihat Tagihan Iuran
- **Sebagai** warga
- **Saya ingin** melihat tagihan iuran bulanan saya
- **Agar** tahu berapa yang harus dibayar
- **Acceptance Criteria:**
  - [ ] Halaman daftar tagihan
  - [ ] Status: BELUM/LUNAS/SEBAGIAN
  - [ ] Riwayat pembayaran

#### US-8.2: Rekap Iuran (Admin)
- **Sebagai** Pak RT
- **Saya ingin** melihat rekap iuran semua warga
- **Agar** tahu siapa yang sudah/belum bayar
- **Acceptance Criteria:**
  - [ ] Dashboard rekap per bulan
  - [ ] Filter per blok/status
  - [ ] Tandai sudah bayar
  - [ ] Export ke PDF/Excel

---

## Progress Summary

| Epic | Total Stories | Selesai | Progres |
|------|---------------|---------|---------|
| 1. Pelaporan Darurat | 3 | 3 | ██████████ 100% |
| 2. Dashboard Admin | 3 | 1 | ███░░░░░░░ 33% |
| 3. Notifikasi & Respons | 7 | 0 | ░░░░░░░░░░ 0% |
| 4. Darurat & SOS | 2 | 0 | ░░░░░░░░░░ 0% |
| 5. Komunitas | 5 | 0 | ░░░░░░░░░░ 0% |
| 6. Aksesibilitas | 3 | 0 | ░░░░░░░░░░ 0% |
| 7. Bank Sampah | 4 | 0 | ░░░░░░░░░░ 0% |
| 8. Iuran Warga | 2 | 0 | ░░░░░░░░░░ 0% |
| **TOTAL** | **29** | **4** | **14%** |
