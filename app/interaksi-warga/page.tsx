'use client';

import { useState } from "react";
import { ArrowLeft, HandHeart, Users, Plus, MessageCircle, Clock, MapPin, Check, X } from "lucide-react";
import Link from "next/link";

type TabType = 'minta' | 'tawarkan' | 'aktif';
type TipeRequest = 'MINTA' | 'TAWARKAN';

interface GotongRoyongItem {
    id: number;
    tipe: TipeRequest;
    kategori: string;
    deskripsi: string;
    lokasi: string;
    waktu: string;
    status: 'AKTIF' | 'DIPROSES' | 'SELESAI';
    nama: string;
    noHp: string;
}

const KATEGORI = [
    { id: 'antar-jemput', label: '🚗 Antar/Jemput', desc: 'Anak sekolah, belanja, dll' },
    { id: 'belanja', label: '🛒 Belanja', desc: 'Belanja kebutuhan' },
    { id: 'kesehatan', label: '🏥 Kesehatan', desc: 'Antar ke dokter/RS' },
    { id: 'perbaikan', label: '🔧 Perbaikan', desc: 'Rumah, listrik, dll' },
    { id: 'lainnya', label: '📋 Lainnya', desc: 'Bantuan lainnya' },
];

const MOCK_DATA: GotongRoyongItem[] = [
    { id: 1, tipe: 'MINTA', kategori: '🚗 Antar/Jemput', deskripsi: 'Butuh bantuan antar anak ke sekolah jam 6 pagi', lokasi: 'Blok A2', waktu: '2 jam lalu', status: 'AKTIF', nama: 'Ibu Sari', noHp: '081234567890' },
    { id: 2, tipe: 'TAWARKAN', kategori: '🛒 Belanja', deskripsi: 'Saya mau ke pasar, ada yang mau nitip?', lokasi: 'Blok C1', waktu: '1 jam lalu', status: 'AKTIF', nama: 'Pak Budi', noHp: '081234567891' },
    { id: 3, tipe: 'MINTA', kategori: '🏥 Kesehatan', deskripsi: 'Butuh teman antar ke Puskesmas besok', lokasi: 'Blok B3', waktu: '3 jam lalu', status: 'DIPROSES', nama: 'Mbah Siti', noHp: '081234567892' },
];

export default function GotongRoyongPage() {
    const [activeTab, setActiveTab] = useState<TabType>('aktif');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tipe: 'MINTA' as TipeRequest,
        kategori: '',
        deskripsi: '',
        lokasi: '',
        nama: '',
        noHp: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('✅ Permintaan berhasil dikirim! Warga lain akan bisa melihat dan menghubungi Anda via WhatsApp.');
        setShowForm(false);
        setFormData({ tipe: 'MINTA', kategori: '', deskripsi: '', lokasi: '', nama: '', noHp: '' });
    };

    return (
        <main className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-purple-600 to-purple-800 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <HandHeart className="w-6 h-6 text-white" />
                        <span className="font-bold text-lg text-white">Interaksi Warga</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="p-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5 text-purple-600" />
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 flex gap-2">
                {[
                    { id: 'aktif', label: 'Semua', icon: Users },
                    { id: 'minta', label: 'Butuh Bantuan', icon: HandHeart },
                    { id: 'tawarkan', label: 'Menawarkan', icon: Check },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex-1 py-2 px-2 rounded-t-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${activeTab === tab.id
                                ? 'bg-white text-purple-700'
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
                <div className="space-y-3">
                    {MOCK_DATA
                        .filter(item => {
                            if (activeTab === 'minta') return item.tipe === 'MINTA';
                            if (activeTab === 'tawarkan') return item.tipe === 'TAWARKAN';
                            return true;
                        })
                        .map((item) => (
                            <div key={item.id} className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-start justify-between mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.tipe === 'MINTA'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}>
                                        {item.tipe === 'MINTA' ? '🙏 Butuh Bantuan' : '💪 Menawarkan'}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'AKTIF' ? 'bg-blue-100 text-blue-700' :
                                        item.status === 'DIPROSES' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>

                                <div className="text-sm font-medium text-purple-600 mb-1">{item.kategori}</div>
                                <p className="text-slate-700 mb-2">{item.deskripsi}</p>

                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {item.lokasi}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {item.waktu}
                                    </span>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <a
                                        href={`https://wa.me/${item.noHp.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${item.nama}, saya dari Lapor RT.\n\nSaya melihat post Anda di Interaksi Warga:\n"${item.deskripsi}"\n\nApakah masih tersedia?`)}`}
                                        target="_blank"
                                        className="flex-1 bg-green-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                                    >
                                        <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </a>
                                    {item.tipe === 'MINTA' && (
                                        <a
                                            href={`https://wa.me/${item.noHp.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${item.nama}, saya mau bantu:\n"${item.deskripsi}"\n\nSaya bisa membantu Anda. Kapan bisa dikoordinasikan?`)}`}
                                            target="_blank"
                                            className="flex-1 border-2 border-purple-600 text-purple-600 text-sm font-bold py-2 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-1"
                                        >
                                            <HandHeart className="w-4 h-4" /> Bantu
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-slate-800">Buat Permintaan</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, tipe: 'MINTA' })}
                                    className={`flex-1 py-3 rounded-xl font-bold ${formData.tipe === 'MINTA'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    🙏 Minta Bantuan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, tipe: 'TAWARKAN' })}
                                    className={`flex-1 py-3 rounded-xl font-bold ${formData.tipe === 'TAWARKAN'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    💪 Tawarkan Bantuan
                                </button>
                            </div>

                            <select
                                required
                                value={formData.kategori}
                                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                            >
                                <option value="">Pilih kategori...</option>
                                {KATEGORI.map(k => (
                                    <option key={k.id} value={k.label}>{k.label} - {k.desc}</option>
                                ))}
                            </select>

                            <textarea
                                required
                                rows={3}
                                value={formData.deskripsi}
                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                placeholder="Jelaskan kebutuhan/penawaran Anda..."
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                            />

                            <input
                                required
                                type="text"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                placeholder="Nama Anda"
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                            />

                            <input
                                required
                                type="tel"
                                value={formData.noHp}
                                onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                                placeholder="Nomor WhatsApp (contoh: 081234567890)"
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                            />

                            <input
                                required
                                type="text"
                                value={formData.lokasi}
                                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                                placeholder="Lokasi (Blok/Alamat)"
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                            />

                            <button
                                type="submit"
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700"
                            >
                                Kirim
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
