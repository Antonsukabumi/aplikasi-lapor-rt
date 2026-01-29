'use client';

import { useState, useEffect } from "react";
import { ArrowLeft, Recycle, Truck, Coins, Package, Scale, Leaf, Phone, MapPin, Clock, MessageCircle, User, Loader2, Search, AlertCircle } from "lucide-react";
import Link from "next/link";

interface BankSampahSettings {
    nama_pengelola: string;
    no_wa_pengelola: string;
    alamat_bank_sampah: string;
    jam_operasional: string;
    hari_operasional: string;
    minimal_jemput_kg: number;
    info_tambahan: string;
}

interface JenisSampah {
    id: string;
    nama: string;
    harga: number;
    poin: number;
    icon: string;
}

export default function BankSampahPage() {
    const [activeTab, setActiveTab] = useState<'info' | 'request' | 'saldo'>('info');
    const [requestForm, setRequestForm] = useState({
        jenis: '',
        alamat: '',
        catatan: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [settings, setSettings] = useState<BankSampahSettings | null>(null);
    const [jenisSampah, setJenisSampah] = useState<JenisSampah[]>([]);
    const [loadingJenis, setLoadingJenis] = useState(true);

    // Saldo State
    const [phoneCheck, setPhoneCheck] = useState('');
    const [checkingSaldo, setCheckingSaldo] = useState(false);
    const [saldoData, setSaldoData] = useState<any>(null);
    const [errorSaldo, setErrorSaldo] = useState('');

    // Fetch settings and jenis sampah
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch settings
                const settingsRes = await fetch('/api/bank-sampah/settings');
                const settingsData = await settingsRes.json();
                if (settingsData.success) {
                    setSettings(settingsData.data);
                }

                // Fetch jenis sampah
                const jenisRes = await fetch('/api/bank-sampah/jenis');
                const jenisData = await jenisRes.json();
                if (jenisData.success) {
                    setJenisSampah(jenisData.data);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoadingJenis(false);
            }
        }
        fetchData();
    }, []);

    const handleRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setRequestForm({ jenis: '', alamat: '', catatan: '' });
    };

    const getWhatsAppLink = () => {
        if (!settings?.no_wa_pengelola) return '#';
        const phone = settings.no_wa_pengelola.replace(/^0/, '62');
        const message = encodeURIComponent(`Halo ${settings.nama_pengelola}, saya ingin request jemput sampah.\n\nJenis: ${requestForm.jenis}\nAlamat: ${requestForm.alamat}\n${requestForm.catatan ? `Catatan: ${requestForm.catatan}` : ''}`);
        return `https://wa.me/${phone}?text=${message}`;
    };

    const handleCheckSaldo = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckingSaldo(true);
        setErrorSaldo('');
        setSaldoData(null);

        try {
            const res = await fetch(`/api/bank-sampah/check-saldo?no_hp=${phoneCheck}`);
            const data = await res.json();

            if (data.success) {
                setSaldoData(data.data);
            } else {
                setErrorSaldo(data.error || 'Data tidak ditemukan');
            }
        } catch (err) {
            setErrorSaldo('Gagal mengambil data saldo');
        } finally {
            setCheckingSaldo(false);
        }
    };

    return (
        <main className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-green-600 to-green-800 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 flex items-center gap-4">
                <Link href="/" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-2">
                    <Recycle className="w-6 h-6 text-white" />
                    <span className="font-bold text-lg text-white">Bank Sampah RT</span>
                </div>
            </div>

            {/* Info Pengelola Card */}
            {settings?.nama_pengelola && (
                <div className="mx-4 mb-4 p-4 bg-white/20 backdrop-blur rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-white">
                                <div className="font-bold">{settings.nama_pengelola}</div>
                                <div className="text-sm text-white/80">Pengelola Bank Sampah</div>
                            </div>
                        </div>
                        {settings.no_wa_pengelola && (
                            <a
                                href={`https://wa.me/${settings.no_wa_pengelola.replace(/^0/, '62')}`}
                                target="_blank"
                                className="p-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5 text-white" />
                            </a>
                        )}
                    </div>
                    {(settings.jam_operasional || settings.alamat_bank_sampah) && (
                        <div className="mt-3 pt-3 border-t border-white/20 text-white/80 text-xs space-y-1">
                            {settings.alamat_bank_sampah && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    <span>{settings.alamat_bank_sampah}</span>
                                </div>
                            )}
                            {settings.jam_operasional && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>{settings.hari_operasional} • {settings.jam_operasional}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="px-4 flex gap-2">
                {[
                    { id: 'info', label: 'Info Harga', icon: Scale },
                    { id: 'request', label: 'Jemput', icon: Truck },
                    { id: 'saldo', label: 'Cek Saldo', icon: Coins },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'info' | 'request' | 'saldo')}
                            className={`flex-1 py-2 px-3 rounded-t-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors ${activeTab === tab.id
                                ? 'bg-white text-green-700'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-t-3xl p-6 overflow-y-auto">

                {/* Tab: Info Harga */}
                {activeTab === 'info' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-green-600" />
                            Jenis Sampah & Harga
                        </h2>
                        <div className="space-y-3">
                            {loadingJenis ? (
                                <div className="text-center py-4 text-slate-400">Memuat harga...</div>
                            ) : jenisSampah.length === 0 ? (
                                <div className="text-center py-4 text-slate-400">Belum ada data harga</div>
                            ) : jenisSampah.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{item.icon}</span>
                                        <div>
                                            <div className="font-bold text-slate-800">{item.nama}</div>
                                            <div className="text-xs text-slate-500">+{item.poin} poin/kg</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">Rp {item.harga.toLocaleString()}</div>
                                        <div className="text-xs text-slate-400">per kg</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {settings?.info_tambahan && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                                ℹ️ {settings.info_tambahan}
                            </div>
                        )}
                        <p className="mt-4 text-xs text-slate-400 text-center">
                            * Harga dapat berubah sewaktu-waktu
                        </p>
                    </div>
                )}

                {/* Tab: Request Jemput */}
                {activeTab === 'request' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-green-600" />
                            Request Jemput Sampah
                        </h2>

                        {settings?.minimal_jemput_kg && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                                📦 Minimal berat untuk jemput: <strong>{settings.minimal_jemput_kg} kg</strong>
                            </div>
                        )}

                        {showSuccess && (
                            <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-xl text-green-700 text-sm text-center">
                                ✅ Request berhasil! Pengelola akan menghubungi Anda.
                            </div>
                        )}

                        <form onSubmit={handleRequest} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Jenis Sampah</label>
                                <select
                                    required
                                    value={requestForm.jenis}
                                    onChange={(e) => setRequestForm({ ...requestForm, jenis: e.target.value })}
                                    className="w-full mt-1 p-3 rounded-xl border border-slate-200 bg-slate-50"
                                >
                                    <option value="">Pilih jenis sampah...</option>
                                    {jenisSampah.map((item: JenisSampah) => (
                                        <option key={item.id} value={item.nama}>{item.icon} {item.nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">Alamat Jemput</label>
                                <input
                                    required
                                    type="text"
                                    value={requestForm.alamat}
                                    onChange={(e) => setRequestForm({ ...requestForm, alamat: e.target.value })}
                                    placeholder="Contoh: Blok A1 No. 5"
                                    className="w-full mt-1 p-3 rounded-xl border border-slate-200 bg-slate-50"
                                >
                                </input>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">Catatan (Opsional)</label>
                                <textarea
                                    rows={2}
                                    value={requestForm.catatan}
                                    onChange={(e) => setRequestForm({ ...requestForm, catatan: e.target.value })}
                                    placeholder="Perkiraan berat, waktu yang diinginkan, dll"
                                    className="w-full mt-1 p-3 rounded-xl border border-slate-200 bg-slate-50"
                                />
                            </div>

                            {settings?.no_wa_pengelola ? (
                                <a
                                    href={getWhatsAppLink()}
                                    target="_blank"
                                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Hubungi via WhatsApp
                                </a>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Truck className="w-5 h-5" />
                                    Minta Dijemput
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {/* Tab: Saldo & History */}
                {activeTab === 'saldo' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-green-600" />
                            Cek Saldo Bank Sampah
                        </h2>

                        {!saldoData ? (
                            <form onSubmit={handleCheckSaldo} className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-4">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <Search className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Masukkan Nomor HP</h3>
                                    <p className="text-sm text-slate-500">Gunakan nomor HP yang terdaftar di RT</p>
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={phoneCheck}
                                    onChange={(e) => setPhoneCheck(e.target.value)}
                                    placeholder="Contoh: 0812..."
                                    className="w-full p-4 text-center text-lg font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                {errorSaldo && (
                                    <p className="text-red-500 text-sm flex items-center justify-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errorSaldo}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={checkingSaldo}
                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    {checkingSaldo ? <Loader2 className="animate-spin" /> : 'Cek Saldo Sekarang'}
                                </button>
                            </form>
                        ) : (
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800 text-lg">{saldoData.warga?.nama}</div>
                                        <button
                                            onClick={() => { setSaldoData(null); setPhoneCheck(''); }}
                                            className="text-xs text-green-600 underline"
                                        >
                                            Cek nomor lain
                                        </button>
                                    </div>
                                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                        Terverifikasi
                                    </div>
                                </div>

                                {/* Saldo Cards */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 rounded-xl text-white shadow-lg">
                                        <div className="text-xs opacity-80 mb-1">Total Poin</div>
                                        <div className="text-3xl font-bold">{saldoData.saldo.total_poin}</div>
                                        <div className="text-xs opacity-80">poin</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg">
                                        <div className="text-xs opacity-80 mb-1">Nilai Uang</div>
                                        <div className="text-3xl font-bold">{parseInt(saldoData.saldo.total_uang).toLocaleString('id-ID')}</div>
                                        <div className="text-xs opacity-80">Rupiah</div>
                                    </div>
                                </div>

                                {/* Riwayat */}
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Riwayat Terakhir
                                </h3>

                                {saldoData.history.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                                        Belum ada transaksi
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {saldoData.history.map((t: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                                                <div>
                                                    <div className="font-bold text-slate-800">{t.jenis_sampah?.nama || 'Sampah'}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {t.berat_kg} kg
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-green-600 font-bold">+{t.poin}</div>
                                                    <div className="text-xs text-slate-400">poin</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}


