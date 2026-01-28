'use client';

import { useState, useEffect } from "react";
import {
    ArrowLeft, Phone, Plus, Edit2, Trash2, Save, X, Check,
    ShieldAlert, AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface KontakDarurat {
    id: string;
    nama: string;
    nomor: string;
    kategori: 'MEDIS' | 'KEAMANAN' | 'DARURAT' | 'UTILITAS' | 'RT';
    icon: string;
    aktif: boolean;
}

const KATEGORI_OPTIONS = [
    { value: 'MEDIS', label: '🏥 Medis' },
    { value: 'KEAMANAN', label: '👮 Keamanan' },
    { value: 'DARURAT', label: '🚨 Darurat' },
    { value: 'UTILITAS', label: '⚡ Utilitas' },
    { value: 'RT', label: '👨‍💼 RT/RW' },
];

const ICON_OPTIONS = ['🚑', '👮', '🚒', '🆘', '⚡', '💧', '🏥', '👨‍💼', '👮‍♂️', '📞', '🏛️'];

export default function KelolaNomorDarurat() {
    const [isLogin, setIsLogin] = useState(false);
    const [pin, setPin] = useState("");
    const [kontakList, setKontakList] = useState<KontakDarurat[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nama: '',
        nomor: '',
        kategori: 'MEDIS' as KontakDarurat['kategori'],
        icon: '📞'
    });

    const fetchKontak = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kontak-darurat');
            const data = await res.json();
            if (data.success) {
                setKontakList(data.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLogin) {
            fetchKontak();
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

        try {
            const method = editId ? 'PUT' : 'POST';
            const body = editId
                ? { id: editId, ...formData }
                : formData;

            const res = await fetch('/api/kontak-darurat', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchKontak();
                resetForm();
            }
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    const handleEdit = (kontak: KontakDarurat) => {
        setEditId(kontak.id);
        setFormData({
            nama: kontak.nama,
            nomor: kontak.nomor,
            kategori: kontak.kategori,
            icon: kontak.icon
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus kontak ini?')) return;

        try {
            const res = await fetch(`/api/kontak-darurat?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchKontak();
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditId(null);
        setFormData({ nama: '', nomor: '', kategori: 'MEDIS', icon: '📞' });
    };

    // Login page
    if (!isLogin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1 text-slate-900">Kelola Nomor Darurat</h1>
                    <p className="text-sm text-slate-500 mb-6">Masukkan PIN Admin</p>
                    <input
                        autoFocus
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full text-center text-3xl tracking-[0.5em] font-bold p-4 border-2 border-slate-200 rounded-xl mb-4 focus:border-red-500 outline-none"
                        placeholder="••••"
                        maxLength={4}
                    />
                    <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700">
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
            <header className="bg-red-600 text-white p-4 shadow-lg">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Kelola Nomor Darurat</h1>
                            <p className="text-red-200 text-xs">Tambah/Edit kontak darurat</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="p-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                        <Plus className="w-5 h-5 text-red-600" />
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-2xl mx-auto p-4">
                {/* Info Box */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl mb-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <div className="font-bold text-amber-800 mb-1">Cara Mengelola Nomor</div>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>• Klik <strong>+</strong> untuk tambah kontak baru</li>
                                <li>• Klik ikon <strong>Edit</strong> untuk ubah nomor</li>
                                <li>• Nomor akan tampil di halaman <strong>/darurat</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Kontak List */}
                {loading ? (
                    <div className="text-center py-8 text-slate-400">Memuat...</div>
                ) : (
                    <div className="space-y-3">
                        {kontakList.map((kontak) => (
                            <div key={kontak.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                                <div className="text-3xl">{kontak.icon}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800">{kontak.nama}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                        <Phone className="w-3 h-3" />
                                        <a href={`tel:${kontak.nomor}`} className="text-blue-600 hover:underline">{kontak.nomor}</a>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${kontak.kategori === 'MEDIS' ? 'bg-green-100 text-green-700' :
                                            kontak.kategori === 'KEAMANAN' ? 'bg-blue-100 text-blue-700' :
                                                kontak.kategori === 'DARURAT' ? 'bg-red-100 text-red-700' :
                                                    kontak.kategori === 'UTILITAS' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-slate-100 text-slate-700'
                                        }`}>
                                        {kontak.kategori}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(kontak)}
                                        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                                    >
                                        <Edit2 className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(kontak.id)}
                                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white w-full max-w-lg rounded-t-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-slate-900">
                                {editId ? 'Edit Kontak' : 'Tambah Kontak Baru'}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Icon Selector */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Icon</label>
                                <div className="flex gap-2 flex-wrap">
                                    {ICON_OPTIONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon })}
                                            className={`text-2xl p-2 rounded-lg border-2 transition-colors ${formData.icon === icon
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-transparent hover:bg-slate-100'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nama */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Kontak</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Contoh: Puskesmas Kecamatan"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Nomor */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Nomor Telepon</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.nomor}
                                    onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                                    placeholder="Contoh: 081234567890"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Kategori */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Kategori</label>
                                <select
                                    value={formData.kategori}
                                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as KontakDarurat['kategori'] })}
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    {KATEGORI_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {editId ? 'Simpan Perubahan' : 'Tambah Kontak'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
