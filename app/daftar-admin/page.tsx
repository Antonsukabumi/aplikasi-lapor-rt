'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Home, Shield, UserPlus, Eye, EyeOff, Phone, Mail,
    AlertCircle, CheckCircle, ChevronRight, MapPin
} from 'lucide-react';
import type { RtUnit } from '@/types';

export default function DaftarAdminPage() {
    const [step, setStep] = useState<'form' | 'sukses'>('form');
    const [rtList, setRtList] = useState<RtUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        no_hp: '',
        rt_id: ''
    });

    useEffect(() => {
        fetchRtList();
    }, []);

    const fetchRtList = async () => {
        try {
            const res = await fetch('/api/rt');
            const data = await res.json();
            if (data.success) {
                setRtList(data.data || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/register-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setStep('sukses');
            } else {
                setError(data.error || 'Gagal mendaftar');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedRt = rtList.find(rt => rt.id === formData.rt_id);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Memuat...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700">
            {/* Header */}
            <header className="p-4 text-white">
                <div className="max-w-md mx-auto flex items-center gap-3">
                    <Link href="/" className="p-2 bg-white/20 rounded-full">
                        <Home className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg">Daftar Admin RT</h1>
                        <p className="text-indigo-100 text-xs">Registrasi sebagai pengelola RT</p>
                    </div>
                </div>
            </header>

            <div className="max-w-md mx-auto p-4">
                {/* Step: Form */}
                {step === 'form' && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-indigo-600 p-4 text-white">
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6" />
                                <div>
                                    <h2 className="font-bold">Form Pendaftaran Admin</h2>
                                    <p className="text-sm text-indigo-100">Isi data untuk menjadi Admin RT</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-sm text-amber-700">
                                    ⚠️ Pendaftaran memerlukan persetujuan Super Admin sebelum akun bisa digunakan.
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">
                                    Nama Lengkap *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Nama lengkap Anda"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@contoh.com"
                                        className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Minimal 6 karakter"
                                        minLength={6}
                                        className="w-full pr-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-slate-400"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">
                                    No. HP/WhatsApp
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.no_hp}
                                        onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1">
                                    Pilih RT yang Akan Dikelola *
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {rtList.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-4">
                                            Belum ada RT terdaftar
                                        </p>
                                    ) : (
                                        rtList.map((rt) => (
                                            <button
                                                key={rt.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rt_id: rt.id })}
                                                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${formData.rt_id === rt.id
                                                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                                                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <MapPin className={`w-4 h-4 ${formData.rt_id === rt.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                    <div>
                                                        <div className={`font-semibold ${formData.rt_id === rt.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                            {rt.nama}
                                                        </div>
                                                        {rt.kelurahan && (
                                                            <div className="text-xs text-slate-500">{rt.kelurahan}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formData.rt_id === rt.id && (
                                                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !formData.rt_id}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <UserPlus className="w-5 h-5" />
                                {submitting ? 'Mendaftar...' : 'Daftar Sebagai Admin'}
                            </button>

                            <div className="text-center text-sm text-slate-500">
                                Sudah punya akun?{' '}
                                <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                                    Login di sini
                                </Link>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step: Sukses */}
                {step === 'sukses' && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
                        <p className="text-slate-500 mb-2">
                            Anda mendaftar sebagai Admin untuk:
                        </p>
                        <p className="font-bold text-indigo-600 mb-4">{selectedRt?.nama}</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-amber-700">
                                ⏳ Akun Anda menunggu persetujuan Super Admin. Anda akan dapat login setelah akun diaktifkan.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700"
                        >
                            <Home className="w-5 h-5" />
                            Kembali ke Beranda
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
