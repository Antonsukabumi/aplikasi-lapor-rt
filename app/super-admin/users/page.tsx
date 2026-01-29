'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Users, Search, CheckCircle, XCircle, Shield
} from 'lucide-react';
import type { AdminUser } from '@/types';

export default function KelolaAdminPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/super-admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/super-admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers(); // Refresh list
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('Gagal update status');
        }
    };

    const filteredUsers = users.filter(u =>
        u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.rt_unit?.nama.toLowerCase().includes(searchQuery.toLowerCase())
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
                            <p className="text-indigo-200 text-xs">Setujui atau nonaktifkan admin RT</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4">
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama, email, atau RT..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Users List */}
                <div className="space-y-3">
                    {filteredUsers.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Tidak ada admin ditemukan</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500' : 'bg-indigo-500'}`}>
                                        {user.nama.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            {user.nama}
                                            {user.role === 'SUPER_ADMIN' && (
                                                <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> Super Admin
                                                </span>
                                            )}
                                        </h3>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                        {user.rt_unit && (
                                            <div className="text-xs text-slate-400 mt-1">
                                                Mengelola: <span className="font-semibold text-slate-600">{user.rt_unit.nama}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {user.role !== 'SUPER_ADMIN' && (
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {user.is_active ? 'Aktif' : 'Menunggu'}
                                        </div>
                                        <button
                                            onClick={() => toggleStatus(user.id, user.is_active)}
                                            className={`p-2 rounded-lg transition-colors ${user.is_active
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                            title={user.is_active ? "Nonaktifkan" : "Setujui"}
                                        >
                                            {user.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
