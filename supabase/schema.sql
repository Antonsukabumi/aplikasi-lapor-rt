-- ============================================
-- SUPABASE SCHEMA: Aplikasi Lapor RT
-- ============================================
-- Copy-paste semua SQL ini ke Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- ============================================

-- 1. ENUM TYPES
-- ============================================

CREATE TYPE admin_role AS ENUM ('RT', 'SEKRETARIS', 'BANK_SAMPAH');
CREATE TYPE jenis_laporan AS ENUM ('MENINGGAL', 'SAKIT', 'BENCANA');
CREATE TYPE status_laporan AS ENUM ('BARU', 'DITERIMA', 'DIPROSES', 'SELESAI');
CREATE TYPE prioritas_pengumuman AS ENUM ('BIASA', 'PENTING', 'DARURAT');
CREATE TYPE status_bank_sampah AS ENUM ('REQUEST', 'DIJEMPUT', 'DITIMBANG', 'SELESAI');
CREATE TYPE status_iuran AS ENUM ('BELUM', 'LUNAS', 'SEBAGIAN');
CREATE TYPE tipe_gotong_royong AS ENUM ('MINTA', 'TAWARKAN');
CREATE TYPE status_gotong_royong AS ENUM ('AKTIF', 'DIPROSES', 'SELESAI', 'DIBATALKAN');
CREATE TYPE tipe_penerima AS ENUM ('WARGA', 'ADMIN');
CREATE TYPE channel_notifikasi AS ENUM ('WHATSAPP', 'PUSH', 'SMS');
CREATE TYPE status_notifikasi AS ENUM ('PENDING', 'SENT', 'FAILED');

-- 2. TABEL UTAMA
-- ============================================

-- Tabel Warga
CREATE TABLE warga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL,
  no_hp VARCHAR(15) NOT NULL UNIQUE,
  alamat TEXT,
  blok VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Admin (Pak RT & Pengelola)
CREATE TABLE admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL,
  no_hp VARCHAR(15) NOT NULL UNIQUE,
  pin_hash VARCHAR(255) NOT NULL,
  role admin_role NOT NULL DEFAULT 'RT',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Laporan
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

-- Tabel Pengumuman
CREATE TABLE pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin(id) NOT NULL,
  judul VARCHAR(200) NOT NULL,
  isi TEXT NOT NULL,
  prioritas prioritas_pengumuman NOT NULL DEFAULT 'BIASA',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABEL BANK SAMPAH
-- ============================================

-- Jenis Sampah
CREATE TABLE bank_sampah_jenis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(50) NOT NULL,
  harga_per_kg INTEGER NOT NULL,
  poin_per_kg INTEGER NOT NULL,
  aktif BOOLEAN NOT NULL DEFAULT TRUE
);

-- Data Awal Jenis Sampah
INSERT INTO bank_sampah_jenis (nama, harga_per_kg, poin_per_kg) VALUES
  ('Plastik Bersih', 2000, 20),
  ('Kertas/Kardus', 1500, 15),
  ('Logam/Kaleng', 5000, 50),
  ('Botol Kaca', 500, 5),
  ('Botol Plastik', 3000, 30);

-- Transaksi Bank Sampah
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

-- Saldo Bank Sampah
CREATE TABLE bank_sampah_saldo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id UUID REFERENCES warga(id) UNIQUE NOT NULL,
  total_poin INTEGER NOT NULL DEFAULT 0,
  total_uang INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. TABEL KOMUNITAS
-- ============================================

-- Gotong Royong
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

-- Forum Topik
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

-- Forum Komentar
CREATE TABLE forum_komentar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topik_id UUID REFERENCES forum_topik(id) ON DELETE CASCADE NOT NULL,
  warga_id UUID REFERENCES warga(id) NOT NULL,
  isi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kegiatan RT
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

-- 5. TABEL IURAN
-- ============================================

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

-- 6. TABEL LOG NOTIFIKASI
-- ============================================

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

-- 7. INDEXES
-- ============================================

CREATE INDEX idx_laporan_status ON laporan(status);
CREATE INDEX idx_laporan_jenis ON laporan(jenis);
CREATE INDEX idx_laporan_created_at ON laporan(created_at DESC);
CREATE INDEX idx_pengumuman_prioritas ON pengumuman(prioritas);
CREATE INDEX idx_iuran_warga_bulan_tahun ON iuran_warga(bulan, tahun);

-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_sampah_jenis ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_sampah_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_sampah_saldo ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_warga ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa baca pengumuman
CREATE POLICY "Pengumuman bisa dibaca semua" ON pengumuman
  FOR SELECT USING (true);

-- Policy: Semua orang bisa baca jenis sampah
CREATE POLICY "Jenis sampah bisa dibaca semua" ON bank_sampah_jenis
  FOR SELECT USING (true);

-- Policy: Semua orang bisa buat laporan
CREATE POLICY "Semua bisa buat laporan" ON laporan
  FOR INSERT WITH CHECK (true);

-- Policy: Semua orang bisa baca laporan (untuk admin, nanti bisa diperketat)
CREATE POLICY "Semua bisa baca laporan" ON laporan
  FOR SELECT USING (true);

-- Policy: Semua bisa update laporan (untuk admin update status)
CREATE POLICY "Semua bisa update laporan" ON laporan
  FOR UPDATE USING (true);

-- 9. DATA AWAL ADMIN
-- ============================================
-- Ganti PIN '1234' dengan PIN hash yang aman di production!

INSERT INTO admin (nama, no_hp, pin_hash, role) VALUES
  ('Pak RT', '081234567890', '1234', 'RT');

-- ============================================
-- SELESAI! Database siap digunakan.
-- ============================================
