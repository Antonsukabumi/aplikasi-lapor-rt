'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Save, User, Scale, Calculator, AlertCircle, Loader2
} from 'lucide-react';
import type { Warga } from '@/types';

type JenisSampah = {
    id: string;
    nama: string;
    harga: number;
    poin: number;
    icon: string;
};

export default function SetorSampahPage() {
    const router = useRouter();
    const [wargaList, setWargaList] = useState<Warga[]>([]);
    const [jenisList, setJenisList] = useState<JenisSampah[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [selectedWarga, setSelectedWarga] = useState('');
    const [selectedJenis, setSelectedJenis] = useState('');
    const [berat, setBerat] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [resWarga, resJenis] = await Promise.all([
                fetch('/api/admin/warga'),
                fetch('/api/bank-sampah/jenis')
            ]);

            const dataWarga = await resWarga.json();
            const dataJenis = await resJenis.json();

            if (dataWarga.success) setWargaList(dataWarga.data || []);
            if (dataJenis.success) setJenisList(dataJenis.data || []);

        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculations
    const currentJenis = jenisList.find(j => j.id === selectedJenis);
    const estUang = currentJenis && berat ? Math.floor(currentJenis.harga * Number(berat)) : 0;
    const estPoin = currentJenis && berat ? Math.floor(currentJenis.poin * Number(berat)) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/bank-sampah/transaksi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    warga_id: selectedWarga,
                    jenis_sampah_id: selectedJenis,
                    berat_kg: Number(berat)
                })
            });

            const data = await res.json();

            if (data.success) {
                alert(`Setoran Berhasil!\n+${data.data.totals.poin} Poin\nRp ${data.data.totals.uang}`);
                router.push('/admin/bank-sampah');
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Gagal mengirim data');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="bg-emerald-600 text-white p-4 sticky top-0 z-30 shadow-lg">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/admin/bank-sampah" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg">Setor Sampah</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Pilih Warga */}
                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" /> Pilih Warga
                        </label>
                        <select
                            required
                            value={selectedWarga}
                            onChange={(e) => setSelectedWarga(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">-- Pilih Warga --</option>
                            {wargaList.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.nama_kepala_keluarga} ({w.blok || 'No Blok'})
                                </option>
                            ))}
                        </select>
                        {wargaList.length === 0 && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Belum ada data warga. Tambahkan di menu Warga.
                            </p>
                        )}
                    </div>

                    {/* Pilih Jenis & Berat */}
                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2">Jenis Sampah</label>
                            <div className="grid grid-cols-2 gap-2">
                                {jenisList.map(jenis => (
                                    <button
                                        key={jenis.id}
                                        type="button"
                                        onClick={() => setSelectedJenis(jenis.id)}
                                        className={`p-3 rounded-xl border text-left transition-all ${selectedJenis === jenis.id
                                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                                                : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{jenis.icon}</div>
                                        <div className="font-semibold text-sm text-slate-800">{jenis.nama}</div>
                                        <div className="text-xs text-slate-500">Rp {jenis.harga}/kg</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                                <Scale className="w-4 h-4 text-emerald-600" /> Berat (kg)
                            </label>
                            <input
                                required
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={berat}
                                onChange={(e) => setBerat(e.target.value)}
                                placeholder="0.0"
                                className="w-full p-3 text-lg font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Estimasi */}
                    {selectedJenis && berat && (
                        <div className="bg-emerald-900 text-white p-4 rounded-xl shadow-lg">
                            <h3 className="text-emerald-200 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                <Calculator className="w-3 h-3" /> Estimasi Perolehan
                            </h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-sm opacity-80">Poin</div>
                                    <div className="text-2xl font-bold text-yellow-400">+{estPoin}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm opacity-80">Uang Tunai</div>
                                    <div className="text-2xl font-bold">Rp {estUang.toLocaleString('id-ID')}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !selectedWarga || !selectedJenis || !berat}
                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" /> Simpan Transaksi
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
