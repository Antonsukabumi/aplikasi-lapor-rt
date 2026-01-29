'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Home, Users, UserPlus, Search, Phone, MapPin,
    ChevronRight, AlertCircle, CheckCircle
} from 'lucide-react';
import type { RtUnit } from '@/types';

export default function DaftarWargaPage() {
    const [step, setStep] = useState<'pilih-rt' | 'form' | 'sukses'>('pilih-rt');
    const [rtList, setRtList] = useState<RtUnit[]>([]);
    const [selectedRt, setSelectedRt] = useState<RtUnit | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        no_kk: '',
        nama_kepala_keluarga: '',
        no_hp: '',
        alamat: ''
    });

    useEffect(() => {
        fetchRtList();
    }, []);

    const fetchRtList = async () => {
        try {
            const res = await fetch('/api/rt');
            const data = await res.json();
            if (data.success) {
                setRtList(data.data || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRt = (rt: RtUnit) => {
        setSelectedRt(rt);
        setStep('form');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRt) return;

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/warga', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rt_id: selectedRt.id,
                    ...formData
                })
            });
            const data = await res.json();

            if (data.success) {
                setStep('sukses');
            } else {
                setError(data.error || 'Gagal mendaftar');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Memuat...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
            {/* Header */}
            <header className="p-4 text-white">
                <div className="max-w-md mx-auto flex items-center gap-3">
                    <Link href="/" className="p-2 bg-white/20 rounded-full">
                        <Home className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg">Daftar Warga</h1>
                        <p className="text-emerald-100 text-xs">Registrasi untuk akses layanan RT</p>
                    </div>
                </div>
            </header>

            <div className="max-w-md mx-auto p-4">
                {/* Step: Pilih RT */}
                {step === 'pilih-rt' && (
                    <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3 text-white mb-4">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold">Pilih RT Anda</h2>
                                    <p className="text-sm text-emerald-100">Daftar sebagai warga RT</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {rtList.length === 0 ? (
                                <div className="bg-white rounded-xl p-6 text-center text-slate-400">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada RT terdaftar</p>
                                </div>
                            ) : (
                                rtList.map((rt) => (
                                    <button
                                        key={rt.id}
                                        onClick={() => handleSelectRt(rt)}
                                        className="w-full bg-white rounded-xl p-4 text-left hover:shadow-lg transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                <Home className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{rt.nama}</h3>
                                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {[rt.kelurahan, rt.kecamatan].filter(Boolean).join(', ') || 'Alamat belum diisi'}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step: Form */}
                {step === 'form' && selectedRt && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setStep('pilih-rt')}
                            className="text-white text-sm flex items-center gap-1 hover:underline"
                        >
                            ← Kembali pilih RT
                        </button>

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-emerald-600 p-4 text-white">
                                <div className="flex items-center gap-3">
                                    <UserPlus className="w-6 h-6" />
                                    <div>
                                        <h2 className="font-bold">Form Pendaftaran</h2>
                                        <p className="text-sm text-emerald-100">{selectedRt.nama}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        No. Kartu Keluarga (KK) *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.no_kk}
                                        onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                                        placeholder="16 digit nomor KK"
                                        maxLength={16}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        Nama Kepala Keluarga *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.nama_kepala_keluarga}
                                        onChange={(e) => setFormData({ ...formData, nama_kepala_keluarga: e.target.value })}
                                        placeholder="Nama lengkap sesuai KK"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        No. HP/WhatsApp *
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            required
                                            type="tel"
                                            value={formData.no_hp}
                                            onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        Alamat Rumah
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={formData.alamat}
                                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                        placeholder="Jl. Contoh No. 123, Blok A"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    {submitting ? 'Mendaftar...' : 'Daftar Sekarang'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Step: Sukses */}
                {step === 'sukses' && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Berhasil Terdaftar!</h2>
                        <p className="text-slate-500 mb-6">
                            Anda sekarang terdaftar sebagai warga {selectedRt?.nama}
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700"
                        >
                            <Home className="w-5 h-5" />
                            Kembali ke Beranda
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
