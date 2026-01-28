# Task Checklist: Aplikasi Lapor RT

## Status Legend
- `[ ]` Belum dikerjakan
- `[/]` Sedang dikerjakan
- `[x]` Selesai

---

## Fase 1: MVP ✅
- [x] Setup proyek Next.js
- [x] Konfigurasi Tailwind CSS
- [x] Install dependencies (lucide-react)
- [x] Buat homepage dengan 3 tombol darurat
- [x] Buat form laporan dinamis (`/lapor/[jenis]`)
- [x] Buat halaman sukses (`/lapor/sukses`)
- [x] Buat dashboard admin (`/admin`)
- [x] Implementasi login PIN sederhana

---

## Fase 2: Backend & Database
- [/] Setup project Supabase *(Menunggu user buat akun)*
- [x] Buat tabel `warga` *(SQL ready di supabase/schema.sql)*
- [x] Buat tabel `admin` *(SQL ready)*
- [x] Buat tabel `laporan` *(SQL ready)*
- [x] Koneksi Next.js ke Supabase (`lib/supabase.ts`)
- [x] Implementasi simpan laporan ke database *(API ready)*
- [x] Implementasi ambil data laporan di dashboard *(API ready)*
- [ ] Setup Supabase Storage untuk foto
- [ ] Implementasi upload foto laporan

---

## Fase 3: PWA (Progressive Web App) ⬆️ Prioritas Naik
> *Penting untuk Mobile-First*

- [x] Buat `manifest.json` ✅
- [x] Buat Service Worker (`sw.js`) ✅
- [x] Generate app icons ✅
- [x] Register SW di layout ✅
- [ ] Test install di HP

---

## Fase 4: Fitur Darurat & SOS ⬆️ Prioritas Naik
> *Fitur penting untuk keselamatan*

- [x] Buat halaman `/darurat` ✅
- [x] Implementasi tombol SOS dengan countdown ✅
- [x] Nomor kontak darurat (Ambulans, Polisi, dll) ✅
- [x] Integrasi GPS untuk lokasi SOS ✅
- [ ] Daftar nomor darurat (click-to-call)
- [ ] Integrasi GPS untuk lokasi otomatis

---

## Fase 5: Notifikasi
- [ ] Pilih provider WhatsApp API (Fonnte/Twilio)
- [ ] Setup API route untuk kirim notifikasi
- [ ] Integrasi notifikasi saat laporan masuk
- [ ] Implementasi Push Notification (Service Worker)
- [ ] Implementasi alarm suara di dashboard

---

## Fase 6: Fitur Admin Lanjutan
- [ ] Tombol "Terima Laporan" + update status
- [ ] Form balas pesan ke warga
- [ ] Tombol hubungi pelapor (telepon/WA)
- [ ] Status bertahap: BARU → DITERIMA → DIPROSES → SELESAI
- [ ] Halaman statistik (`/admin/statistik`)
- [ ] Halaman data warga (`/admin/warga`)
- [ ] Halaman kelola pengumuman (`/admin/pengumuman`)
- [ ] Export laporan ke PDF/Excel

---

## Fase 7: Bank Sampah
- [ ] Buat tabel `bank_sampah_jenis`
- [ ] Buat tabel `bank_sampah_transaksi`
- [ ] Buat tabel `bank_sampah_saldo`
- [ ] Halaman info Bank Sampah (`/bank-sampah`)
- [ ] Form request jemput sampah
- [ ] Halaman saldo poin warga (`/bank-sampah/saldo`)
- [ ] Dashboard pengelola (`/pengelola/bank-sampah`)
- [ ] Konfirmasi jemput & input berat
- [ ] Hitung poin otomatis

---

## Fase 8: Fitur Komunitas
- [ ] Buat tabel `gotong_royong`
- [ ] Buat tabel `forum_topik` & `forum_komentar`
- [ ] Buat tabel `kegiatan`
- [ ] Halaman pengumuman (`/pengumuman`)
- [ ] Halaman kalender kegiatan (`/kegiatan`)
- [ ] Halaman gotong royong (`/gotong-royong`)
- [ ] Form minta bantuan
- [ ] Form tawarkan bantuan
- [ ] Halaman forum diskusi (`/forum`)

---

## Fase 9: Iuran Warga
- [ ] Buat tabel `iuran_warga`
- [ ] Halaman rekap iuran admin (`/admin/iuran`)
- [ ] Halaman lihat iuran warga (`/iuran`)
- [ ] Fitur tandai sudah bayar
- [ ] Rekap bulanan/tahunan

---

## Fase 10: Aksesibilitas
- [ ] Implementasi mode gelap
- [ ] Tombol perbesar teks
- [ ] Voice input (speech-to-text)
- [ ] Multi bahasa (opsional)

---

## Fase 11: Testing & Deploy
- [ ] Testing di berbagai browser
- [ ] Testing di HP (Android & iOS)
- [ ] Fix bugs & optimisasi
- [ ] Deploy ke Vercel
- [ ] Setup domain custom (opsional)

---

## Progress Summary

| Fase | Items | Selesai | Progress |
|------|-------|---------|----------|
| 1. MVP | 8 | 8 | ██████████ 100% |
| 2. Backend | 9 | 0 | ░░░░░░░░░░ 0% |
| 3. PWA | 5 | 0 | ░░░░░░░░░░ 0% |
| 4. Darurat & SOS | 4 | 0 | ░░░░░░░░░░ 0% |
| 5. Notifikasi | 5 | 0 | ░░░░░░░░░░ 0% |
| 6. Admin Lanjutan | 8 | 0 | ░░░░░░░░░░ 0% |
| 7. Bank Sampah | 9 | 0 | ░░░░░░░░░░ 0% |
| 8. Komunitas | 9 | 0 | ░░░░░░░░░░ 0% |
| 9. Iuran Warga | 5 | 0 | ░░░░░░░░░░ 0% |
| 10. Aksesibilitas | 4 | 0 | ░░░░░░░░░░ 0% |
| 11. Deploy | 5 | 0 | ░░░░░░░░░░ 0% |
| **TOTAL** | **71** | **8** | **11%** |
