'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Building2, Plus, Edit2, Trash2, Save, X, Search,
    MapPin, Check, AlertCircle
} from 'lucide-react';
import type { AdminSession, RtUnit } from '@/types';

export default function KelolaRtPage() {
    const router = useRouter();
    const [session, setSession] = useState<AdminSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [rtList, setRtList] = useState<RtUnit[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nomor_rt: '',
        nomor_rw: '',
        kelurahan: '',
        kecamatan: '',
        kota: '',
        kuota_kk: 100
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();
            if (!data.success || data.data.role !== 'SUPER_ADMIN') {
                router.push('/login');
                return;
            }
            setSession(data.data);
            fetchRtList();
        } catch {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchRtList = async () => {
        try {
            const res = await fetch('/api/super-admin/rt');
            const data = await res.json();
            if (data.success) {
                setRtList(data.data || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { id: editId, ...formData } : formData;

            const res = await fetch('/api/super-admin/rt', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                fetchRtList();
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

    const handleEdit = (rt: RtUnit) => {
        setEditId(rt.id);
        setFormData({
            nomor_rt: rt.nomor_rt,
            nomor_rw: rt.nomor_rw,
            kelurahan: rt.kelurahan || '',
            kecamatan: rt.kecamatan || '',
            kota: rt.kota || '',
            kuota_kk: rt.kuota_kk || 100
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menonaktifkan RT ini?')) return;
        try {
            const res = await fetch(`/api/super-admin/rt?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchRtList();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditId(null);
        setFormData({
            nomor_rt: '',
            nomor_rw: '',
            kelurahan: '',
            kecamatan: '',
            kota: '',
            kuota_kk: 100
        });
    };

    const filteredRtList = rtList.filter(rt =>
        rt.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rt.kelurahan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rt.kecamatan?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/super-admin" className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Kelola RT</h1>
                            <p className="text-indigo-200 text-xs">Tambah dan kelola unit RT/RW</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah RT
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4">
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari RT..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* RT List */}
                <div className="space-y-3">
                    {filteredRtList.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center text-slate-400">
                            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Belum ada RT terdaftar</p>
                        </div>
                    ) : (
                        filteredRtList.map((rt) => (
                            <div key={rt.id} className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Building2 className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{rt.nama}</h3>
                                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {[rt.kelurahan, rt.kecamatan, rt.kota].filter(Boolean).join(', ') || 'Alamat belum diisi'}
                                            </div>
                                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${rt.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {rt.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(rt)}
                                            className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-600" />
                                        </button>
                                        {rt.is_active && (
                                            <button
                                                onClick={() => handleDelete(rt.id)}
                                                className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        )}
                                    </div>
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
                            <h2 className="font-bold text-lg text-slate-900">
                                {editId ? 'Edit RT' : 'Tambah RT Baru'}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Nomor RT *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.nomor_rt}
                                        onChange={(e) => setFormData({ ...formData, nomor_rt: e.target.value })}
                                        placeholder="05"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Nomor RW *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.nomor_rw}
                                        onChange={(e) => setFormData({ ...formData, nomor_rw: e.target.value })}
                                        placeholder="03"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Kelurahan</label>
                                <input
                                    type="text"
                                    value={formData.kelurahan}
                                    onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                                    placeholder="Kelurahan Digital"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Kecamatan</label>
                                    <input
                                        type="text"
                                        value={formData.kecamatan}
                                        onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                                        placeholder="Kecamatan Maju"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Kota</label>
                                    <input
                                        type="text"
                                        value={formData.kota}
                                        onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                                        placeholder="Kota Harapan"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Kuota KK (Jumlah Warga Maksimal)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.kuota_kk}
                                    onChange={(e) => setFormData({ ...formData, kuota_kk: parseInt(e.target.value) || 100 })}
                                    placeholder="100"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Batasi jumlah KK yang bisa mendaftar di RT ini</p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {submitting ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Tambah RT')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
