-- ============================================
-- MIGRATION: Warga Quota System
-- Run this AFTER 001_multi_rt_admin.sql
-- ============================================

-- 1. Add kuota_kk column to rt_units
ALTER TABLE rt_units ADD COLUMN IF NOT EXISTS kuota_kk INTEGER DEFAULT 100;

-- 2. Create warga table
CREATE TABLE IF NOT EXISTS warga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rt_id UUID REFERENCES rt_units(id) NOT NULL,
    no_kk VARCHAR(20) NOT NULL,
    nama_kepala_keluarga VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    alamat TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint: one KK per RT
    UNIQUE(rt_id, no_kk)
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_warga_rt ON warga(rt_id);
CREATE INDEX IF NOT EXISTS idx_warga_no_kk ON warga(no_kk);
CREATE INDEX IF NOT EXISTS idx_warga_active ON warga(is_active);

-- 4. Enable RLS
ALTER TABLE warga ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Warga can be read by anyone (for checking registration)
CREATE POLICY "Warga bisa dibaca semua" ON warga
    FOR SELECT USING (true);

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
