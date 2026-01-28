# Database Schema for Supabase

Jalankan SQL berikut di Supabase SQL Editor untuk membuat tabel-tabel yang diperlukan.

## 1. Tabel Laporan

```sql
CREATE TABLE laporan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('MENINGGAL', 'SAKIT', 'BENCANA')),
  nama_pelapor VARCHAR(255) NOT NULL,
  no_hp_pelapor VARCHAR(20),
  lokasi TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  foto_url TEXT,
  status VARCHAR(20) DEFAULT 'BARU' CHECK (status IN ('BARU', 'DITERIMA', 'DIPROSES', 'SELESAI')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;

-- Allow public read and insert
CREATE POLICY "Allow public insert" ON laporan FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public select" ON laporan FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public update" ON laporan FOR UPDATE TO anon USING (true);
```

## 2. Tabel Kontak Darurat

```sql
CREATE TABLE kontak_darurat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  nomor VARCHAR(20) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  keterangan TEXT,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE kontak_darurat ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public select" ON kontak_darurat FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert" ON kontak_darurat FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update" ON kontak_darurat FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete" ON kontak_darurat FOR DELETE TO anon USING (true);

-- Insert default data
INSERT INTO kontak_darurat (nama, nomor, kategori, keterangan) VALUES
  ('Puskesmas Kelurahan', '021-1234567', 'Kesehatan', 'Buka 24 Jam'),
  ('Ketua RT 05', '08123456789', 'RT/RW', 'Pak Ahmad'),
  ('Babinsa', '08567891234', 'Keamanan', 'Serda Budi'),
  ('Binmas Polsek', '08901234567', 'Keamanan', 'Bripka Joko'),
  ('Ambulan PMI', '118', 'Darurat', 'Gratis'),
  ('Damkar', '113', 'Darurat', '24 Jam');
```

## 3. Tabel Bank Sampah Settings

```sql
CREATE TABLE bank_sampah_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  nama_pengelola VARCHAR(255) NOT NULL,
  no_wa VARCHAR(20) NOT NULL,
  alamat TEXT NOT NULL,
  jam_operasional VARCHAR(100) NOT NULL,
  minimal_pickup INTEGER DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bank_sampah_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON bank_sampah_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public update" ON bank_sampah_settings FOR UPDATE TO anon USING (true);

-- Insert default data
INSERT INTO bank_sampah_settings (nama_pengelola, no_wa, alamat, jam_operasional, minimal_pickup) VALUES
  ('Bu Rina', '081234567890', 'Pos RT 05, Jl. Mawar No. 10', 'Sabtu, 08:00-11:00 WIB', 5);
```

## 4. Tabel Jenis Sampah

```sql
CREATE TABLE jenis_sampah (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  harga INTEGER NOT NULL,
  poin INTEGER NOT NULL,
  icon VARCHAR(10) NOT NULL,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE jenis_sampah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON jenis_sampah FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert" ON jenis_sampah FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update" ON jenis_sampah FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete" ON jenis_sampah FOR DELETE TO anon USING (true);

-- Insert default data
INSERT INTO jenis_sampah (nama, harga, poin, icon) VALUES
  ('Plastik Bersih', 2000, 20, '🧴'),
  ('Kertas/Kardus', 1500, 15, '📦'),
  ('Botol Kaca', 1000, 10, '🍾'),
  ('Kaleng/Aluminium', 3000, 30, '🥫'),
  ('Elektronik Kecil', 5000, 50, '📱'),
  ('Minyak Jelantah', 4000, 40, '🛢️');
```

## 5. Tabel Koropak

```sql
CREATE TABLE koropak_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_terkumpul INTEGER DEFAULT 0,
  target_bulanan INTEGER DEFAULT 500000,
  iuran_harian INTEGER DEFAULT 500,
  bulan_aktif VARCHAR(50) DEFAULT 'Januari 2026',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE koropak_donatur (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  total_hari INTEGER DEFAULT 0,
  total_nominal INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE koropak_penyaluran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  penerima VARCHAR(255) NOT NULL,
  keperluan VARCHAR(100) NOT NULL,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  tanggal DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE koropak_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE koropak_donatur ENABLE ROW LEVEL SECURITY;
ALTER TABLE koropak_penyaluran ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON koropak_settings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON koropak_donatur FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON koropak_penyaluran FOR ALL TO anon USING (true) WITH CHECK (true);

-- Insert default settings
INSERT INTO koropak_settings (total_terkumpul, target_bulanan, iuran_harian, bulan_aktif) VALUES
  (250000, 500000, 500, 'Januari 2026');
```

## 6. Tabel Interaksi Warga (Gotong Royong)

```sql
CREATE TABLE interaksi_warga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('MINTA', 'TAWARKAN')),
  kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT NOT NULL,
  lokasi VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'AKTIF' CHECK (status IN ('AKTIF', 'DIPROSES', 'SELESAI')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE interaksi_warga ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON interaksi_warga FOR ALL TO anon USING (true) WITH CHECK (true);
```

---

## Cara Setup:

1. Buka https://supabase.com dan buat project baru
2. Copy Project URL dan Anon Key dari Settings > API
3. Buat file `.env.local` di root project:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
   ```
4. Jalankan SQL di atas di SQL Editor Supabase
5. Restart dev server: `npm run dev`
