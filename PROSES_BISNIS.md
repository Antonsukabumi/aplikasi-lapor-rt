# Proses Bisnis Aplikasi LAPOR RT

## 1. Registrasi Warga

```mermaid
flowchart TD
    A[Warga Buka Aplikasi] --> B[Pilih Menu 'Daftar']
    B --> C[Pilih RT/RW]
    C --> D{Kuota Tersedia?}
    D -->|Ya| E[Isi Form: No.KK, Nama, No.HP, Alamat]
    D -->|Tidak| F[Tampil Pesan 'Kuota Penuh']
    E --> G{No.KK Sudah Terdaftar?}
    G -->|Ya| H[Tampil Pesan 'Sudah Terdaftar']
    G -->|Tidak| I[✅ Registrasi Berhasil]
    I --> J[Warga Bisa Lapor]
```

---

## 2. Pelaporan Warga

```mermaid
flowchart TD
    A[Warga Buka Aplikasi] --> B[Pilih Jenis Laporan]
    B --> C[🔴 Kabar Duka]
    B --> D[🟡 Warga Sakit]
    B --> E[🔵 Bencana/Darurat]
    C & D & E --> F[Isi Form Laporan]
    F --> G[Nama, Lokasi, Deskripsi, Foto]
    G --> H[Kirim Laporan]
    H --> I[✅ Laporan Masuk ke Dashboard Admin RT]
    I --> J[🔔 Notifikasi ke Admin RT via WhatsApp]
```

---

## 3. Penanganan Laporan oleh Admin RT

```mermaid
flowchart TD
    A[Admin RT Login] --> B[Buka Dashboard]
    B --> C[Lihat Laporan BARU]
    C --> D[Klik Detail Laporan]
    D --> E{Tindakan}
    E -->|Terima| F[Status: DITERIMA]
    E -->|Proses| G[Status: DIPROSES]
    E -->|Selesai| H[Status: SELESAI]
    F & G & H --> I[Warga Lihat Update Status]
```

---

## 4. Pengelolaan Koropak (Dana Sosial)

```mermaid
flowchart TD
    A[Admin RT Buka Menu Koropak] --> B{Pilih Aksi}
    B -->|Input Iuran| C[Isi: Nama Donatur, Jumlah Hari, Nominal]
    B -->|Catat Penyaluran| D[Isi: Penerima, Keperluan, Jumlah]
    C --> E[Saldo Masuk Bertambah]
    D --> F[Saldo Keluar Bertambah]
    E & F --> G[Dashboard Menampilkan Total Saldo]
```

---

## 5. Pengelolaan Warga Terdaftar

```mermaid
flowchart TD
    A[Admin RT Buka Menu Kelola Warga] --> B[Lihat Daftar Warga + Kuota]
    B --> C{Aksi}
    C -->|Tambah Manual| D[Isi: No.KK, Nama, No.HP, Alamat]
    C -->|Hapus| E[Warga Dinonaktifkan]
    D --> F{Kuota Cukup?}
    F -->|Ya| G[✅ Warga Ditambahkan]
    F -->|Tidak| H[❌ Kuota Penuh]
```

---

## 6. Pengaturan oleh Super Admin

```mermaid
flowchart TD
    A[Super Admin Login] --> B[Dashboard Super Admin]
    B --> C{Menu}
    C -->|Kelola RT| D[Tambah/Edit/Hapus RT + Set Kuota KK]
    C -->|Kelola Admin| E[Buat Akun Admin RT + Assign ke RT]
    D --> F[RT Tersedia untuk Registrasi Warga]
    E --> G[Admin RT Bisa Login & Kelola RT-nya]
```

---

## Ringkasan Aktor & Akses

| Aktor | Halaman | Aksi Utama |
|-------|---------|------------|
| **Masyarakat** | `/`, `/daftar`, `/lapor/*` | Daftar warga, Lapor kejadian, Lihat pengumuman |
| **Admin RT** | `/admin/*` | Kelola laporan, Koropak, Warga, Kontak darurat |
| **Super Admin** | `/super-admin/*` | Kelola RT, Kelola Admin |

---

## Alur Lengkap End-to-End

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN                                   │
│   1. Buat RT (set kuota warga)                                      │
│   2. Buat akun Admin RT                                             │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN RT                                     │
│   3. Login ke dashboard                                             │
│   4. Terima & proses laporan warga                                  │
│   5. Kelola koropak, warga, kontak darurat                          │
└─────────────────────────────────────────────────────────────────────┘
                                ↑
┌─────────────────────────────────────────────────────────────────────┐
│                        MASYARAKAT                                    │
│   1. Daftar sebagai warga RT (dengan No.KK)                         │
│   2. Lapor kejadian: Duka, Sakit, Bencana                           │
│   3. Gunakan SOS untuk panggilan darurat                            │
│   4. Lihat status laporan                                           │
└─────────────────────────────────────────────────────────────────────┘
```
