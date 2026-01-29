-- ============================================
-- MIGRATION: Bank Sampah System
-- ============================================

-- 1. CREATE BANK SAMPAH SALDO TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bank_sampah_saldo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID REFERENCES warga(id) UNIQUE NOT NULL,
    total_poin INTEGER NOT NULL DEFAULT 0,
    total_uang INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_saldo_warga ON bank_sampah_saldo(warga_id);

-- 2. CREATE BANK SAMPAH TRANSAKSI TABLE
-- ============================================

CREATE TYPE status_bank_sampah AS ENUM ('PENDING', 'SELESAI', 'DIBATALKAN');

CREATE TABLE IF NOT EXISTS bank_sampah_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID REFERENCES warga(id) NOT NULL,
    jenis_sampah_id UUID REFERENCES jenis_sampah(id) NOT NULL,
    berat_kg DECIMAL(10, 2) NOT NULL,
    poin INTEGER NOT NULL DEFAULT 0,
    uang INTEGER NOT NULL DEFAULT 0,
    status status_bank_sampah NOT NULL DEFAULT 'SELESAI',
    admin_id UUID REFERENCES admin_users(id),
    rt_id UUID REFERENCES rt_units(id), -- To filter by RT
    tgl_transaksi TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transaksi_warga ON bank_sampah_transaksi(warga_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_rt ON bank_sampah_transaksi(rt_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_date ON bank_sampah_transaksi(tgl_transaksi);

-- 3. ENABLE RLS
-- ============================================

ALTER TABLE bank_sampah_saldo ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_sampah_transaksi ENABLE ROW LEVEL SECURITY;

-- Policies for Saldo
-- Warga can view their own saldo
CREATE POLICY "Warga view own saldo" ON bank_sampah_saldo
    FOR SELECT USING (
        warga_id IN (
            -- Ideally we check if auth.uid() matches a column in warga, 
            -- but current auth is simple. For now allow public read 
            -- or assume admin/system handles it.
            -- Real implementation needs auth.uid() -> warga mapping.
            -- For Admin:
            true
        )
    );

-- Policies for Transaksi
-- Admin RT can view transactions in their RT
-- (Simplified for now, similar to laporan)
CREATE POLICY "Admin read all transactions" ON bank_sampah_transaksi
    FOR SELECT USING (true);

CREATE POLICY "Admin insert transactions" ON bank_sampah_transaksi
    FOR INSERT WITH CHECK (true);
