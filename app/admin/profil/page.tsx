'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, User, Mail, Phone, Building2, Lock, Save, Eye, EyeOff,
    Shield, LogOut, Check
} from 'lucide-react';
import type { AdminSession } from '@/types';

export default function ProfilAdminPage() {
    const router = useRouter();
    const [session, setSession] = useState<AdminSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profil' | 'password'>('profil');

    // Profile form
    const [nama, setNama] = useState('');
    const [noHp, setNoHp] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

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
            setNama(data.data.nama);
        } catch {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/profil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama, no_hp: noHp })
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Profil berhasil diperbarui!');
                // Refresh session
                checkSession();
            } else {
                setMessage(data.error || 'Gagal memperbarui profil');
            }
        } catch (err) {
            console.error('Update error:', err);
            setMessage('Terjadi kesalahan');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage('Password baru tidak cocok');
            return;
        }

        if (newPassword.length < 6) {
            setMessage('Password minimal 6 karakter');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/profil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Password berhasil diperbarui!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage(data.error || 'Gagal memperbarui password');
            }
        } catch (err) {
            console.error('Update error:', err);
            setMessage('Terjadi kesalahan');
        } finally {
            setSaving(false);
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
        <main className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 shadow-lg">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Profil Admin</h1>
                            <p className="text-slate-400 text-xs">Kelola akun Anda</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                                {session?.nama.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-800">{session?.nama}</h2>
                            <p className="text-sm text-slate-500">{session?.email}</p>
                            <div className="flex gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${session?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {session?.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '👤 Admin RT'}
                                </span>
                                {session?.rt_info && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                        {session.rt_info.nama}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {session?.rt_info && (
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                <Building2 className="w-4 h-4" />
                                <span className="font-medium">Info RT</span>
                            </div>
                            <div className="text-sm text-slate-600">
                                <p><strong>{session.rt_info.nama}</strong></p>
                                <p>{session.rt_info.kelurahan}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('profil')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'profil' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}
                    >
                        <User className="w-4 h-4" />
                        Profil
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'password' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}
                    >
                        <Lock className="w-4 h-4" />
                        Password
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-xl mb-4 ${message.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                {/* Profile Form */}
                {activeTab === 'profil' && (
                    <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
                            <input
                                required
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">No. HP</label>
                            <input
                                type="tel"
                                value={noHp}
                                onChange={(e) => setNoHp(e.target.value)}
                                placeholder="081234567890"
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </form>
                )}

                {/* Password Form */}
                {activeTab === 'password' && (
                    <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Password Saat Ini</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full p-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-3 text-slate-400"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Password Baru</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                    className="w-full p-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-3 text-slate-400"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Konfirmasi Password Baru</label>
                            <input
                                required
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Lock className="w-5 h-5" />
                            {saving ? 'Menyimpan...' : 'Ubah Password'}
                        </button>
                    </form>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full mt-4 bg-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-200 flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Keluar
                </button>
            </div>
        </main>
    );
}
