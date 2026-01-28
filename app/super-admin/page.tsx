'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Home, Users, FileText, Building2, Shield, LogOut, Menu, X,
    Plus, Settings, TrendingUp, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import type { AdminSession, RtUnit, AdminUser } from '@/types';

interface DashboardStats {
    totalRt: number;
    totalAdmin: number;
    totalLaporan: number;
    laporanBaru: number;
}

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<AdminSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        totalRt: 0,
        totalAdmin: 0,
        totalLaporan: 0,
        laporanBaru: 0
    });
    const [rtList, setRtList] = useState<RtUnit[]>([]);
    const [adminList, setAdminList] = useState<AdminUser[]>([]);

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
        } catch (err) {
            console.error('Session error:', err);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            // Fetch RT units
            const rtRes = await fetch('/api/super-admin/rt');
            const rtData = await rtRes.json();
            if (rtData.success) {
                setRtList(rtData.data || []);
            }

            // Fetch admins
            const adminRes = await fetch('/api/super-admin/admins');
            const adminData = await adminRes.json();
            if (adminData.success) {
                setAdminList(adminData.data || []);
            }

            // Calculate stats
            setStats({
                totalRt: rtData.data?.length || 0,
                totalAdmin: adminData.data?.length || 0,
                totalLaporan: 0, // TODO: fetch from API
                laporanBaru: 0
            });
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Memuat...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white transform transition-transform lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-indigo-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold">Super Admin</h1>
                            <p className="text-indigo-300 text-xs">Lapor Pak RT</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    <Link href="/super-admin" className="bg-indigo-800 px-4 py-3 rounded-xl flex items-center gap-3">
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link href="/super-admin/rt" className="px-4 py-3 rounded-xl flex items-center gap-3 text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors">
                        <Building2 className="w-5 h-5" />
                        <span>Kelola RT</span>
                        <span className="ml-auto bg-indigo-700 text-xs px-2 py-0.5 rounded-full">{stats.totalRt}</span>
                    </Link>

                    <Link href="/super-admin/admins" className="px-4 py-3 rounded-xl flex items-center gap-3 text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors">
                        <Users className="w-5 h-5" />
                        <span>Kelola Admin</span>
                        <span className="ml-auto bg-indigo-700 text-xs px-2 py-0.5 rounded-full">{stats.totalAdmin}</span>
                    </Link>

                    <Link href="/super-admin/laporan" className="px-4 py-3 rounded-xl flex items-center gap-3 text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                        <span>Semua Laporan</span>
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-medium">{session?.nama}</div>
                            <div className="text-xs text-indigo-300">{session?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 rounded-lg bg-indigo-800 text-indigo-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                {/* Header */}
                <header className="bg-white border-b sticky top-0 z-30">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="font-bold text-slate-900">Super Admin Dashboard</h1>
                                <p className="text-xs text-slate-500">Kelola semua RT dalam satu tempat</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500">
                            <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                <Building2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Total RT</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{stats.totalRt}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                            <div className="flex items-center gap-2 text-green-600 mb-1">
                                <Users className="w-5 h-5" />
                                <span className="text-sm font-medium">Total Admin</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{stats.totalAdmin}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500">
                            <div className="flex items-center gap-2 text-amber-600 mb-1">
                                <FileText className="w-5 h-5" />
                                <span className="text-sm font-medium">Total Laporan</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{stats.totalLaporan}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                            <div className="flex items-center gap-2 text-red-600 mb-1">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Laporan Baru</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{stats.laporanBaru}</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* RT List */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-indigo-500" />
                                    Daftar RT
                                </h2>
                                <Link
                                    href="/super-admin/rt"
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Lihat Semua →
                                </Link>
                            </div>
                            {rtList.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada RT terdaftar</p>
                                    <Link
                                        href="/super-admin/rt"
                                        className="inline-flex items-center gap-1 mt-2 text-indigo-600 hover:underline"
                                    >
                                        <Plus className="w-4 h-4" /> Tambah RT
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {rtList.slice(0, 5).map((rt) => (
                                        <div key={rt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-slate-800">{rt.nama}</div>
                                                <div className="text-xs text-slate-500">{rt.kelurahan}, {rt.kecamatan}</div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${rt.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {rt.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Admin List */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-green-500" />
                                    Admin RT
                                </h2>
                                <Link
                                    href="/super-admin/admins"
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Lihat Semua →
                                </Link>
                            </div>
                            {adminList.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada Admin RT</p>
                                    <Link
                                        href="/super-admin/admins"
                                        className="inline-flex items-center gap-1 mt-2 text-indigo-600 hover:underline"
                                    >
                                        <Plus className="w-4 h-4" /> Tambah Admin
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {adminList.slice(0, 5).map((admin) => (
                                        <div key={admin.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 font-bold text-sm">
                                                        {admin.nama.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{admin.nama}</div>
                                                    <div className="text-xs text-slate-500">{admin.email}</div>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {admin.role === 'SUPER_ADMIN' ? 'Super' : 'RT'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
