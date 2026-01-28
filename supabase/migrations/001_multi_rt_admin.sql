-- ============================================
-- MIGRATION: Multi-RT Admin System
-- Run this AFTER the base schema.sql
-- ============================================

-- 1. CREATE RT UNITS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS rt_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,           -- "RT 05 / RW 03"
    nomor_rt VARCHAR(10) NOT NULL,        -- "05"
    nomor_rw VARCHAR(10) NOT NULL,        -- "03"
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota VARCHAR(100),
    alamat_lengkap TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian RT
CREATE INDEX IF NOT EXISTS idx_rt_units_active ON rt_units(is_active);
CREATE INDEX IF NOT EXISTS idx_rt_units_rw ON rt_units(nomor_rw);

-- 2. CREATE ADMIN USERS TABLE (REPLACE OLD ADMIN TABLE)
-- ============================================

-- Drop old admin_role type if exists and create new one
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_v2') THEN
        DROP TYPE admin_role_v2;
    END IF;
END $$;

CREATE TYPE admin_role_v2 AS ENUM ('SUPER_ADMIN', 'ADMIN_RT');

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role admin_role_v2 NOT NULL DEFAULT 'ADMIN_RT',
    rt_id UUID REFERENCES rt_units(id) ON DELETE SET NULL,
    no_hp VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint: Super admin tidak punya rt_id, Admin RT wajib punya
-- Note: We'll validate this at application level instead of DB constraint for flexibility

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_rt ON admin_users(rt_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- 3. ADD RT_ID TO EXISTING TABLES
-- ============================================

-- Add rt_id to laporan
ALTER TABLE laporan ADD COLUMN IF NOT EXISTS rt_id UUID REFERENCES rt_units(id);

-- Add rt_id to kontak_darurat (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kontak_darurat') THEN
        EXECUTE 'ALTER TABLE kontak_darurat ADD COLUMN IF NOT EXISTS rt_id UUID REFERENCES rt_units(id)';
    END IF;
END $$;

-- Add rt_id to koropak related tables (if they exist)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'koropak_iuran') THEN
        EXECUTE 'ALTER TABLE koropak_iuran ADD COLUMN IF NOT EXISTS rt_id UUID REFERENCES rt_units(id)';
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'penyaluran_dana') THEN
        EXECUTE 'ALTER TABLE penyaluran_dana ADD COLUMN IF NOT EXISTS rt_id UUID REFERENCES rt_units(id)';
    END IF;
END $$;

-- 4. CREATE KOROPAK TABLES IF NOT EXISTS
-- ============================================

-- Koropak Settings per RT
CREATE TABLE IF NOT EXISTS koropak_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rt_id UUID REFERENCES rt_units(id) UNIQUE,
    iuran_harian INTEGER NOT NULL DEFAULT 500,
    target_bulanan INTEGER NOT NULL DEFAULT 500000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Koropak Iuran
CREATE TABLE IF NOT EXISTS koropak_iuran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rt_id UUID REFERENCES rt_units(id),
    nama_donatur VARCHAR(100) NOT NULL,
    jumlah_hari INTEGER NOT NULL DEFAULT 1,
    nominal INTEGER NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Penyaluran Dana
CREATE TABLE IF NOT EXISTS penyaluran_dana (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rt_id UUID REFERENCES rt_units(id),
    penerima VARCHAR(100) NOT NULL,
    keperluan VARCHAR(100) NOT NULL,
    jumlah INTEGER NOT NULL,
    keterangan TEXT,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE KONTAK DARURAT TABLE IF NOT EXISTS
-- ============================================

DO $$ BEGIN
    CREATE TYPE kategori_darurat AS ENUM ('MEDIS', 'KEAMANAN', 'DARURAT', 'UTILITAS', 'RT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS kontak_darurat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rt_id UUID REFERENCES rt_units(id),  -- NULL = global untuk semua RT
    nama VARCHAR(100) NOT NULL,
    nomor VARCHAR(20) NOT NULL,
    kategori kategori_darurat NOT NULL DEFAULT 'RT',
    icon VARCHAR(10) DEFAULT '📞',
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE JENIS SAMPAH TABLE IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS jenis_sampah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    harga INTEGER NOT NULL DEFAULT 0,
    poin INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(10) DEFAULT '♻️',
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default jenis sampah if empty
INSERT INTO jenis_sampah (nama, harga, poin, icon) 
SELECT * FROM (VALUES 
    ('Plastik', 2000, 20, '🧴'),
    ('Kertas', 1500, 15, '📄'),
    ('Kardus', 1500, 15, '📦'),
    ('Botol Kaca', 500, 5, '🍾'),
    ('Kaleng', 3000, 30, '🥫'),
    ('Elektronik', 5000, 50, '📱')
) AS v(nama, harga, poin, icon)
WHERE NOT EXISTS (SELECT 1 FROM jenis_sampah LIMIT 1);

-- 7. INSERT DEFAULT SUPER ADMIN
-- ============================================
-- Password: admin123 (hashed with bcrypt, you should change this!)

INSERT INTO admin_users (email, password_hash, nama, role, is_active)
SELECT 'superadmin@lapor.rt', '$2b$10$rQXxQqKjJ4L8Vj7VLVz6yeYXDxH3X9UXQZ3Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Super Admin', 'SUPER_ADMIN', true
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE role = 'SUPER_ADMIN' LIMIT 1);

-- 8. INSERT DEFAULT RT UNIT
-- ============================================

INSERT INTO rt_units (nama, nomor_rt, nomor_rw, kelurahan, kecamatan, kota)
SELECT 'RT 05 / RW 03', '05', '03', 'Kelurahan Digital', 'Kecamatan Maju', 'Kota Harapan'
WHERE NOT EXISTS (SELECT 1 FROM rt_units LIMIT 1);

-- 9. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE rt_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE koropak_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE koropak_iuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE penyaluran_dana ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontak_darurat ENABLE ROW LEVEL SECURITY;
ALTER TABLE jenis_sampah ENABLE ROW LEVEL SECURITY;

-- Policy: Semua bisa baca RT units yang aktif
CREATE POLICY "RT units bisa dibaca semua" ON rt_units
    FOR SELECT USING (is_active = true);

-- Policy: Semua bisa baca kontak darurat yang aktif
CREATE POLICY "Kontak darurat bisa dibaca semua" ON kontak_darurat
    FOR SELECT USING (aktif = true);

-- Policy: Semua bisa baca jenis sampah yang aktif
CREATE POLICY "Jenis sampah bisa dibaca semua" ON jenis_sampah
    FOR SELECT USING (aktif = true);

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
