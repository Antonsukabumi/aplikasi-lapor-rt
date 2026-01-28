// Notification helper utilities

export async function sendNotification(title: string, body: string, url?: string) {
    // Check if service worker and notifications are supported
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        console.log('Push notifications not supported');
        return false;
    }

    // Check permission
    if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'laporan-' + Date.now(),
            requireInteraction: true,
            data: { url: url || '/admin' }
        });

        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

// Send notification for new reports
export async function notifyNewReport(jenis: string, nama: string) {
    const jenisLabels: Record<string, string> = {
        meninggal: '🕊️ Kabar Duka',
        sakit: '🏥 Warga Sakit',
        bencana: '🚨 Bencana/Darurat'
    };

    const title = jenisLabels[jenis] || 'Laporan Baru';
    const body = `Laporan baru dari ${nama}. Segera tindak lanjuti.`;

    return sendNotification(title, body, '/admin');
}

// Send notification for announcements
export async function notifyAnnouncement(title: string, content: string) {
    return sendNotification(`📢 ${title}`, content, '/pengumuman');
}

// Send notification for Koropak donations
export async function notifyKoropakDonation(nama: string, jumlah: number) {
    return sendNotification(
        '🏺 Iuran Koropak Baru',
        `${nama} baru saja iuran Rp ${jumlah.toLocaleString()}`,
        '/admin/koropak'
    );
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
}

// Check if notifications are enabled
export function isNotificationEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
}
