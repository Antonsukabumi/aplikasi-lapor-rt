'use client';

import { useState, useEffect } from "react";
import {
    ArrowLeft, Recycle, Save, Plus, Edit2, Trash2, X, DollarSign, Award, Package
} from "lucide-react";
import Link from "next/link";

interface JenisSampah {
    id: string;
    nama: string;
    harga: number;
    poin: number;
    icon: string;
    aktif: boolean;
}

const ICON_OPTIONS = ['🧴', '📦', '🥫', '🍾', '🍼', '🛢️', '📱', '👕', '🔋', '💡', '📰', '♻️'];

export default function HargaSampahPage() {
    const [isLogin, setIsLogin] = useState(false);
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [jenisList, setJenisList] = useState<JenisSampah[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nama: '',
        harga: 0,
        poin: 0,
        icon: '♻️'
    });

    const fetchJenis = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bank-sampah/jenis');
            const data = await res.json();
            if (data.success) {
                setJenisList(data.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLogin) {
            fetchJenis();
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

            const res = await fetch('/api/bank-sampah/jenis', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchJenis();
                resetForm();
            }
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    const handleEdit = (jenis: JenisSampah) => {
        setEditId(jenis.id);
        setFormData({
            nama: jenis.nama,
            harga: jenis.harga,
            poin: jenis.poin,
            icon: jenis.icon
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus jenis sampah ini?')) return;

        try {
            const res = await fetch(`/api/bank-sampah/jenis?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchJenis();
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditId(null);
        setFormData({ nama: '', harga: 0, poin: 0, icon: '♻️' });
    };

    // Login page
    if (!isLogin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-6">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1 text-slate-900">Kelola Harga Sampah</h1>
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
                    <Link href="/admin/bank-sampah" className="block mt-4 text-sm text-slate-400 hover:text-slate-600">
                        ← Kembali ke Setting Bank Sampah
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
                        <Link href="/admin/bank-sampah" className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Kelola Harga Sampah</h1>
                            <p className="text-green-200 text-xs">Tambah/Edit jenis & harga</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="p-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                        <Plus className="w-5 h-5 text-green-600" />
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-2xl mx-auto p-4">
                {/* Info */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl mb-6">
                    <p className="text-sm text-blue-700">
                        💡 Harga yang Anda set akan tampil di halaman <strong>Bank Sampah</strong> untuk warga.
                    </p>
                </div>

                {/* Jenis List */}
                {loading ? (
                    <div className="text-center py-8 text-slate-400">Memuat...</div>
                ) : jenisList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada jenis sampah</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                        >
                            + Tambah Jenis
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jenisList.map((jenis) => (
                            <div key={jenis.id} className="bg-white p-4 rounded-xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl">{jenis.icon}</span>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800">{jenis.nama}</div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-green-600 font-bold flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                Rp {jenis.harga.toLocaleString()}/kg
                                            </span>
                                            <span className="text-yellow-600 font-medium flex items-center gap-1">
                                                <Award className="w-4 h-4" />
                                                {jenis.poin} poin/kg
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(jenis)}
                                            className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(jenis.id)}
                                            className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
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
                                {editId ? 'Edit Jenis Sampah' : 'Tambah Jenis Baru'}
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
                                                    ? 'border-green-500 bg-green-50'
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
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Jenis Sampah</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Contoh: Plastik Bersih"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Harga & Poin */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        <DollarSign className="w-3 h-3 inline" /> Harga per kg (Rp)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.harga}
                                        onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        <Award className="w-3 h-3 inline" /> Poin per kg
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.poin}
                                        onChange={(e) => setFormData({ ...formData, poin: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {editId ? 'Simpan Perubahan' : 'Tambah Jenis'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
