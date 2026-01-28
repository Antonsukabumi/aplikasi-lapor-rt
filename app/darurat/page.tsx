'use client';

import { useState, useEffect } from "react";
import { Siren, ArrowLeft, Phone, MapPin, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface KontakDarurat {
    id: string;
    nama: string;
    nomor: string;
    kategori: string;
    icon: string;
    aktif: boolean;
}

export default function DaruratPage() {
    const [sosActive, setSosActive] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [sosSent, setSosSent] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [kontakList, setKontakList] = useState<KontakDarurat[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch kontak darurat dari API
    useEffect(() => {
        async function fetchKontak() {
            try {
                const res = await fetch('/api/kontak-darurat');
                const data = await res.json();
                if (data.success) {
                    setKontakList(data.data);
                }
            } catch (err) {
                console.error('Error fetching contacts:', err);
                // Fallback ke data default jika API gagal
                setKontakList([
                    { id: '1', nama: 'Ambulans', nomor: '118', kategori: 'MEDIS', icon: '🚑', aktif: true },
                    { id: '2', nama: 'Polisi', nomor: '110', kategori: 'KEAMANAN', icon: '👮', aktif: true },
                    { id: '3', nama: 'Pemadam Kebakaran', nomor: '113', kategori: 'DARURAT', icon: '🚒', aktif: true },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchKontak();
    }, []);

    // Get GPS location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => console.log('GPS tidak tersedia')
            );
        }
    }, []);

    // Countdown logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (sosActive && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (sosActive && countdown === 0) {
            sendSOS();
        }
        return () => clearTimeout(timer);
    }, [sosActive, countdown]);

    const handleSOS = () => {
        setSosActive(true);
        setCountdown(3);
    };

    const cancelSOS = () => {
        setSosActive(false);
        setCountdown(3);
    };

    const sendSOS = async () => {
        setSosActive(false);
        setSosSent(true);

        try {
            await fetch('/api/laporan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama_pelapor: 'SOS DARURAT',
                    no_hp_pelapor: '',
                    jenis: 'BENCANA',
                    deskripsi: '🆘 TOMBOL SOS DITEKAN - BUTUH BANTUAN SEGERA!',
                    lokasi: location
                        ? `GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                        : 'Lokasi tidak diketahui',
                    latitude: location?.lat,
                    longitude: location?.lng,
                }),
            });
        } catch (err) {
            console.error('SOS send error:', err);
        }

        setTimeout(() => setSosSent(false), 5000);
    };

    // Group contacts by category
    const groupedKontak = kontakList.reduce((acc, k) => {
        if (!acc[k.kategori]) acc[k.kategori] = [];
        acc[k.kategori].push(k);
        return acc;
    }, {} as Record<string, KontakDarurat[]>);

    const kategoriOrder = ['MEDIS', 'KEAMANAN', 'DARURAT', 'RT', 'UTILITAS'];
    const kategoriLabels: Record<string, string> = {
        MEDIS: '🏥 Medis & Kesehatan',
        KEAMANAN: '👮 Keamanan',
        DARURAT: '🚨 Darurat',
        RT: '👨‍💼 RT / RW',
        UTILITAS: '⚡ Utilitas',
    };

    return (
        <main className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-red-600 to-red-800 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center gap-4">
                <Link href="/" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-2">
                    <Siren className="w-6 h-6 text-white" />
                    <span className="font-bold text-lg text-white">Darurat & SOS</span>
                </div>
            </div>

            {/* SOS Button Area */}
            <div className="flex-shrink-0 py-8 flex flex-col items-center justify-center">
                {sosSent ? (
                    <div className="text-center text-white">
                        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="text-5xl">✓</span>
                        </div>
                        <p className="font-bold text-xl">SOS Terkirim!</p>
                        <p className="text-red-200 text-sm mt-2">Bantuan sedang menuju lokasi Anda</p>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={sosActive ? cancelSOS : handleSOS}
                            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 ${sosActive
                                    ? 'bg-white animate-pulse'
                                    : 'bg-white hover:scale-105'
                                }`}
                        >
                            {sosActive ? (
                                <>
                                    <span className="text-5xl font-bold text-red-600">{countdown}</span>
                                    <span className="text-red-600 text-sm font-bold">BATALKAN</span>
                                </>
                            ) : (
                                <>
                                    <Siren className="w-16 h-16 text-red-600 mb-1" />
                                    <span className="text-red-600 font-bold text-lg">SOS</span>
                                </>
                            )}
                        </button>
                        <p className="text-white/80 text-sm mt-4 text-center max-w-xs">
                            {sosActive
                                ? 'Tekan lagi untuk membatalkan'
                                : 'Tekan dan tahan 3 detik untuk mengirim sinyal darurat + lokasi GPS'
                            }
                        </p>
                    </>
                )}

                {/* GPS Status */}
                {location && (
                    <div className="mt-4 flex items-center gap-2 text-white/70 text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>GPS Aktif</span>
                    </div>
                )}
            </div>

            {/* Emergency Contacts List */}
            <div className="flex-1 bg-white rounded-t-3xl p-6 overflow-y-auto">
                <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-red-600" />
                    Nomor Darurat
                </h2>

                {loading ? (
                    <div className="text-center py-8 text-slate-400">Memuat kontak...</div>
                ) : kontakList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada kontak darurat</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {kategoriOrder.map((kategori) => {
                            const kontaks = groupedKontak[kategori];
                            if (!kontaks || kontaks.length === 0) return null;

                            return (
                                <div key={kategori}>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                                        {kategoriLabels[kategori] || kategori}
                                    </h3>
                                    <div className="space-y-2">
                                        {kontaks.map((kontak) => (
                                            <a
                                                key={kontak.id}
                                                href={`tel:${kontak.nomor}`}
                                                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{kontak.icon}</span>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{kontak.nama}</div>
                                                        <div className="text-sm text-slate-500">{kontak.nomor}</div>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                    <Phone className="w-5 h-5 text-white" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
