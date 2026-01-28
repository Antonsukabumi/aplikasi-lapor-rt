# Database Schema: Aplikasi Lapor RT

## Overview
Database menggunakan **Supabase** (PostgreSQL) dengan struktur berikut.

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   warga     │       │   laporan   │       │    admin    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ warga_id    │       │ id          │
│ nama        │       │ id          │───────►│ nama        │
│ no_hp       │       │ jenis       │       │ no_hp       │
│ alamat      │       │ deskripsi   │       │ pin_hash    │
│ blok        │       │ lokasi      │       │ role        │
└─────────────┘       │ foto_url    │       └─────────────┘
      │               │ status      │
      │               │ admin_id    │
      │               │ balasan     │
      │               └─────────────┘
      │
      ▼
┌─────────────────────┐       ┌─────────────────────┐
│ bank_sampah_transaksi│      │  bank_sampah_jenis  │
├─────────────────────┤       ├─────────────────────┤
│ id                  │       │ id                  │
│ warga_id            │       │ nama                │
│ jenis_sampah_id     │───────│ harga_per_kg        │
│ berat_kg            │       │ poin_per_kg         │
│ poin                │       └─────────────────────┘
│ status              │
└─────────────────────┘
```

---

## 🗄️ Tabel Detail

### 1. `warga` - Data Warga
Data warga RT yang terdaftar.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `nama` | VARCHAR(100) | NO | Nama lengkap |
| `no_hp` | VARCHAR(15) | NO | Nomor HP (untuk notifikasi) |
| `alamat` | TEXT | YES | Alamat lengkap |
| `blok` | VARCHAR(10) | YES | Blok rumah (misal: A1, B2) |
| `created_at` | TIMESTAMP | NO | Waktu daftar |

```sql
CREATE TABLE warga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL,
  no_hp VARCHAR(15) NOT NULL UNIQUE,
  alamat TEXT,
  blok VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2. `admin` - Data Admin (Pak RT & Pengelola)
Data admin, Pak RT, dan pengelola Bank Sampah.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `nama` | VARCHAR(100) | NO | Nama admin |
| `no_hp` | VARCHAR(15) | NO | Nomor HP |
| `pin_hash` | VARCHAR(255) | NO | PIN terenkripsi |
| `role` | ENUM | NO | 'RT', 'SEKRETARIS', 'BANK_SAMPAH' |
| `created_at` | TIMESTAMP | NO | Waktu daftar |

```sql
CREATE TYPE admin_role AS ENUM ('RT', 'SEKRETARIS', 'BANK_SAMPAH');

CREATE TABLE admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL,
  no_hp VARCHAR(15) NOT NULL UNIQUE,
  pin_hash VARCHAR(255) NOT NULL,
  role admin_role NOT NULL DEFAULT 'RT',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2b. `responder` - Penerima Notifikasi Laporan
Data semua pihak yang menerima notifikasi sesuai jenis laporan.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `nama` | VARCHAR(100) | NO | Nama responder |
| `no_hp` | VARCHAR(15) | NO | Nomor HP (untuk WA/SMS) |
| `role` | ENUM | NO | Jenis responder |
| `aktif` | BOOLEAN | NO | Status aktif |
| `created_at` | TIMESTAMP | NO | Waktu daftar |

```sql
CREATE TYPE responder_role AS ENUM (
  'RT',           -- Ketua RT
  'RW',           -- Ketua RW
  'BABINSA',      -- Bintara Pembina Desa (TNI)
  'BINMAS',       -- Pembina Masyarakat (Polisi)
  'AMBULAN',      -- Sopir Ambulan
  'DAMKAR',       -- Pemadam Kebakaran
  'PUSKESMAS',    -- Petugas Kesehatan
  'KELURAHAN'     -- Staf Kelurahan
);

CREATE TABLE responder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL,
  no_hp VARCHAR(15) NOT NULL UNIQUE,
  role responder_role NOT NULL,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Data awal responder
INSERT INTO responder (nama, no_hp, role) VALUES
  ('Pak RT', '081234567890', 'RT'),
  ('Pak RW', '081234567891', 'RW'),
  ('Babinsa Andi', '081234567892', 'BABINSA'),
  ('Bripka Budi (Binmas)', '081234567893', 'BINMAS'),
  ('Dedi Ambulan', '081234567894', 'AMBULAN'),
  ('Damkar Pos 3', '081234567895', 'DAMKAR'),
  ('Puskesmas Kec.', '081234567896', 'PUSKESMAS');
```

---

### 2c. `notifikasi_matriks` - Matriks Notifikasi
Mapping jenis laporan ke responder yang menerima notifikasi.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `jenis_laporan` | ENUM | NO | Jenis laporan |
| `responder_role` | ENUM | NO | Role responder |

```sql
CREATE TABLE notifikasi_matriks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_laporan jenis_laporan NOT NULL,
  responder_role responder_role NOT NULL,
  UNIQUE(jenis_laporan, responder_role)
);

