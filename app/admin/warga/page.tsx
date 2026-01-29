'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Users, Plus, Trash2, Search, Phone, MapPin,
    User, X, Save, FileText, AlertCircle
} from 'lucide-react';
import type { AdminSession, Warga } from '@/types';

export default function KelolaWargaPage() {
    const router = useRouter();
    const [session, setSession] = useState<AdminSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [wargaList, setWargaList] = useState<Warga[]>([]);
    const [quota, setQuota] = useState<{ kuota: number; terpakai: number; tersedia: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        no_kk: '',
        nama_kepala_keluarga: '',
        no_hp: '',
        alamat: ''
    });

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();
            if (!data.success) {
                router.push('/login');
                return;
            }
            setSession(data.data);
            fetchWargaList();
        } catch {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchWargaList = async () => {
        try {
            const res = await fetch('/api/admin/warga');
            const data = await res.json();
            if (data.success) {
                setWargaList(data.data || []);
                setQuota(data.quota);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/warga', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                fetchWargaList();
                resetForm();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Gagal menyimpan data');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus warga ini?')) return;
        try {
            const res = await fetch(`/api/admin/warga?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchWargaList();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setFormData({
            no_kk: '',
            nama_kepala_keluarga: '',
            no_hp: '',
            alamat: ''
        });
    };

    const filteredWarga = wargaList.filter(w =>
        w.nama_kepala_keluarga.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.no_kk.includes(searchQuery) ||
        w.no_hp.includes(searchQuery)
    );

    const activeWarga = filteredWarga.filter(w => w.is_active);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Memuat...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Kelola Warga</h1>
                            <p className="text-emerald-100 text-xs">
                                {session?.rt_info?.nama || 'Data warga terdaftar'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        disabled={quota ? quota.tersedia <= 0 : true}
                        className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-xl font-bold hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4">
                {/* Quota Info */}
                {quota && (
                    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Kuota Warga</h3>
                                    <p className="text-sm text-slate-500">
                                        {quota.terpakai} / {quota.kuota} KK terdaftar
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl font-bold ${quota.tersedia > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {quota.tersedia}
                                </span>
                                <p className="text-xs text-slate-500">Slot tersedia</p>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full ${quota.tersedia > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${(quota.terpakai / quota.kuota) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama, No. KK, atau No. HP..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                {/* Warga List */}
                <div className="space-y-3">
                    {activeWarga.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Belum ada warga terdaftar</p>
                        </div>
                    ) : (
                        activeWarga.map((warga) => (
                            <div key={warga.id} className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <User className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{warga.nama_kepala_keluarga}</h3>
                                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <FileText className="w-3 h-3" />
                                                No. KK: {warga.no_kk}
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {warga.no_hp}
                                            </div>
                                            {warga.alamat && (
                                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {warga.alamat}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(warga.id)}
                                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-900">Tambah Warga</h2>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {quota && quota.tersedia <= 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">Kuota warga sudah penuh!</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">No. KK *</label>
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
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Kepala Keluarga *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nama_kepala_keluarga}
                                    onChange={(e) => setFormData({ ...formData, nama_kepala_keluarga: e.target.value })}
                                    placeholder="Nama lengkap"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">No. HP *</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.no_hp}
                                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Alamat</label>
                                <textarea
                                    rows={2}
                                    value={formData.alamat}
                                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                    placeholder="Alamat rumah"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || (quota ? quota.tersedia <= 0 : true)}
                                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {submitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
