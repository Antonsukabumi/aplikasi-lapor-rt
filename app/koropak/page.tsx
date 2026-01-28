'use client';

import { useState, useEffect } from "react";
import {
    ArrowLeft, PiggyBank, Users, TrendingUp, Heart, Gift,
    Calendar, ChevronRight, Wallet, History, Target, HandHeart
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

export default function KoropakPage() {
    const [activeTab, setActiveTab] = useState<'info' | 'donatur' | 'penyaluran'>('info');
    const [data, setData] = useState<KoropakData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [donateForm, setDonateForm] = useState({
        nama: '',
        jumlahHari: 1
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/koropak');
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error('Error fetching koropak data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault();
        const total = donateForm.jumlahHari * (data?.iuran_harian || 500);
        alert(`✅ Terima kasih ${donateForm.nama}!\n\nAnda berkomitmen iuran ${donateForm.jumlahHari} hari = Rp ${total.toLocaleString()}\n\nSilakan transfer ke:\nBank BRI\n1234-5678-9012\na.n. Kas RT 05\n\nAtau setor tunai ke Bendahara RT.`);
        setShowDonateModal(false);
        setDonateForm({ nama: '', jumlahHari: 1 });
    };

    const progressPercent = data ? (data.total_terkumpul / data.target_bulanan) * 100 : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50">
                <div className="text-amber-600 font-semibold">Memuat...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-amber-500 to-orange-600 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <PiggyBank className="w-6 h-6 text-white" />
                        <span className="font-bold text-lg text-white">Koropak</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowDonateModal(true)}
                    className="px-4 py-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform font-bold text-amber-600 text-sm"
                >
                    + Iuran
                </button>
            </div>

            {/* Hero Stats */}
            <div className="px-4 pb-6">
                <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-white">
                    <div className="text-center mb-4">
                        <div className="text-sm opacity-80">Dana Terkumpul {data?.bulan_aktif}</div>
                        <div className="text-4xl font-bold mt-1">
                            Rp {data?.total_terkumpul.toLocaleString()}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>Target: Rp {data?.target_bulanan.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />
                        </div>
                        <div className="text-right text-xs mt-1">{progressPercent.toFixed(0)}%</div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="bg-white/20 rounded-xl p-2 text-center">
                            <Users className="w-5 h-5 mx-auto mb-1" />
                            <div className="text-lg font-bold">{data?.total_donatur}</div>
                            <div className="text-xs opacity-80">Donatur</div>
                        </div>
                        <div className="bg-white/20 rounded-xl p-2 text-center">
                            <Wallet className="w-5 h-5 mx-auto mb-1" />
                            <div className="text-lg font-bold">Rp {data?.iuran_harian}</div>
                            <div className="text-xs opacity-80">Per Hari</div>
                        </div>
                        <div className="bg-white/20 rounded-xl p-2 text-center">
                            <Heart className="w-5 h-5 mx-auto mb-1" />
                            <div className="text-lg font-bold">{data?.riwayat_penyaluran.length}</div>
                            <div className="text-xs opacity-80">Tersalurkan</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 flex gap-2">
                {[
                    { id: 'info', label: 'Info', icon: PiggyBank },
                    { id: 'donatur', label: 'Donatur', icon: Users },
                    { id: 'penyaluran', label: 'Penyaluran', icon: Gift },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex-1 py-2 px-2 rounded-t-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-amber-700'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-t-3xl p-6 overflow-y-auto">
                {/* Tab: Info */}
                {activeTab === 'info' && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl">
                            <h3 className="font-bold text-amber-800 mb-2">🏺 Apa itu Koropak?</h3>
                            <p className="text-sm text-amber-700">
                                <strong>Koropak</strong> adalah program iuran harian warga sebesar <strong>Rp 500/hari</strong> yang dikumpulkan untuk dana sosial RT.
                                Dana ini digunakan untuk membantu warga yang membutuhkan, seperti:
                            </p>
                            <ul className="text-sm text-amber-700 mt-2 space-y-1">
                                <li>• 🍚 Bantuan sembako untuk keluarga kurang mampu</li>
                                <li>• 🏥 Bantuan biaya kesehatan darurat</li>
                                <li>• 📚 Bantuan pendidikan anak yatim</li>
                                <li>• 🏠 Bantuan perbaikan rumah tidak layak huni</li>
                            </ul>
                        </div>

                        <div className="bg-green-50 p-4 rounded-xl">
                            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Cara Iuran
                            </h3>
                            <div className="space-y-2 text-sm text-green-700">
                                <p><strong>1.</strong> Klik tombol <strong>"+ Iuran"</strong> di atas</p>
                                <p><strong>2.</strong> Pilih jumlah hari iuran (min. 1 hari)</p>
                                <p><strong>3.</strong> Transfer atau setor tunai ke Bendahara RT</p>
                                <p><strong>4.</strong> Dana akan tercatat di sistem</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl">
                            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <HandHeart className="w-5 h-5" />
                                Transparansi Dana
                            </h3>
                            <p className="text-sm text-blue-700">
                                Seluruh dana yang terkumpul dan tersalurkan dapat dilihat di aplikasi ini.
                                Laporan keuangan juga akan diumumkan setiap akhir bulan di Forum Warga.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tab: Donatur */}
                {activeTab === 'donatur' && (
                    <div>
                        <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-amber-600" />
                            Top Donatur Bulan Ini
                        </h2>
                        <div className="space-y-3">
                            {data?.donatur.map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-slate-400'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{d.nama}</div>
                                            <div className="text-xs text-slate-500">{d.total_hari} hari iuran</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-amber-600">Rp {d.total_nominal.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab: Penyaluran */}
                {activeTab === 'penyaluran' && (
                    <div>
                        <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-amber-600" />
                            Riwayat Penyaluran Dana
                        </h2>
                        <div className="space-y-3">
                            {data?.riwayat_penyaluran.map((r) => (
                                <div key={r.id} className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-slate-800">{r.penerima}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(r.tanggal).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                                                {r.keperluan}
                                            </span>
                                            <div className="font-bold text-green-600 mt-1">
                                                Rp {r.jumlah.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600">{r.keterangan}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Donate Modal */}
            {showDonateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <PiggyBank className="w-5 h-5 text-amber-600" />
                                Iuran Koropak
                            </h2>
                            <button
                                onClick={() => setShowDonateModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleDonate} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Anda</label>
                                <input
                                    required
                                    type="text"
                                    value={donateForm.nama}
                                    onChange={(e) => setDonateForm({ ...donateForm, nama: e.target.value })}
                                    placeholder="Masukkan nama Anda"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">
                                    Jumlah Hari Iuran
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 7, 14, 30].map((hari) => (
                                        <button
                                            key={hari}
                                            type="button"
                                            onClick={() => setDonateForm({ ...donateForm, jumlahHari: hari })}
                                            className={`py-3 rounded-xl font-bold text-sm transition-colors ${donateForm.jumlahHari === hari
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
                                        Rp {(donateForm.jumlahHari * (data?.iuran_harian || 500)).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {donateForm.jumlahHari} hari × Rp {data?.iuran_harian}/hari
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 flex items-center justify-center gap-2"
                            >
                                <Heart className="w-5 h-5" />
                                Konfirmasi Iuran
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
