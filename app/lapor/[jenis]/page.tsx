'use client';

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Camera, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { notifyNewReport } from "@/lib/notifications";

const CONFIG = {
    meninggal: {
        title: "Lapor Berita Duka",
        icon: "🥀",
        description: "Innalillahi wa inna ilaihi rojiun. Sampaikan kabar duka agar warga bisa segera takziah.",
        extraField: "Rencana Pemakaman (Jam & Lokasi)",
        bg: "bg-red-600",
        text: "text-red-700",
        light: "bg-red-50",
        border: "focus:ring-red-500"
    },
    sakit: {
        title: "Lapor Warga Sakit",
        icon: "🏥",
        description: "Tetangga sakit butuh bantuan? Laporkan agar RT bisa koordinasi bantuan.",
        extraField: "Kondisi Saat Ini / Kebutuhan (Ambulans?)",
        bg: "bg-amber-500",
        text: "text-amber-700",
        light: "bg-amber-50",
        border: "focus:ring-amber-500"
    },
    bencana: {
        title: "Lapor Bencana / Darurat",
        icon: "⚡",
        description: "Banjir, pohon tumbang, atau kejadian darurat lainnya.",
        extraField: "Situasi Terkini & Bahaya",
        bg: "bg-blue-600",
        text: "text-blue-700",
        light: "bg-blue-50",
        border: "focus:ring-blue-500"
    }
};

export default function LaporPage() {
    const params = useParams();
    const router = useRouter();
    const jenis = params.jenis as keyof typeof CONFIG;
    const config = CONFIG[jenis] || CONFIG.bencana;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        nama_pelapor: '',
        lokasi: '',
        deskripsi: '',
        no_hp_pelapor: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/laporan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    jenis: jenis
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengirim laporan');
            }

            // Send notification to admin
            try {
                await notifyNewReport(jenis, formData.nama_pelapor);
            } catch (notifErr) {
                console.log('Notification not sent:', notifErr);
            }

            // Berhasil, redirect ke halaman sukses
            router.push("/lapor/sukses");
        } catch (err) {
            console.error('Submit error:', err);
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen max-w-md mx-auto bg-white shadow-2xl flex flex-col relative">
            <div className={`p-4 ${config.light} flex items-center gap-4 sticky top-0 z-20`}>
                <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:scale-105 transition-transform">
                    <ArrowLeft className={`w-5 h-5 ${config.text}`} />
                </Link>
                <span className={`font-bold text-lg ${config.text}`}>{config.title}</span>
            </div>

            <div className="p-6 flex-1 overflow-y-auto pb-32">
                <div className="text-center mb-6">
                    <span className="text-6xl animate-bounce inline-block">{config.icon}</span>
                    <p className="text-slate-500 mt-4 text-sm leading-relaxed">{config.description}</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Nama Pelapor / Warga</label>
                        <input
                            required
                            type="text"
                            name="nama_pelapor"
                            value={formData.nama_pelapor}
                            onChange={handleChange}
                            placeholder="Contoh: Budi (Blok A1 No. 5)"
                            className={`w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 ${config.border}`}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Nomor HP (Opsional)</label>
                        <input
                            type="tel"
                            name="no_hp_pelapor"
                            value={formData.no_hp_pelapor}
                            onChange={handleChange}
                            placeholder="08xxxxxxxxxx"
                            className={`w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 ${config.border}`}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Lokasi / Alamat</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                name="lokasi"
                                value={formData.lokasi}
                                onChange={handleChange}
                                placeholder="Deteksi lokasi otomatis..."
                                className={`w-full p-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 ${config.border}`}
                            />
                            <button type="button" className="absolute right-3 top-3 p-1.5 bg-white rounded-lg shadow-sm text-slate-400 hover:text-blue-600">
                                <MapPin className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {config.extraField}
                        </label>
                        <textarea
                            required
                            rows={3}
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            placeholder="Tulis detail informasinya di sini..."
                            className={`w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 ${config.border}`}
                        />
                    </div>

                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                        <Camera className="w-8 h-8 text-slate-300 mx-auto group-hover:text-slate-500 transition-colors" />
                        <p className="text-xs text-slate-400 mt-2 font-medium">Tambah Foto (Opsional)</p>
                    </div>
                </form>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent max-w-md mx-auto">
                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    type="submit"
                    className={`w-full ${config.bg} text-white font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                    {loading ? 'Mengirim...' : (
                        <>
                            <Send className="w-5 h-5" />
                            Kirim Laporan
                        </>
                    )}
                </button>
            </div>
        </main>
    );
}
