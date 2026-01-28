'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Clock, Search, ShieldAlert, User, CheckCircle, RefreshCw, Phone, MessageCircle,
    Home, FileText, Users, Bell, Settings, LogOut, Menu, X, Eye, AlertTriangle,
    HeartPulse, Megaphone, MapPin, Calendar, Filter, ChevronDown, Recycle, PiggyBank
} from "lucide-react";
import type { Laporan } from "@/types/database";
import type { AdminSession } from "@/types";
import Link from "next/link";

type JenisLaporan = 'MENINGGAL' | 'SAKIT' | 'BENCANA';
type StatusLaporan = 'BARU' | 'DITERIMA' | 'DIPROSES' | 'SELESAI';
type TabType = 'semua' | 'baru' | 'proses' | 'selesai';

const TIPE_LAPORAN: Record<JenisLaporan, { label: string; color: string; icon: typeof Megaphone }> = {
    MENINGGAL: { label: 'Kabar Duka', color: 'red', icon: Megaphone },
    SAKIT: { label: 'Warga Sakit', color: 'amber', icon: HeartPulse },
    BENCANA: { label: 'Bencana', color: 'blue', icon: AlertTriangle },
};

const STATUS_CONFIG: Record<StatusLaporan, { label: string; bg: string; text: string }> = {
    BARU: { label: 'BARU', bg: 'bg-red-100', text: 'text-red-700' },
    DITERIMA: { label: 'DITERIMA', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    DIPROSES: { label: 'DIPROSES', bg: 'bg-blue-100', text: 'text-blue-700' },
    SELESAI: { label: 'SELESAI', bg: 'bg-green-100', text: 'text-green-700' },
};

export default function AdminDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<AdminSession | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [laporanList, setLaporanList] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>('semua');
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);
    const [filterJenis, setFilterJenis] = useState<JenisLaporan | 'SEMUA'>('SEMUA');

    const fetchLaporan = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/laporan');
            const data = await response.json();
            if (data.success) {
                setLaporanList(data.data || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();
            if (!data.success) {
                router.push('/login?redirect=/admin');
                return;
            }
            setSession(data.data);
            setAuthLoading(false);
        } catch {
            router.push('/login?redirect=/admin');
        }
    };

    useEffect(() => {
        if (session) {
            fetchLaporan();
            // Auto refresh setiap 30 detik
            const interval = setInterval(fetchLaporan, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const updateStatus = async (id: string, newStatus: string, balasan?: string) => {
        try {
            const response = await fetch(`/api/laporan/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, balasan }),
            });
            if (response.ok) {
                fetchLaporan();
                setSelectedLaporan(null);
            }
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} jam lalu`;
        return `${Math.floor(diffMins / 1440)} hari lalu`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter laporan
    const filteredLaporan = laporanList.filter(l => {
        const matchSearch = l.nama_pelapor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.lokasi.toLowerCase().includes(searchQuery.toLowerCase());

        const matchTab = activeTab === 'semua' ? true :
            activeTab === 'baru' ? l.status === 'BARU' :
                activeTab === 'proses' ? (l.status === 'DITERIMA' || l.status === 'DIPROSES') :
                    l.status === 'SELESAI';

        const matchJenis = filterJenis === 'SEMUA' ? true : l.jenis === filterJenis;

        return matchSearch && matchTab && matchJenis;
    });

    // Stats
    const stats = {
        total: laporanList.length,
        baru: laporanList.filter(l => l.status === 'BARU').length,
        proses: laporanList.filter(l => l.status === 'DITERIMA' || l.status === 'DIPROSES').length,
        selesai: laporanList.filter(l => l.status === 'SELESAI').length,
    };

    // Loading State
    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Memuat...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar - Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold">Lapor Pak RT</h1>
                    <p className="text-slate-400 text-sm">Dashboard Admin</p>
                </div>

                <nav className="p-4 space-y-2">
                    <div className="bg-slate-800 px-4 py-3 rounded-xl flex items-center gap-3">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">Laporan</span>
                        {stats.baru > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {stats.baru}
                            </span>
                        )}
                    </div>

                    <Link href="/admin/kontak-darurat" className="px-4 py-3 rounded-xl flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <Phone className="w-5 h-5" />
                        <span>Nomor Darurat</span>
                    </Link>

                    <Link href="/admin/bank-sampah" className="px-4 py-3 rounded-xl flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <Recycle className="w-5 h-5" />
                        <span>Bank Sampah</span>
                    </Link>

                    <Link href="/admin/koropak" className="px-4 py-3 rounded-xl flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <PiggyBank className="w-5 h-5" />
                        <span>Koropak</span>
                    </Link>

                    <Link href="/pengumuman" className="px-4 py-3 rounded-xl flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        <span>Pengumuman</span>
                    </Link>

                    <Link href="/" className="px-4 py-3 rounded-xl flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <Home className="w-5 h-5" />
                        <span>Lihat Aplikasi</span>
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
                    <Link href="/admin/profil" className="flex items-center gap-3 mb-4 hover:bg-slate-800 p-2 rounded-lg -m-2 transition-colors">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{session?.nama.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div className="font-medium">{session?.nama}</div>
                            <div className="text-xs text-slate-400">{session?.rt_info?.nama || session?.role}</div>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
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
                                <h1 className="font-bold text-slate-900">Dashboard Laporan</h1>
                                <p className="text-xs text-slate-500">{session?.rt_info?.nama || 'Admin Dashboard'}{session?.rt_info?.kelurahan ? `, ${session.rt_info.kelurahan}` : ''}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchLaporan}
                                disabled={loading}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            {stats.baru > 0 && (
                                <div className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    {stats.baru} Laporan Baru
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('semua')}
                            className={`bg-white p-4 rounded-xl shadow-sm border-l-4 border-slate-800 text-left transition-all ${activeTab === 'semua' ? 'ring-2 ring-slate-800' : ''}`}
                        >
                            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                            <div className="text-xs text-slate-500">Total Laporan</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('baru')}
                            className={`bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 text-left transition-all ${activeTab === 'baru' ? 'ring-2 ring-red-500' : ''}`}
                        >
                            <div className="text-2xl font-bold text-red-600">{stats.baru}</div>
                            <div className="text-xs text-slate-500">Perlu Tindakan</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('proses')}
                            className={`bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 text-left transition-all ${activeTab === 'proses' ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            <div className="text-2xl font-bold text-blue-600">{stats.proses}</div>
                            <div className="text-xs text-slate-500">Sedang Diproses</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('selesai')}
                            className={`bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 text-left transition-all ${activeTab === 'selesai' ? 'ring-2 ring-green-500' : ''}`}
                        >
                            <div className="text-2xl font-bold text-green-600">{stats.selesai}</div>
                            <div className="text-xs text-slate-500">Selesai</div>
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, deskripsi, atau lokasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 p-2 rounded-lg bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <select
                                    value={filterJenis}
                                    onChange={(e) => setFilterJenis(e.target.value as JenisLaporan | 'SEMUA')}
                                    className="pl-9 pr-8 p-2 rounded-lg bg-slate-100 text-sm focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="SEMUA">Semua Jenis</option>
                                    <option value="MENINGGAL">Kabar Duka</option>
                                    <option value="SAKIT">Warga Sakit</option>
                                    <option value="BENCANA">Bencana</option>
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Report List */}
                        {loading && laporanList.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                                Memuat data...
                            </div>
                        ) : filteredLaporan.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada laporan'}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredLaporan.map((laporan) => {
                                    const typeConfig = TIPE_LAPORAN[laporan.jenis as JenisLaporan] || TIPE_LAPORAN.BENCANA;
                                    const statusConfig = STATUS_CONFIG[laporan.status as StatusLaporan] || STATUS_CONFIG.BARU;
                                    const TypeIcon = typeConfig.icon;

                                    return (
                                        <div
                                            key={laporan.id}
                                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${laporan.status === 'BARU' ? 'bg-red-50/50' : ''}`}
                                            onClick={() => setSelectedLaporan(laporan)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${typeConfig.color === 'red' ? 'bg-red-100 text-red-700' :
                                                        typeConfig.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        <TypeIcon className="w-3 h-3" />
                                                        {typeConfig.label}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatTime(laporan.created_at)}
                                                    </span>
                                                    {laporan.status === 'BARU' && (
                                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-slate-800 mb-1">{laporan.nama_pelapor}</h3>
                                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">{laporan.deskripsi}</p>

                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {laporan.lokasi}
                                                </span>
                                                {laporan.no_hp_pelapor && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {laporan.no_hp_pelapor}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Detail Modal */}
            {selectedLaporan && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-start">
                            <div>
                                <h2 className="font-bold text-lg text-slate-900">Detail Laporan</h2>
                                <p className="text-sm text-slate-500">{formatDate(selectedLaporan.created_at)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLaporan(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Status & Type */}
                            <div className="flex gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${TIPE_LAPORAN[selectedLaporan.jenis as JenisLaporan]?.color === 'red' ? 'bg-red-100 text-red-700' :
                                    TIPE_LAPORAN[selectedLaporan.jenis as JenisLaporan]?.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {TIPE_LAPORAN[selectedLaporan.jenis as JenisLaporan]?.label || 'Laporan'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_CONFIG[selectedLaporan.status as StatusLaporan]?.bg} ${STATUS_CONFIG[selectedLaporan.status as StatusLaporan]?.text}`}>
                                    {STATUS_CONFIG[selectedLaporan.status as StatusLaporan]?.label}
                                </span>
                            </div>

                            {/* Pelapor */}
                            <div className="mb-4">
                                <div className="text-xs text-slate-500 mb-1">Pelapor</div>
                                <div className="font-bold text-slate-900">{selectedLaporan.nama_pelapor}</div>
                                {selectedLaporan.no_hp_pelapor && (
                                    <div className="text-sm text-slate-600">{selectedLaporan.no_hp_pelapor}</div>
                                )}
                            </div>

                            {/* Lokasi */}
                            <div className="mb-4">
                                <div className="text-xs text-slate-500 mb-1">Lokasi</div>
                                <div className="text-slate-900 flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                    {selectedLaporan.lokasi}
                                </div>
                                {selectedLaporan.latitude && selectedLaporan.longitude && (
                                    <a
                                        href={`https://maps.google.com/?q=${selectedLaporan.latitude},${selectedLaporan.longitude}`}
                                        target="_blank"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Buka di Google Maps →
                                    </a>
                                )}
                            </div>

                            {/* Deskripsi */}
                            <div className="mb-4">
                                <div className="text-xs text-slate-500 mb-1">Deskripsi</div>
                                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{selectedLaporan.deskripsi}</p>
                            </div>

                            {/* Balasan (jika ada) */}
                            {selectedLaporan.balasan && (
                                <div className="mb-4">
                                    <div className="text-xs text-slate-500 mb-1">Balasan Anda</div>
                                    <p className="text-slate-900 bg-green-50 p-3 rounded-lg border-l-4 border-green-500">{selectedLaporan.balasan}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 mt-6">
                                {selectedLaporan.no_hp_pelapor && (
                                    <div className="flex gap-2">
                                        <a
                                            href={`tel:${selectedLaporan.no_hp_pelapor}`}
                                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2"
                                        >
                                            <Phone className="w-4 h-4" /> Telepon
                                        </a>
                                        <a
                                            href={`https://wa.me/62${selectedLaporan.no_hp_pelapor.replace(/^0/, '')}`}
                                            target="_blank"
                                            className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-4 h-4" /> WhatsApp
                                        </a>
                                    </div>
                                )}

                                {selectedLaporan.status === 'BARU' && (
                                    <button
                                        onClick={() => updateStatus(selectedLaporan.id, 'DITERIMA')}
                                        className="w-full px-4 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Terima Laporan
                                    </button>
                                )}
                                {selectedLaporan.status === 'DITERIMA' && (
                                    <button
                                        onClick={() => updateStatus(selectedLaporan.id, 'DIPROSES')}
                                        className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2"
                                    >
                                        🔧 Mulai Proses
                                    </button>
                                )}
                                {selectedLaporan.status === 'DIPROSES' && (
                                    <button
                                        onClick={() => {
                                            const balasan = prompt('Masukkan pesan balasan untuk warga:');
                                            if (balasan) {
                                                updateStatus(selectedLaporan.id, 'SELESAI', balasan);
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Tandai Selesai
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
