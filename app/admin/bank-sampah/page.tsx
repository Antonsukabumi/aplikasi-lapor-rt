'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, History, TrendingUp, Users, DollarSign,
    Recycle, Settings, Loader2
} from 'lucide-react';

export default function BankSampahDashboard() {
    const [stats, setStats] = useState({
        totalBerat: 0,
        totalUang: 0,
        transaksiHariIni: 0
    });
    const [recentTrx, setRecentTrx] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/bank-sampah/transaksi?limit=10');
            const data = await res.json();

            if (data.success) {
                setRecentTrx(data.data || []);

                // Calculate simple stats from recent data (Mocking total stats for now as we don't have aggregator API yet)
                // In real app, we should have /api/bank-sampah/stats
                const totalBerat = data.data.reduce((acc: number, curr: any) => acc + Number(curr.berat_kg), 0);
                const totalUang = data.data.reduce((acc: number, curr: any) => acc + Number(curr.uang), 0);

                setStats({
                    totalBerat,
                    totalUang,
                    transaksiHariIni: data.data.length // Just a placeholder
                });
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-emerald-600 text-white p-4 sticky top-0 z-30 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Bank Sampah</h1>
                            <p className="text-emerald-100 text-xs">Dashboard Pengelola</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/bank-sampah/settings" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                            <Recycle className="w-3 h-3" /> Total Berat
                        </div>
                        <div className="text-xl font-bold text-slate-800">{stats.totalBerat.toFixed(1)} kg</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Perputaran Uang
                        </div>
                        <div className="text-xl font-bold text-emerald-600">{formatCurrency(stats.totalUang)}</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/admin/bank-sampah/setor"
                        className="bg-emerald-600 text-white p-4 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="font-bold">Setor Sampah</span>
                    </Link>
                    <Link
                        href="/admin/bank-sampah/harga"
                        className="bg-white text-emerald-600 border-2 border-emerald-100 p-4 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                    >
                        <DollarSign className="w-6 h-6" />
                        <span className="font-bold">Atur Harga</span>
                    </Link>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-500" />
                            Riwayat Setoran
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 flex justify-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : recentTrx.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <Recycle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            Belum ada transaksi
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentTrx.map((trx) => (
                                <div key={trx.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
                                            {trx.jenis_sampah?.icon || '♻️'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{trx.warga?.nama || 'Warga'}</div>
                                            <div className="text-xs text-slate-500">
                                                {trx.jenis_sampah?.nama} • {trx.berat_kg} kg
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-600">+{trx.poin} Poin</div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(trx.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
