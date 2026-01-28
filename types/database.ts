// Database types yang di-generate dari skema Supabase
// Ini memastikan type safety saat query database

export type Database = {
    public: {
        Tables: {
            warga: {
                Row: {
                    id: string;
                    nama: string;
                    no_hp: string;
                    alamat: string | null;
                    blok: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    nama: string;
                    no_hp: string;
                    alamat?: string | null;
                    blok?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    nama?: string;
                    no_hp?: string;
                    alamat?: string | null;
                    blok?: string | null;
                    created_at?: string;
                };
            };
            admin: {
                Row: {
                    id: string;
                    nama: string;
                    no_hp: string;
                    pin_hash: string;
                    role: 'RT' | 'SEKRETARIS' | 'BANK_SAMPAH';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    nama: string;
                    no_hp: string;
                    pin_hash: string;
                    role?: 'RT' | 'SEKRETARIS' | 'BANK_SAMPAH';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    nama?: string;
                    no_hp?: string;
                    pin_hash?: string;
                    role?: 'RT' | 'SEKRETARIS' | 'BANK_SAMPAH';
                    created_at?: string;
                };
            };
            laporan: {
                Row: {
                    id: string;
                    warga_id: string | null;
                    nama_pelapor: string;
                    no_hp_pelapor: string | null;
                    jenis: 'MENINGGAL' | 'SAKIT' | 'BENCANA';
                    deskripsi: string;
                    lokasi: string;
                    foto_url: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    status: 'BARU' | 'DITERIMA' | 'DIPROSES' | 'SELESAI';
                    admin_id: string | null;
                    balasan: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    warga_id?: string | null;
                    nama_pelapor: string;
                    no_hp_pelapor?: string | null;
                    jenis: 'MENINGGAL' | 'SAKIT' | 'BENCANA';
                    deskripsi: string;
                    lokasi: string;
                    foto_url?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    status?: 'BARU' | 'DITERIMA' | 'DIPROSES' | 'SELESAI';
                    admin_id?: string | null;
                    balasan?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    warga_id?: string | null;
                    nama_pelapor?: string;
                    no_hp_pelapor?: string | null;
                    jenis?: 'MENINGGAL' | 'SAKIT' | 'BENCANA';
                    deskripsi?: string;
                    lokasi?: string;
                    foto_url?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    status?: 'BARU' | 'DITERIMA' | 'DIPROSES' | 'SELESAI';
                    admin_id?: string | null;
                    balasan?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            pengumuman: {
                Row: {
                    id: string;
                    admin_id: string;
                    judul: string;
                    isi: string;
                    prioritas: 'BIASA' | 'PENTING' | 'DARURAT';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    admin_id: string;
                    judul: string;
                    isi: string;
                    prioritas?: 'BIASA' | 'PENTING' | 'DARURAT';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    admin_id?: string;
                    judul?: string;
                    isi?: string;
                    prioritas?: 'BIASA' | 'PENTING' | 'DARURAT';
                    created_at?: string;
                };
            };
            bank_sampah_jenis: {
                Row: {
                    id: string;
                    nama: string;
                    harga_per_kg: number;
                    poin_per_kg: number;
                    aktif: boolean;
                };
                Insert: {
                    id?: string;
                    nama: string;
                    harga_per_kg: number;
                    poin_per_kg: number;
                    aktif?: boolean;
                };
                Update: {
                    id?: string;
                    nama?: string;
                    harga_per_kg?: number;
                    poin_per_kg?: number;
                    aktif?: boolean;
                };
            };
            bank_sampah_transaksi: {
                Row: {
                    id: string;
                    warga_id: string;
                    jenis_id: string;
                    berat_kg: number | null;
                    poin: number;
                    uang: number;
                    status: 'REQUEST' | 'DIJEMPUT' | 'DITIMBANG' | 'SELESAI';
                    alamat_jemput: string | null;
                    jadwal_jemput: string | null;
                    pengelola_id: string | null;
                    created_at: string;
                    completed_at: string | null;
                };
                Insert: {
                    id?: string;
                    warga_id: string;
                    jenis_id: string;
                    berat_kg?: number | null;
                    poin?: number;
                    uang?: number;
                    status?: 'REQUEST' | 'DIJEMPUT' | 'DITIMBANG' | 'SELESAI';
                    alamat_jemput?: string | null;
                    jadwal_jemput?: string | null;
                    pengelola_id?: string | null;
                    created_at?: string;
                    completed_at?: string | null;
                };
                Update: {
                    id?: string;
                    warga_id?: string;
                    jenis_id?: string;
                    berat_kg?: number | null;
                    poin?: number;
                    uang?: number;
                    status?: 'REQUEST' | 'DIJEMPUT' | 'DITIMBANG' | 'SELESAI';
                    alamat_jemput?: string | null;
                    jadwal_jemput?: string | null;
                    pengelola_id?: string | null;
                    created_at?: string;
                    completed_at?: string | null;
                };
            };
            bank_sampah_saldo: {
                Row: {
                    id: string;
                    warga_id: string;
                    total_poin: number;
                    total_uang: number;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    warga_id: string;
                    total_poin?: number;
                    total_uang?: number;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    warga_id?: string;
                    total_poin?: number;
                    total_uang?: number;
                    updated_at?: string;
                };
            };
            iuran_warga: {
                Row: {
                    id: string;
                    warga_id: string;
                    bulan: number;
                    tahun: number;
                    nominal: number;
                    status: 'BELUM' | 'LUNAS' | 'SEBAGIAN';
                    tanggal_bayar: string | null;
                    catatan: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    warga_id: string;
                    bulan: number;
                    tahun: number;
                    nominal?: number;
                    status?: 'BELUM' | 'LUNAS' | 'SEBAGIAN';
                    tanggal_bayar?: string | null;
                    catatan?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    warga_id?: string;
                    bulan?: number;
                    tahun?: number;
                    nominal?: number;
                    status?: 'BELUM' | 'LUNAS' | 'SEBAGIAN';
                    tanggal_bayar?: string | null;
                    catatan?: string | null;
                    created_at?: string;
                };
            };
        };
        Enums: {
            admin_role: 'RT' | 'SEKRETARIS' | 'BANK_SAMPAH';
            jenis_laporan: 'MENINGGAL' | 'SAKIT' | 'BENCANA';
            status_laporan: 'BARU' | 'DITERIMA' | 'DIPROSES' | 'SELESAI';
            prioritas_pengumuman: 'BIASA' | 'PENTING' | 'DARURAT';
            status_bank_sampah: 'REQUEST' | 'DIJEMPUT' | 'DITIMBANG' | 'SELESAI';
            status_iuran: 'BELUM' | 'LUNAS' | 'SEBAGIAN';
            responder_role: 'RT' | 'RW' | 'BABINSA' | 'BINMAS' | 'AMBULAN' | 'DAMKAR' | 'PUSKESMAS' | 'KELURAHAN';
        };
    };
};

// Helper types untuk kemudahan penggunaan
export type Warga = Database['public']['Tables']['warga']['Row'];
export type Admin = Database['public']['Tables']['admin']['Row'];
export type Laporan = Database['public']['Tables']['laporan']['Row'];
export type Pengumuman = Database['public']['Tables']['pengumuman']['Row'];
export type BankSampahJenis = Database['public']['Tables']['bank_sampah_jenis']['Row'];
export type BankSampahTransaksi = Database['public']['Tables']['bank_sampah_transaksi']['Row'];
export type BankSampahSaldo = Database['public']['Tables']['bank_sampah_saldo']['Row'];
export type IuranWarga = Database['public']['Tables']['iuran_warga']['Row'];

// Insert types
export type LaporanInsert = Database['public']['Tables']['laporan']['Insert'];
export type WargaInsert = Database['public']['Tables']['warga']['Insert'];

// Enum types
export type JenisLaporan = Database['public']['Enums']['jenis_laporan'];
export type StatusLaporan = Database['public']['Enums']['status_laporan'];
export type ResponderRole = Database['public']['Enums']['responder_role'];

// Responder type (untuk notifikasi)
export interface Responder {
    id: string;
    nama: string;
    no_hp: string;
    role: ResponderRole;
    aktif: boolean;
    created_at: string;
}

// Matriks notifikasi (jenis laporan -> responder roles)
export const NOTIFIKASI_MATRIKS: Record<JenisLaporan, ResponderRole[]> = {
    MENINGGAL: ['RT', 'AMBULAN'],
    SAKIT: ['RT', 'AMBULAN', 'PUSKESMAS'],
    BENCANA: ['RT', 'RW', 'BABINSA', 'BINMAS', 'AMBULAN', 'DAMKAR', 'PUSKESMAS'],
};
