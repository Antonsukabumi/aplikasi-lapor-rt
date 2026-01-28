'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

export default function NotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Check if notifications are supported
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            return;
        }

        setPermission(Notification.permission);

        // Register service worker
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered:', registration);
                setSwRegistration(registration);
            })
            .catch((error) => {
                console.error('SW registration failed:', error);
            });

        // Show prompt if permission is default and user hasn't dismissed it
        const dismissed = localStorage.getItem('notification-prompt-dismissed');
        if (Notification.permission === 'default' && !dismissed) {
            setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
        }
    }, []);

    const requestPermission = async () => {
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Show a test notification
                if (swRegistration) {
                    swRegistration.showNotification('Notifikasi Aktif! 🎉', {
                        body: 'Anda akan menerima notifikasi saat ada laporan baru.',
                        icon: '/icons/icon-192x192.png',
                        badge: '/icons/icon-72x72.png',
                        tag: 'welcome'
                    });
                }
                setShowPrompt(false);
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
        }
    };

    const dismissPrompt = () => {
        setShowPrompt(false);
        localStorage.setItem('notification-prompt-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-2xl shadow-2xl p-4 z-50 border border-slate-200 animate-slide-up">
            <button
                onClick={dismissPrompt}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 mb-1">Aktifkan Notifikasi</h3>
                    <p className="text-sm text-slate-500 mb-3">
                        Dapatkan pemberitahuan langsung saat ada laporan baru atau pengumuman penting.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={requestPermission}
                            className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                        >
                            <Bell className="w-4 h-4" />
                            Aktifkan
                        </button>
                        <button
                            onClick={dismissPrompt}
                            className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-100 rounded-lg"
                        >
                            Nanti
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Notification Status Badge component
export function NotificationBadge() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    if (permission === 'granted') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <Bell className="w-3 h-3" />
                Notifikasi Aktif
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                <BellOff className="w-3 h-3" />
                Notifikasi Diblokir
            </div>
        );
    }

    return (
        <button
            onClick={requestPermission}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200"
        >
            <Bell className="w-3 h-3" />
            Aktifkan Notifikasi
        </button>
    );
}