-- Matriks notifikasi
-- MENINGGAL: RT, Ambulan
INSERT INTO notifikasi_matriks (jenis_laporan, responder_role) VALUES
  ('MENINGGAL', 'RT'),
  ('MENINGGAL', 'AMBULAN');

-- SAKIT: RT, Ambulan, Puskesmas
INSERT INTO notifikasi_matriks (jenis_laporan, responder_role) VALUES
  ('SAKIT', 'RT'),
  ('SAKIT', 'AMBULAN'),
  ('SAKIT', 'PUSKESMAS');

-- BENCANA: Semua
INSERT INTO notifikasi_matriks (jenis_laporan, responder_role) VALUES
  ('BENCANA', 'RT'),
  ('BENCANA', 'RW'),
  ('BENCANA', 'BABINSA'),
  ('BENCANA', 'BINMAS'),
  ('BENCANA', 'AMBULAN'),
  ('BENCANA', 'DAMKAR'),
  ('BENCANA', 'PUSKESMAS');
```

---

### 3. `laporan` - Data Laporan Warga
Semua laporan yang masuk dari warga.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `warga_id` | UUID | YES | FK ke warga (null jika anonim) |
| `nama_pelapor` | VARCHAR(100) | NO | Nama pelapor |
| `no_hp_pelapor` | VARCHAR(15) | YES | No HP pelapor |
| `jenis` | ENUM | NO | 'MENINGGAL', 'SAKIT', 'BENCANA' |
| `deskripsi` | TEXT | NO | Deskripsi kejadian |
| `lokasi` | TEXT | NO | Lokasi kejadian |
| `foto_url` | TEXT | YES | URL foto di Supabase Storage |
| `latitude` | DECIMAL | YES | Koordinat GPS |
| `longitude` | DECIMAL | YES | Koordinat GPS |
| `status` | ENUM | NO | Status laporan |
| `admin_id` | UUID | YES | FK ke admin yang menangani |
| `balasan` | TEXT | YES | Pesan balasan dari admin |
| `created_at` | TIMESTAMP | NO | Waktu laporan masuk |
| `updated_at` | TIMESTAMP | NO | Waktu update terakhir |

```sql
CREATE TYPE jenis_laporan AS ENUM ('MENINGGAL', 'SAKIT', 'BENCANA');
CREATE TYPE status_laporan AS ENUM ('BARU', 'DITERIMA', 'DIPROSES', 'SELESAI');

CREATE TABLE laporan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id UUID REFERENCES warga(id),
  nama_pelapor VARCHAR(100) NOT NULL,
  no_hp_pelapor VARCHAR(15),
  jenis jenis_laporan NOT NULL,
  deskripsi TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  foto_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status status_laporan NOT NULL DEFAULT 'BARU',
  admin_id UUID REFERENCES admin(id),
  balasan TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 4. `pengumuman` - Pengumuman RT
Pengumuman dari Pak RT untuk warga.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `admin_id` | UUID | NO | FK ke admin yang buat |
| `judul` | VARCHAR(200) | NO | Judul pengumuman |
| `isi` | TEXT | NO | Isi pengumuman |
| `prioritas` | ENUM | NO | 'BIASA', 'PENTING', 'DARURAT' |
| `created_at` | TIMESTAMP | NO | Waktu dibuat |

```sql
CREATE TYPE prioritas_pengumuman AS ENUM ('BIASA', 'PENTING', 'DARURAT');

CREATE TABLE pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin(id) NOT NULL,
  judul VARCHAR(200) NOT NULL,
  isi TEXT NOT NULL,
  prioritas prioritas_pengumuman NOT NULL DEFAULT 'BIASA',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5. `bank_sampah_jenis` - Jenis Sampah
Daftar jenis sampah yang diterima Bank Sampah.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `nama` | VARCHAR(50) | NO | Nama jenis (Plastik, Kertas, dll) |
| `harga_per_kg` | INTEGER | NO | Harga dalam Rupiah |
| `poin_per_kg` | INTEGER | NO | Poin yang didapat |
| `aktif` | BOOLEAN | NO | Masih diterima atau tidak |

```sql
CREATE TABLE bank_sampah_jenis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(50) NOT NULL,
  harga_per_kg INTEGER NOT NULL,
  poin_per_kg INTEGER NOT NULL,
  aktif BOOLEAN NOT NULL DEFAULT TRUE
);

-- Data awal
INSERT INTO bank_sampah_jenis (nama, harga_per_kg, poin_per_kg) VALUES
  ('Plastik Bersih', 2000, 20),
  ('Kertas/Kardus', 1500, 15),
  ('Logam/Kaleng', 5000, 50),
  ('Botol Kaca', 500, 5),
  ('Botol Plastik', 3000, 30);
