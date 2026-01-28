import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function LaporSuksesPage() {
    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
            <div className="mb-6 animate-pulse">
                <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Laporan Diterima!</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
                Terima kasih. Notifikasi sudah dikirim ke HP Pak RT dan petugas terkait. Silakan tunggu update selanjutnya.
            </p>

            <div className="w-full space-y-3">
                <Link href="/" className="block w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-colors text-center">
                    Kembali ke Depan
                </Link>
            </div>
        </main>
    );
}
