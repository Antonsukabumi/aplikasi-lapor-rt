'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/admin';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Login gagal');
                return;
            }

            // Redirect based on role
            if (data.data.role === 'SUPER_ADMIN') {
                router.push('/super-admin');
            } else {
                router.push(redirect);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                        <ShieldAlert className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Lapor Pak RT</h1>
                    <p className="text-slate-400 mt-2">Portal Admin Dashboard</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-6 text-center">Masuk ke Dashboard</h2>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@lapor.rt"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-400 mb-2">Demo credentials:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-slate-300">
                                <strong>Super Admin:</strong><br />
                                superadmin@lapor.rt<br />
                                admin123
                            </div>
                            <div className="text-slate-300">
                                <strong>Admin RT:</strong><br />
                                rt05@lapor.rt<br />
                                admin123
                            </div>
                        </div>
                    </div>
                </form>

                {/* Back to Home */}
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 mt-6 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function LoginLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="text-white">Memuat...</div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginForm />
        </Suspense>
    );
}
