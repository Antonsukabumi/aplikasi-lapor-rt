'use client';

import { useState } from "react";
import { ArrowLeft, MessageSquare, Plus, Clock, User, MessageCircle, ThumbsUp, X, Pin } from "lucide-react";
import Link from "next/link";

interface ForumTopik {
    id: number;
    judul: string;
    isi: string;
    kategori: string;
    nama: string;
    waktu: string;
    komentar: number;
    likes: number;
    isPinned: boolean;
}

const KATEGORI_FORUM = [
    { id: 'umum', label: '💬 Umum', color: 'bg-slate-100 text-slate-700' },
    { id: 'keamanan', label: '🔒 Keamanan', color: 'bg-red-100 text-red-700' },
    { id: 'kebersihan', label: '🧹 Kebersihan', color: 'bg-green-100 text-green-700' },
    { id: 'fasilitas', label: '🏗️ Fasilitas', color: 'bg-blue-100 text-blue-700' },
    { id: 'usulan', label: '💡 Usulan', color: 'bg-yellow-100 text-yellow-700' },
];

const MOCK_TOPIK: ForumTopik[] = [
    { id: 1, judul: 'Parkir liar di depan gang', isi: 'Sering ada mobil parkir sembarangan di depan gang, menghalangi jalan. Bagaimana solusinya?', kategori: '🔒 Keamanan', nama: 'Pak Budi', waktu: '2 jam lalu', komentar: 5, likes: 12, isPinned: true },
    { id: 2, judul: 'Jadwal kerja bakti bulan ini', isi: 'Kapan jadwal kerja bakti bulan Maret? Mohon infonya.', kategori: '🧹 Kebersihan', nama: 'Ibu Wati', waktu: '5 jam lalu', komentar: 3, likes: 8, isPinned: false },
    { id: 3, judul: 'Usulan: Lampu jalan di Blok D', isi: 'Blok D masih gelap di malam hari. Apakah bisa diusulkan pemasangan lampu jalan?', kategori: '💡 Usulan', nama: 'Mas Andi', waktu: '1 hari lalu', komentar: 7, likes: 15, isPinned: false },
    { id: 4, judul: 'Anjing lepas berkeliaran', isi: 'Ada beberapa anjing yang sering lepas dan berkeliaran. Mohon pemilik lebih memperhatikan.', kategori: '💬 Umum', nama: 'Ibu Sari', waktu: '2 hari lalu', komentar: 2, likes: 4, isPinned: false },
];

export default function ForumPage() {
    const [showForm, setShowForm] = useState(false);
    const [selectedKategori, setSelectedKategori] = useState<string>('all');
    const [formData, setFormData] = useState({
        judul: '',
        isi: '',
        kategori: ''
    });

    const filteredTopik = MOCK_TOPIK
        .filter(t => selectedKategori === 'all' || t.kategori.includes(selectedKategori))
        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('✅ Topik berhasil dibuat!');
        setShowForm(false);
        setFormData({ judul: '', isi: '', kategori: '' });
    };

    return (
        <main className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-indigo-600 to-indigo-800 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-white" />
                        <span className="font-bold text-lg text-white">Forum Diskusi</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="p-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5 text-indigo-600" />
                </button>
            </div>

            {/* Kategori Filter */}
            <div className="px-4 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setSelectedKategori('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${selectedKategori === 'all' ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
                        }`}
                >
                    Semua
                </button>
                {KATEGORI_FORUM.map(k => (
                    <button
                        key={k.id}
                        onClick={() => setSelectedKategori(k.label.split(' ')[1])}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${selectedKategori === k.label.split(' ')[1] ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
                            }`}
                    >
                        {k.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-t-3xl p-6 overflow-y-auto">
                <div className="space-y-3">
                    {filteredTopik.map((topik) => (
                        <div key={topik.id} className={`p-4 rounded-xl ${topik.isPinned ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-slate-50'}`}>
                            {topik.isPinned && (
                                <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold mb-2">
                                    <Pin className="w-3 h-3" /> Disematkan
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${KATEGORI_FORUM.find(k => topik.kategori.includes(k.label.split(' ')[1]))?.color || 'bg-slate-100'
                                    }`}>
                                    {topik.kategori}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-800 mb-1">{topik.judul}</h3>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{topik.isi}</p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" /> {topik.nama}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {topik.waktu}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1 text-slate-500">
                                        <MessageCircle className="w-4 h-4" /> {topik.komentar}
                                    </span>
                                    <span className="flex items-center gap-1 text-indigo-600">
                                        <ThumbsUp className="w-4 h-4" /> {topik.likes}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-slate-800">Buat Topik Baru</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <select
                                required
                                value={formData.kategori}
                                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                            >
                                <option value="">Pilih kategori...</option>
                                {KATEGORI_FORUM.map(k => (
                                    <option key={k.id} value={k.label}>{k.label}</option>
                                ))}
                            </select>

                            <input
                                required
                                type="text"
                                value={formData.judul}
                                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                placeholder="Judul topik..."
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                            />

                            <textarea
                                required
                                rows={4}
                                value={formData.isi}
                                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                                placeholder="Tulis isi diskusi Anda..."
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                            />

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700"
                            >
                                Buat Topik
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
