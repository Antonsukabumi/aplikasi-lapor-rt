'use client';

import { useState, useEffect } from "react";
import {
  AlertTriangle, HeartPulse, Info, Megaphone, Siren, Phone, Moon, Sun,
  Recycle, HandHeart, MessageSquare, Bell, Menu, X, PiggyBank
} from "lucide-react";
import Link from "next/link";
import NotificationPrompt from "@/components/NotificationPrompt";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Check system preference
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
    document.documentElement.classList.toggle('dark', newValue);
  };

  const MENU_ITEMS = [
    { href: '/bank-sampah', icon: Recycle, label: 'Bank Sampah', color: 'bg-green-500' },
    { href: '/interaksi-warga', icon: HandHeart, label: 'Interaksi Warga', color: 'bg-purple-500' },
    { href: '/koropak', icon: PiggyBank, label: 'Koropak', color: 'bg-amber-500' },
    { href: '/forum', icon: MessageSquare, label: 'Forum Diskusi', color: 'bg-indigo-500' },
    { href: '/pengumuman', icon: Bell, label: 'Pengumuman', color: 'bg-orange-500' },
    { href: '/darurat', icon: Siren, label: 'Darurat & SOS', color: 'bg-red-500' },
  ];

  return (
    <main className={`min-h-screen max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header Section */}
      <header className="bg-slate-900 text-white p-6 pt-12 rounded-b-[2.5rem] shadow-lg relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-300 text-sm font-medium mb-1">Selamat Datang Warga,</p>
            <h1 className="text-3xl font-bold tracking-tight">Lapor Pak RT</h1>
            <p className="text-slate-400 text-xs mt-2">RT 05 / RW 03, Kelurahan Digital</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
            </button>
            {/* Menu Toggle */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
            >
              {showMenu ? <X className="w-5 h-5 text-slate-300" /> : <Menu className="w-5 h-5 text-slate-300" />}
            </button>
          </div>
        </div>

        {/* SOS Button in Header */}
        <Link
          href="/darurat"
          className="mt-6 flex items-center justify-between bg-red-600 hover:bg-red-700 transition-colors rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full">
              <Siren className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="font-bold text-white">Darurat & SOS</div>
              <div className="text-red-200 text-xs">Tombol SOS + Nomor Darurat</div>
            </div>
          </div>
          <Phone className="w-5 h-5 text-white" />
        </Link>
      </header>

      {/* Slide-down Menu */}
      {showMenu && (
        <div className={`px-6 py-4 grid grid-cols-3 gap-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMenu(false)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-transform hover:scale-105 ${darkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-700'} shadow-sm`}
              >
                <div className={`${item.color} p-2 rounded-full`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content - Emergency Buttons */}
      <div className={`flex-1 px-6 py-8 flex flex-col gap-5 justify-center ${darkMode ? 'bg-slate-900' : ''}`}>

        {/* Tombol 1: Kabar Duka (Meninggal) */}
        <Link href="/lapor/meninggal" className="group">
          <div className={`${darkMode ? 'bg-red-900/30 border-l-red-500' : 'bg-red-50 border-l-red-600'} border-l-8 rounded-xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-between`}>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} group-hover:text-red-500 transition-colors`}>Kabar Duka</h2>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Lapor warga meninggal dunia</p>
            </div>
            <div className={`${darkMode ? 'bg-slate-700' : 'bg-white'} p-4 rounded-full shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors text-red-600`}>
              <Megaphone className="w-7 h-7" />
            </div>
          </div>
        </Link>

        {/* Tombol 2: Warga Sakit */}
        <Link href="/lapor/sakit" className="group">
          <div className={`${darkMode ? 'bg-amber-900/30 border-l-amber-500' : 'bg-amber-50 border-l-amber-500'} border-l-8 rounded-xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-between`}>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} group-hover:text-amber-500 transition-colors`}>Warga Sakit</h2>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Butuh bantuan medis / ambulans</p>
            </div>
            <div className={`${darkMode ? 'bg-slate-700' : 'bg-white'} p-4 rounded-full shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-500`}>
              <HeartPulse className="w-7 h-7" />
            </div>
          </div>
        </Link>

        {/* Tombol 3: Bencana / Darurat Lain */}
        <Link href="/lapor/bencana" className="group">
          <div className={`${darkMode ? 'bg-blue-900/30 border-l-blue-500' : 'bg-blue-50 border-l-blue-600'} border-l-8 rounded-xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-between`}>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} group-hover:text-blue-500 transition-colors`}>Bencana & Darurat</h2>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Banjir, kebakaran, pencurian</p>
            </div>
            <div className={`${darkMode ? 'bg-slate-700' : 'bg-white'} p-4 rounded-full shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600`}>
              <AlertTriangle className="w-7 h-7" />
            </div>
          </div>
        </Link>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          <Link href="/bank-sampah" className={`flex flex-col items-center p-2 rounded-xl ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}>
            <Recycle className="w-5 h-5 text-green-500 mb-1" />
            <span className={`text-[10px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Sampah</span>
          </Link>
          <Link href="/interaksi-warga" className={`flex flex-col items-center p-2 rounded-xl ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}>
            <HandHeart className="w-5 h-5 text-purple-500 mb-1" />
            <span className={`text-[10px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Interaksi</span>
          </Link>
          <Link href="/koropak" className={`flex flex-col items-center p-2 rounded-xl ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}>
            <PiggyBank className="w-5 h-5 text-amber-500 mb-1" />
            <span className={`text-[10px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Koropak</span>
          </Link>
          <Link href="/forum" className={`flex flex-col items-center p-2 rounded-xl ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}>
            <MessageSquare className="w-5 h-5 text-indigo-500 mb-1" />
            <span className={`text-[10px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Forum</span>
          </Link>
          <Link href="/pengumuman" className={`flex flex-col items-center p-2 rounded-xl ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}>
            <Bell className="w-5 h-5 text-orange-500 mb-1" />
            <span className={`text-[10px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Info</span>
          </Link>
        </div>

      </div>

      {/* Footer / Quick Info */}
      <footer className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} p-6 text-center text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'} pb-8`}>
        <p>Dalam keadaan sangat darurat, segera hubungi 112</p>
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          <a href="tel:08123456789" className={`${darkMode ? 'bg-slate-700 text-white' : 'bg-white'} px-3 py-2 rounded-full border shadow-sm flex items-center gap-2 hover:opacity-80`}>
            <Phone className="w-4 h-4 text-green-600" />
            <span>Kontak RT</span>
          </a>
          <Link href="/admin" className={`${darkMode ? 'bg-slate-700 text-white' : 'bg-white'} px-3 py-2 rounded-full border shadow-sm flex items-center gap-2 hover:opacity-80`}>
            <Info className="w-4 h-4 text-blue-600" />
            <span>Admin</span>
          </Link>
        </div>
      </footer>

      {/* Notification Permission Prompt */}
      <NotificationPrompt />
    </main>
  );
}
