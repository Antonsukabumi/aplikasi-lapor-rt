'use client';

import { ArrowLeft, Megaphone, Bell, Calendar, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";

interface Pengumuman {
    id: number;
    judul: string;
    isi: string;
    prioritas: 'BIASA' | 'PENTING' | 'DARURAT';
    tanggal: string;
}

const MOCK_PENGUMUMAN: Pengumuman[] = [
    {
        id: 1,
        judul: '⚠️ Peringatan Cuaca Ekstrem',
        isi: 'BMKG memprediksi hujan lebat disertai angin kencang dalam 2 hari ke depan. Harap warga berhati-hati dan amankan barang di luar rumah.',
        prioritas: 'DARURAT',
        tanggal: '28 Jan 2026'
    },
    {
        id: 2,
        judul: 'Jadwal Kerja Bakti Bulanan',
        isi: 'Kerja bakti bulanan akan dilaksanakan hari Minggu, 2 Februari 2026 pukul 07.00 WIB. Diharapkan partisipasi seluruh warga.',
        prioritas: 'PENTING',
        tanggal: '25 Jan 2026'
    },
    {
        id: 3,
        judul: 'Iuran Bulan Januari',
        isi: 'Pengumpulan iuran bulanan bulan Januari sudah dibuka. Silakan bayar ke Bendahara RT sebelum tanggal 31 Januari.',
        prioritas: 'PENTING',
        tanggal: '20 Jan 2026'
    },
    {
        id: 4,
        judul: 'Selamat Tahun Baru 2026',
        isi: 'Pengurus RT mengucapkan Selamat Tahun Baru 2026. Semoga tahun ini membawa kebaikan bagi kita semua.',
        prioritas: 'BIASA',
        tanggal: '1 Jan 2026'
    },
];

const PRIORITAS_CONFIG = {
    DARURAT: { bg: 'bg-red-50', border: 'border-l-red-600', icon: AlertTriangle, iconColor: 'text-red-600', badge: 'bg-red-600' },
    PENTING: { bg: 'bg-amber-50', border: 'border-l-amber-500', icon: Bell, iconColor: 'text-amber-600', badge: 'bg-amber-500' },
    BIASA: { bg: 'bg-slate-50', border: 'border-l-slate-400', icon: Info, iconColor: 'text-slate-600', badge: 'bg-slate-500' },
};

export default function PengumumanPage() {
    return (
        <main className="min-h-screen max-w-md mx-auto bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center gap-4">
                <Link href="/" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                    <Megaphone className="w-6 h-6" />
                    <span className="font-bold text-lg">Pengumuman RT</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {MOCK_PENGUMUMAN.map((item) => {
                        const config = PRIORITAS_CONFIG[item.prioritas];
                        const Icon = config.icon;

                        return (
                            <div
                                key={item.id}
                                className={`${config.bg} border-l-4 ${config.border} rounded-xl p-4 shadow-sm`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 bg-white rounded-full shadow-sm ${config.iconColor}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`${config.badge} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                                                {item.prioritas}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {item.tanggal}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 mb-2">{item.judul}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{item.isi}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
