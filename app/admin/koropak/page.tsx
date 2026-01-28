'use client';

import { useState, useEffect } from "react";
import {
    ArrowLeft, PiggyBank, Users, Gift, Plus, Check, X, Wallet,
    TrendingUp, Calendar, Edit2, Trash2, AlertCircle
} from "lucide-react";
import Link from "next/link";

interface KoropakData {
    total_terkumpul: number;
    target_bulanan: number;
    iuran_harian: number;
    total_donatur: number;
    bulan_aktif: string;
    riwayat_penyaluran: Array<{
        id: string;
        tanggal: string;
        penerima: string;
        keperluan: string;
        jumlah: number;
        keterangan: string;
    }>;
    donatur: Array<{
        nama: string;
        total_hari: number;
        total_nominal: number;
    }>;
}

export default function AdminKoropakPage() {
    const [isLogin, setIsLogin] = useState(false);
    const [pin, setPin] = useState("");
    const [data, setData] = useState<KoropakData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'iuran' | 'salur'>('overview');

    // Form states
    const [showIuranForm, setShowIuranForm] = useState(false);
    const [showSalurForm, setShowSalurForm] = useState(false);
    const [iuranForm, setIuranForm] = useState({ nama: '', jumlah_hari: 1 });
    const [salurForm, setSalurForm] = useState({ penerima: '', keperluan: '', jumlah: 0, keterangan: '' });

    const fetchData = async () => {
        try {
            const res = await fetch('/api/koropak');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLogin) {
            fetchData();
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

    const handleAddIuran = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/koropak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(iuranForm)
            });
            const json = await res.json();
            if (json.success) {
                alert(json.message);
                setShowIuranForm(false);
                setIuranForm({ nama: '', jumlah_hari: 1 });
                fetchData();
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleAddSalur = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/koropak', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salurForm)
            });
            const json = await res.json();
            if (json.success) {
                alert(json.message);
                setShowSalurForm(false);
                setSalurForm({ penerima: '', keperluan: '', jumlah: 0, keterangan: '' });
                fetchData();
            } else {
                alert(json.error);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    // Login page
    if (!isLogin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center p-6">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PiggyBank className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1 text-slate-900">Admin Koropak</h1>
                    <p className="text-sm text-slate-500 mb-6">Masukkan PIN Admin</p>
                    <input
                        autoFocus
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full text-center text-3xl tracking-[0.5em] font-bold p-4 border-2 border-slate-200 rounded-xl mb-4 focus:border-amber-500 outline-none"
                        placeholder="••••"
                        maxLength={4}
                    />
                    <button type="submit" className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl hover:bg-amber-600">
                        Masuk
                    </button>
                    <Link href="/admin" className="block mt-4 text-sm text-slate-400 hover:text-slate-600">
                        ← Kembali ke Dashboard
                    </Link>
                </form>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50">
                <div className="text-amber-600 font-semibold">Memuat...</div>
            </div>
        );
    }

    const progressPercent = data ? (data.total_terkumpul / data.target_bulanan) * 100 : 0;

    return (
        <main className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 shadow-lg">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Admin Koropak</h1>
                            <p className="text-amber-100 text-xs">Kelola Dana Sosial RT</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="max-w-2xl mx-auto p-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                            <Wallet className="w-5 h-5" />
                            <span className="text-sm font-medium">Dana Terkumpul</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            Rp {data?.total_terkumpul.toLocaleString()}
                        </div>
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Target: Rp {data?.target_bulanan.toLocaleString()} ({progressPercent.toFixed(0)}%)
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <Users className="w-5 h-5" />
                            <span className="text-sm font-medium">Total Donatur</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{data?.total_donatur}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            Iuran Rp {data?.iuran_harian}/hari
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-4">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'iuran', label: 'Input Iuran', icon: Plus },
                        { id: 'salur', label: 'Salurkan Dana', icon: Gift },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors ${activeTab === tab.id
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        {/* Recent Donations */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-500" />
                                Donatur Terbaru
                            </h3>
                            <div className="space-y-2">
                                {data?.donatur.slice(0, 5).map((d, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-slate-400'
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <span className="font-medium text-slate-700">{d.nama}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-amber-600">Rp {d.total_nominal.toLocaleString()}</div>
                                            <div className="text-xs text-slate-500">{d.total_hari} hari</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Disbursements */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-green-500" />
                                Penyaluran Terbaru
                            </h3>
                            <div className="space-y-2">
                                {data?.riwayat_penyaluran.slice(0, 5).map((r) => (
                                    <div key={r.id} className="p-2 bg-green-50 rounded-lg border-l-4 border-green-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium text-slate-700">{r.penerima}</div>
                                                <div className="text-xs text-slate-500">{r.keperluan}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600">Rp {r.jumlah.toLocaleString()}</div>
                                                <div className="text-xs text-slate-500">{r.tanggal}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'iuran' && (
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-amber-500" />
                            Input Iuran Baru
                        </h3>
                        <form onSubmit={handleAddIuran} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Donatur</label>
                                <input
                                    required
                                    type="text"
                                    value={iuranForm.nama}
                                    onChange={(e) => setIuranForm({ ...iuranForm, nama: e.target.value })}
                                    placeholder="Masukkan nama warga"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Jumlah Hari</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 7, 14, 30].map((hari) => (
                                        <button
                                            key={hari}
                                            type="button"
                                            onClick={() => setIuranForm({ ...iuranForm, jumlah_hari: hari })}
                                            className={`py-3 rounded-xl font-bold text-sm transition-colors ${iuranForm.jumlah_hari === hari
                                                    ? 'bg-amber-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {hari} hari
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Total Iuran:</span>
                                    <span className="text-2xl font-bold text-amber-600">
                                        Rp {(iuranForm.jumlah_hari * (data?.iuran_harian || 500)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                Verifikasi & Simpan Iuran
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'salur' && (
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-green-500" />
                            Salurkan Dana Sosial
                        </h3>

                        {/* Warning if low funds */}
                        {(data?.total_terkumpul || 0) < 50000 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-xl mb-4 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-700">
                                    Dana tersedia hanya Rp {data?.total_terkumpul.toLocaleString()}. Pastikan dana mencukupi sebelum menyalurkan.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleAddSalur} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Penerima</label>
                                <input
                                    required
                                    type="text"
                                    value={salurForm.penerima}
                                    onChange={(e) => setSalurForm({ ...salurForm, penerima: e.target.value })}
                                    placeholder="Contoh: Keluarga Pak Ahmad"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Keperluan</label>
                                <select
                                    required
                                    value={salurForm.keperluan}
                                    onChange={(e) => setSalurForm({ ...salurForm, keperluan: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                                >
                                    <option value="">Pilih keperluan...</option>
                                    <option value="Sembako">🍚 Sembako</option>
                                    <option value="Biaya Kesehatan">🏥 Biaya Kesehatan</option>
                                    <option value="Biaya Pendidikan">📚 Biaya Pendidikan</option>
                                    <option value="Perbaikan Rumah">🏠 Perbaikan Rumah</option>
                                    <option value="Bantuan Darurat">🆘 Bantuan Darurat</option>
                                    <option value="Lainnya">📋 Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Jumlah Dana (Rp)</label>
                                <input
                                    required
                                    type="number"
                                    min="1000"
                                    max={data?.total_terkumpul || 0}
                                    value={salurForm.jumlah || ''}
                                    onChange={(e) => setSalurForm({ ...salurForm, jumlah: parseInt(e.target.value) || 0 })}
                                    placeholder="Masukkan nominal"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Maksimal: Rp {data?.total_terkumpul.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Keterangan (Opsional)</label>
                                <textarea
                                    rows={2}
                                    value={salurForm.keterangan}
                                    onChange={(e) => setSalurForm({ ...salurForm, keterangan: e.target.value })}
                                    placeholder="Keterangan tambahan..."
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={salurForm.jumlah > (data?.total_terkumpul || 0)}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Gift className="w-5 h-5" />
                                Salurkan Dana
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
