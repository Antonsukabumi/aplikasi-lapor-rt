import { promises as fs } from 'fs';
import path from 'path';
import type { Laporan, LaporanInsert } from '@/types/database';

// Path ke file JSON untuk menyimpan data
const DATA_DIR = path.join(process.cwd(), 'data');
const LAPORAN_FILE = path.join(DATA_DIR, 'laporan.json');

// Pastikan direktori dan file ada
async function ensureDataFile() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(LAPORAN_FILE);
        } catch {
            await fs.writeFile(LAPORAN_FILE, '[]', 'utf-8');
        }
    } catch (error) {
        console.error('Error ensuring data file:', error);
    }
}

// Generate UUID sederhana
function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Ambil semua laporan
export async function getAllLaporan(): Promise<Laporan[]> {
    await ensureDataFile();
    const data = await fs.readFile(LAPORAN_FILE, 'utf-8');
    return JSON.parse(data);
}

// Ambil laporan by ID
export async function getLaporanById(id: string): Promise<Laporan | null> {
    const laporan = await getAllLaporan();
    return laporan.find(l => l.id === id) || null;
}

// Simpan laporan baru
export async function createLaporan(input: LaporanInsert): Promise<Laporan> {
    await ensureDataFile();
    const laporan = await getAllLaporan();

    const newLaporan: Laporan = {
        id: generateId(),
        warga_id: input.warga_id || null,
        nama_pelapor: input.nama_pelapor,
        no_hp_pelapor: input.no_hp_pelapor || null,
        jenis: input.jenis,
        deskripsi: input.deskripsi,
        lokasi: input.lokasi,
        foto_url: input.foto_url || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        status: 'BARU',
        admin_id: null,
        balasan: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    laporan.unshift(newLaporan); // Tambah di awal (terbaru di atas)
    await fs.writeFile(LAPORAN_FILE, JSON.stringify(laporan, null, 2), 'utf-8');

    return newLaporan;
}

// Update laporan
export async function updateLaporan(id: string, updates: Partial<Laporan>): Promise<Laporan | null> {
    await ensureDataFile();
    const laporan = await getAllLaporan();
    const index = laporan.findIndex(l => l.id === id);

    if (index === -1) return null;

    laporan[index] = {
        ...laporan[index],
        ...updates,
        updated_at: new Date().toISOString()
    };

    await fs.writeFile(LAPORAN_FILE, JSON.stringify(laporan, null, 2), 'utf-8');

    return laporan[index];
}

// Hapus laporan
export async function deleteLaporan(id: string): Promise<boolean> {
    await ensureDataFile();
    const laporan = await getAllLaporan();
    const filtered = laporan.filter(l => l.id !== id);

    if (filtered.length === laporan.length) return false;

    await fs.writeFile(LAPORAN_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
}
