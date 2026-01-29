'use client';

import { useState, useEffect } from "react";
import {
    ArrowLeft, Recycle, Save, User, Phone, MapPin, Clock, Calendar, Package, Info,
    ShieldAlert, Check, DollarSign
} from "lucide-react";
import Link from "next/link";

interface BankSampahSettings {
    nama_pengelola: string;
    no_wa_pengelola: string;
    alamat_bank_sampah: string;
    jam_operasional: string;
    hari_operasional: string;
    minimal_jemput_kg: number;
    info_tambahan: string;
}

export default function SettingsBankSampah() {
    const [isLogin, setIsLogin] = useState(false);
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState<BankSampahSettings>({
        nama_pengelola: '',
        no_wa_pengelola: '',
        alamat_bank_sampah: '',
        jam_operasional: '08:00 - 16:00',
        hari_operasional: 'Senin - Sabtu',
        minimal_jemput_kg: 5,
        info_tambahan: ''
    });

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bank-sampah/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLogin) {
            fetchSettings();
        }
    }, [isLogin]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === "1234") {
            setIsLogin(true);
        } else {
            alert("PIN Salah!");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/bank-sampah/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    // Login page
    if (!isLogin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-6">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Recycle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1 text-slate-900">Setting Bank Sampah</h1>
                    <p className="text-sm text-slate-500 mb-6">Masukkan PIN Admin</p>
                    <input
                        autoFocus
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full text-center text-3xl tracking-[0.5em] font-bold p-4 border-2 border-slate-200 rounded-xl mb-4 focus:border-green-500 outline-none"
                        placeholder="••••"
                        maxLength={4}
                    />
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700">
                        Masuk
                    </button>
                    <Link href="/admin" className="block mt-4 text-sm text-slate-400 hover:text-slate-600">
                        ← Kembali ke Dashboard
                    </Link>
                </form>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-green-600 text-white p-4 shadow-lg">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Setting Bank Sampah</h1>
                            <p className="text-green-200 text-xs">Kelola info pengelola & operasional</p>
                        </div>
                    </div>
                    {saved && (
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Tersimpan!</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="max-w-2xl mx-auto p-4">
                {/* Quick Link to Harga */}
                <Link
                    href="/admin/bank-sampah/harga"
                    className="mb-4 p-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-lg flex items-center justify-between text-white hover:scale-[1.02] transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8" />
                        <div>
                            <div className="font-bold">Kelola Harga Sampah</div>
                            <div className="text-sm text-white/80">Tambah/Edit jenis & harga sampah</div>
                        </div>
                    </div>
                    <span className="text-2xl">→</span>
                </Link>

                {loading ? (
                    <div className="text-center py-8 text-slate-400">Memuat...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Info Pengelola */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-green-600" />
                                Info Pengelola
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        Nama Pengelola
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.nama_pengelola}
                                        onChange={(e) => setSettings({ ...settings, nama_pengelola: e.target.value })}
                                        placeholder="Contoh: Pak Budi"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        Nomor WhatsApp Pengelola
                                    </label>
                                    <input
                                        type="tel"
                                        value={settings.no_wa_pengelola}
                                        onChange={(e) => setSettings({ ...settings, no_wa_pengelola: e.target.value })}
                                        placeholder="Contoh: 081234567890"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Nomor ini akan tampil di halaman Bank Sampah warga</p>
                                </div>
                            </div>
                        </div>

                        {/* Info Lokasi */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-600" />
                                Lokasi & Jadwal
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        Alamat Bank Sampah
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.alamat_bank_sampah}
                                        onChange={(e) => setSettings({ ...settings, alamat_bank_sampah: e.target.value })}
                                        placeholder="Contoh: Jl. RT 05 No. 1, Depan Balai Warga"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            Jam Operasional
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.jam_operasional}
                                            onChange={(e) => setSettings({ ...settings, jam_operasional: e.target.value })}
                                            placeholder="08:00 - 16:00"
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1">
                                            <Calendar className="w-3 h-3 inline mr-1" />
                                            Hari Operasional
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.hari_operasional}
                                            onChange={(e) => setSettings({ ...settings, hari_operasional: e.target.value })}
                                            placeholder="Senin - Sabtu"
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Layanan */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-green-600" />
                                Layanan Jemput
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        Minimal Berat Jemput (kg)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={settings.minimal_jemput_kg}
                                        onChange={(e) => setSettings({ ...settings, minimal_jemput_kg: parseInt(e.target.value) || 1 })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        <Info className="w-3 h-3 inline mr-1" />
                                        Informasi Tambahan
                                    </label>
                                    <textarea
                                        value={settings.info_tambahan}
                                        onChange={(e) => setSettings({ ...settings, info_tambahan: e.target.value })}
                                        placeholder="Contoh: Sampah harus sudah dipilah sebelum dijemput"
                                        rows={3}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
