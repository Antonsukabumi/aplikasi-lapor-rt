// Types for Multi-RT Admin System

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN_RT';

export interface RtUnit {
    id: string;
    nama: string;
    nomor_rt: string;
    nomor_rw: string;
    kelurahan: string | null;
    kecamatan: string | null;
    kota: string | null;
    kuota_kk: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Warga {
    id: string;
    rt_id: string;
    no_kk: string;
    nama_kepala_keluarga: string;
    no_hp: string;
    alamat: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Joined data
    rt_unit?: RtUnit;
    blok?: string; // Add blok property
}

export interface AdminUser {
    id: string;
    email: string;
    nama: string;
    role: AdminRole;
    rt_id: string | null;
    no_hp: string | null;
    avatar_url: string | null;
    is_active: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    rt_unit?: RtUnit;
}

export interface AdminSession {
    id: string;
    email: string;
    nama: string;
    role: AdminRole;
    rt_id: string | null;
    rt_info?: {
        nama: string;
        nomor_rt: string;
        nomor_rw: string;
        kelurahan: string | null;
    };
}

// Koropak types
export interface KoropakSettings {
    id: string;
    rt_id: string | null;
    iuran_harian: number;
    target_bulanan: number;
}

export interface KoropakIuran {
    id: string;
    rt_id: string | null;
    nama_donatur: string;
    jumlah_hari: number;
    nominal: number;
    tanggal: string;
    created_at: string;
}

export interface PenyaluranDana {
    id: string;
    rt_id: string | null;
    penerima: string;
    keperluan: string;
    jumlah: number;
    keterangan: string | null;
    tanggal: string;
    created_at: string;
}

// Kontak Darurat types
export type KategoriDarurat = 'MEDIS' | 'KEAMANAN' | 'DARURAT' | 'UTILITAS' | 'RT';

export interface KontakDarurat {
    id: string;
    rt_id: string | null;
    nama: string;
    nomor: string;
    kategori: KategoriDarurat;
    icon: string;
    aktif: boolean;
    created_at: string;
}

// Jenis Sampah types
export interface JenisSampah {
    id: string;
    nama: string;
    harga: number;
    poin: number;
    icon: string;
    aktif: boolean;
}

// Laporan types (updated)
export type JenisLaporan = 'MENINGGAL' | 'SAKIT' | 'BENCANA';
export type StatusLaporan = 'BARU' | 'DITERIMA' | 'DIPROSES' | 'SELESAI';

export interface Laporan {
    id: string;
    rt_id: string | null;
    warga_id: string | null;
    nama_pelapor: string;
    no_hp_pelapor: string | null;
    jenis: JenisLaporan;
    deskripsi: string;
    lokasi: string;
    foto_url: string | null;
    latitude: number | null;
    longitude: number | null;
    status: StatusLaporan;
    admin_id: string | null;
    balasan: string | null;
    created_at: string;
    updated_at: string;
}
