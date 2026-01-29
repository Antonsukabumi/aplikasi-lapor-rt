'use client';

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Camera, MapPin, AlertCircle, X, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { notifyNewReport } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

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
    const [uploading, setUploading] = useState(false);

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran foto maksimal 5MB");
                return;
            }

            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('laporan-foto')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('laporan-foto')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Gagal mengupload foto');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let foto_url = null;

            // Upload image if exists
            if (imageFile) {
                setUploading(true);
                foto_url = await uploadImage(imageFile);
                setUploading(false);
            }

            const response = await fetch('/api/laporan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    jenis: jenis,
                    foto_url: foto_url
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
            setUploading(false);
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

                    {/* Image Upload Section */}
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                        />

                        {!previewUrl ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <Camera className="w-8 h-8 text-slate-300 mx-auto group-hover:text-slate-500 transition-colors" />
                                <p className="text-xs text-slate-400 mt-2 font-medium">Tambah Foto (Opsional)</p>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200">
                                <div className="aspect-video relative">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>Foto Terlampir</span>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent max-w-md mx-auto">
                <button
                    disabled={loading || uploading}
                    onClick={handleSubmit}
                    type="submit"
                    className={`w-full ${config.bg} text-white font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                    {loading ? (
                        uploading ? 'Mengupload Foto...' : 'Mengirim...'
                    ) : (
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
