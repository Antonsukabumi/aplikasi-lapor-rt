export type LaporanType = 'meninggal' | 'sakit' | 'bencana';

export interface Laporan {
    id: string;
    created_at: string;
    jenis_laporan: LaporanType;
    nama_pelapor: string;
    lokasi: string;
    deskripsi: string;
    foto_url?: string; // Opsional
    status: 'BARU' | 'DIBACA' | 'SELESAI';
    catatan_petugas?: string; // Balasan/Tindakan Pak RT
}

export const TIPE_LAPORAN: Record<LaporanType, { label: string; color: string; icon: string }> = {
    meninggal: { label: 'Kabar Duka', color: 'red', icon: '🥀' },
    sakit: { label: 'Warga Sakit', color: 'amber', icon: '🏥' },
    bencana: { label: 'Bencana Alam', color: 'blue', icon: '⚡' },
};