```

---

### 6. `bank_sampah_transaksi` - Transaksi Bank Sampah
Catatan transaksi penyetoran sampah.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `warga_id` | UUID | NO | FK ke warga |
| `jenis_id` | UUID | NO | FK ke jenis sampah |
| `berat_kg` | DECIMAL | NO | Berat dalam kg |
| `poin` | INTEGER | NO | Poin yang didapat |
| `uang` | INTEGER | NO | Uang yang didapat (Rp) |
| `status` | ENUM | NO | Status transaksi |
| `alamat_jemput` | TEXT | YES | Alamat jika minta dijemput |
| `jadwal_jemput` | TIMESTAMP | YES | Waktu jemput |
| `pengelola_id` | UUID | YES | FK ke admin pengelola |
| `created_at` | TIMESTAMP | NO | Waktu request |
| `completed_at` | TIMESTAMP | YES | Waktu selesai |

```sql
CREATE TYPE status_bank_sampah AS ENUM ('REQUEST', 'DIJEMPUT', 'DITIMBANG', 'SELESAI');

CREATE TABLE bank_sampah_transaksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id UUID REFERENCES warga(id) NOT NULL,
  jenis_id UUID REFERENCES bank_sampah_jenis(id) NOT NULL,
  berat_kg DECIMAL(5, 2),
  poin INTEGER DEFAULT 0,
  uang INTEGER DEFAULT 0,
  status status_bank_sampah NOT NULL DEFAULT 'REQUEST',
  alamat_jemput TEXT,
  jadwal_jemput TIMESTAMP,
  pengelola_id UUID REFERENCES admin(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

### 7. `bank_sampah_saldo` - Saldo Warga
Saldo poin/uang warga dari Bank Sampah.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `warga_id` | UUID | NO | FK ke warga (unique) |
| `total_poin` | INTEGER | NO | Total poin terkumpul |
| `total_uang` | INTEGER | NO | Total uang dalam Rp |
| `updated_at` | TIMESTAMP | NO | Update terakhir |

```sql
CREATE TABLE bank_sampah_saldo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id UUID REFERENCES warga(id) UNIQUE NOT NULL,
  total_poin INTEGER NOT NULL DEFAULT 0,
  total_uang INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8. `gotong_royong` - Minta/Tawarkan Bantuan
Fitur gotong royong digital antar warga.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `warga_id` | UUID | NO | FK ke warga |
| `tipe` | ENUM | NO | 'MINTA' atau 'TAWARKAN' |
| `kategori` | VARCHAR(50) | NO | Kategori bantuan |
| `deskripsi` | TEXT | NO | Detail bantuan |
| `lokasi` | TEXT | YES | Lokasi jika relevan |
| `status` | ENUM | NO | Status request |
| `created_at` | TIMESTAMP | NO | Waktu dibuat |

```sql
CREATE TYPE tipe_gotong_royong AS ENUM ('MINTA', 'TAWARKAN');
CREATE TYPE status_gotong_royong AS ENUM ('AKTIF', 'DIPROSES', 'SELESAI', 'DIBATALKAN');

CREATE TABLE gotong_royong (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id UUID REFERENCES warga(id) NOT NULL,
  tipe tipe_gotong_royong NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  deskripsi TEXT NOT NULL,
  lokasi TEXT,
  status status_gotong_royong NOT NULL DEFAULT 'AKTIF',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 9. `forum_topik` - Topik Diskusi Forum
Topik diskusi yang dibuat warga.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `warga_id` | UUID | NO | FK ke warga pembuat |
| `judul` | VARCHAR(200) | NO | Judul topik |
| `isi` | TEXT | NO | Isi topik |
| `kategori` | VARCHAR(50) | YES | Kategori diskusi |
| `is_pinned` | BOOLEAN | NO | Dipasang di atas |
| `is_locked` | BOOLEAN | NO | Dikunci admin |
| `created_at` | TIMESTAMP | NO | Waktu dibuat |

```sql
CREATE TABLE forum_topik (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id UUID REFERENCES warga(id) NOT NULL,
  judul VARCHAR(200) NOT NULL,
  isi TEXT NOT NULL,
  kategori VARCHAR(50),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 10. `forum_komentar` - Komentar Forum
Balasan/komentar pada topik forum.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `topik_id` | UUID | NO | FK ke topik |
| `warga_id` | UUID | NO | FK ke warga |
| `isi` | TEXT | NO | Isi komentar |
| `created_at` | TIMESTAMP | NO | Waktu dibuat |

```sql
CREATE TABLE forum_komentar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topik_id UUID REFERENCES forum_topik(id) ON DELETE CASCADE NOT NULL,
  warga_id UUID REFERENCES warga(id) NOT NULL,
  isi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 11. `kegiatan` - Jadwal Kegiatan RT
Kalender kegiatan RT (ronda, kerja bakti, dll).

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `admin_id` | UUID | NO | FK ke admin pembuat |
| `judul` | VARCHAR(200) | NO | Nama kegiatan |
| `deskripsi` | TEXT | YES | Detail kegiatan |
| `tanggal` | DATE | NO | Tanggal kegiatan |
| `waktu_mulai` | TIME | YES | Jam mulai |
| `waktu_selesai` | TIME | YES | Jam selesai |
| `lokasi` | TEXT | YES | Tempat kegiatan |
| `is_wajib` | BOOLEAN | NO | Wajib hadir? |
| `created_at` | TIMESTAMP | NO | Waktu dibuat |

```sql
CREATE TABLE kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin(id) NOT NULL,
  judul VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  tanggal DATE NOT NULL,
  waktu_mulai TIME,
  waktu_selesai TIME,
  lokasi TEXT,
  is_wajib BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 12. `iuran_warga` - Catatan Iuran Bulanan
Rekap pembayaran iuran warga.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `warga_id` | UUID | NO | FK ke warga |
| `bulan` | INTEGER | NO | Bulan (1-12) |
| `tahun` | INTEGER | NO | Tahun |
| `nominal` | INTEGER | NO | Jumlah iuran (Rp) |
| `status` | ENUM | NO | Status pembayaran |
| `tanggal_bayar` | DATE | YES | Tanggal bayar |
| `catatan` | TEXT | YES | Catatan tambahan |
| `created_at` | TIMESTAMP | NO | Waktu dibuat |

```sql
CREATE TYPE status_iuran AS ENUM ('BELUM', 'LUNAS', 'SEBAGIAN');

CREATE TABLE iuran_warga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id UUID REFERENCES warga(id) NOT NULL,
  bulan INTEGER NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
  tahun INTEGER NOT NULL,
  nominal INTEGER NOT NULL DEFAULT 0,
  status status_iuran NOT NULL DEFAULT 'BELUM',
  tanggal_bayar DATE,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(warga_id, bulan, tahun)
);
```

---

### 13. `notifikasi_log` - Log Notifikasi Terkirim
Riwayat notifikasi yang sudah dikirim.

| Kolom | Tipe | Nullable | Deskripsi |
|-------|------|----------|-----------|
| `id` | UUID | NO | Primary key |
| `penerima_id` | UUID | NO | FK ke warga/admin |
| `tipe_penerima` | ENUM | NO | 'WARGA' atau 'ADMIN' |
| `channel` | ENUM | NO | 'WHATSAPP', 'PUSH', 'SMS' |
| `judul` | VARCHAR(200) | NO | Judul notifikasi |
| `isi` | TEXT | NO | Isi pesan |
| `status` | ENUM | NO | Status pengiriman |
| `sent_at` | TIMESTAMP | NO | Waktu kirim |
| `error_message` | TEXT | YES | Pesan error jika gagal |

```sql
CREATE TYPE tipe_penerima AS ENUM ('WARGA', 'ADMIN');
CREATE TYPE channel_notifikasi AS ENUM ('WHATSAPP', 'PUSH', 'SMS');
CREATE TYPE status_notifikasi AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE notifikasi_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  penerima_id UUID NOT NULL,
  tipe_penerima tipe_penerima NOT NULL,
  channel channel_notifikasi NOT NULL,
  judul VARCHAR(200) NOT NULL,
  isi TEXT NOT NULL,
  status status_notifikasi NOT NULL DEFAULT 'PENDING',
  sent_at TIMESTAMP DEFAULT NOW(),
  error_message TEXT
);
```

---

## 🔐 Row Level Security (RLS)

Supabase menggunakan RLS untuk keamanan data.

```sql
-- Warga hanya bisa lihat laporan mereka sendiri
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warga bisa lihat laporan sendiri" ON laporan
  FOR SELECT USING (warga_id = auth.uid());

CREATE POLICY "Warga bisa buat laporan" ON laporan
  FOR INSERT WITH CHECK (true);

-- Admin bisa lihat semua laporan
CREATE POLICY "Admin bisa lihat semua" ON laporan
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin WHERE id = auth.uid())
  );
```

---

## 📁 Supabase Storage Buckets

| Bucket | Akses | Fungsi |
|--------|-------|--------|
| `laporan-foto` | Public | Foto lampiran laporan |
| `pengumuman-media` | Public | Gambar pengumuman |
| `admin-avatar` | Private | Foto profil admin |

---

## 🔗 Supabase Setup Commands

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Init di project
supabase init

# Link ke project
supabase link --project-ref YOUR_PROJECT_REF

# Push schema ke Supabase
supabase db push
```
