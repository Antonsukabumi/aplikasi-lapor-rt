'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Users, Plus, Edit2, Trash2, Save, X, Search,
    Mail, Phone, Shield, Building2, Eye, EyeOff
} from 'lucide-react';
import type { AdminSession, AdminUser, RtUnit } from '@/types';

export default function KelolaAdminPage() {
    const router = useRouter();
    const [session, setSession] = useState<AdminSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminList, setAdminList] = useState<AdminUser[]>([]);
    const [rtList, setRtList] = useState<RtUnit[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nama: '',
        role: 'ADMIN_RT' as 'SUPER_ADMIN' | 'ADMIN_RT',
        rt_id: '',
        no_hp: ''
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
            fetchData();
        } catch {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            // Fetch admins
            const adminRes = await fetch('/api/super-admin/admins');
            const adminData = await adminRes.json();
            if (adminData.success) {
                setAdminList(adminData.data || []);
            }

            // Fetch RT list for dropdown
            const rtRes = await fetch('/api/super-admin/rt');
            const rtData = await rtRes.json();
            if (rtData.success) {
                setRtList(rtData.data?.filter((rt: RtUnit) => rt.is_active) || []);
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

            // Remove empty password on edit
            if (editId && !formData.password) {
                delete (body as Record<string, unknown>).password;
            }

            const res = await fetch('/api/super-admin/admins', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                fetchData();
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

    const handleEdit = (admin: AdminUser) => {
        setEditId(admin.id);
        setFormData({
            email: admin.email,
            password: '',
            nama: admin.nama,
            role: admin.role,
            rt_id: admin.rt_id || '',
            no_hp: admin.no_hp || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menonaktifkan admin ini?')) return;
        try {
            const res = await fetch(`/api/super-admin/admins?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchData();
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
        setShowPassword(false);
        setFormData({
            email: '',
            password: '',
            nama: '',
            role: 'ADMIN_RT',
            rt_id: '',
            no_hp: ''
        });
    };

    const filteredAdminList = adminList.filter(admin =>
        admin.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                            <h1 className="font-bold text-lg">Kelola Admin</h1>
                            <p className="text-indigo-200 text-xs">Tambah dan kelola admin RT</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Admin
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4">
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari admin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Admin List */}
                <div className="space-y-3">
                    {filteredAdminList.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Belum ada admin</p>
                        </div>
                    ) : (
                        filteredAdminList.map((admin) => (
                            <div key={admin.id} className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${admin.role === 'SUPER_ADMIN' ? 'bg-purple-100' : 'bg-indigo-100'}`}>
                                            <span className={`text-xl font-bold ${admin.role === 'SUPER_ADMIN' ? 'text-purple-600' : 'text-indigo-600'}`}>
                                                {admin.nama.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{admin.nama}</h3>
                                            <div className="text-sm text-slate-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {admin.email}
                                            </div>
                                            {admin.no_hp && (
                                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {admin.no_hp}
                                                </div>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {admin.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '👤 Admin RT'}
                                                </span>
                                                {admin.rt_unit && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                                        {admin.rt_unit.nama}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${admin.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {admin.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(admin)}
                                            className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-600" />
                                        </button>
                                        {admin.is_active && admin.id !== session?.id && (
                                            <button
                                                onClick={() => handleDelete(admin.id)}
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
                                {editId ? 'Edit Admin' : 'Tambah Admin Baru'}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Lengkap *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Nama admin"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Email *</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@lapor.rt"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">
                                    Password {editId ? '(kosongkan jika tidak ingin mengubah)' : '*'}
                                </label>
                                <div className="relative">
                                    <input
                                        required={!editId}
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full p-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'SUPER_ADMIN' | 'ADMIN_RT' })}
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="ADMIN_RT">👤 Admin RT</option>
                                    <option value="SUPER_ADMIN">👑 Super Admin</option>
                                </select>
                            </div>

                            {formData.role === 'ADMIN_RT' && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Assign ke RT *</label>
                                    <select
                                        required
                                        value={formData.rt_id}
                                        onChange={(e) => setFormData({ ...formData, rt_id: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Pilih RT...</option>
                                        {rtList.map((rt) => (
                                            <option key={rt.id} value={rt.id}>{rt.nama}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">No. HP</label>
                                <input
                                    type="tel"
                                    value={formData.no_hp}
                                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                                    placeholder="081234567890"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {submitting ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Tambah Admin')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
