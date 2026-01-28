import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Lapor Pak RT",
    description: "Aplikasi pelaporan warga untuk RT/RW - Cepat, Mudah, Aman",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Lapor RT",
    },
    icons: {
        icon: "/icons/icon-192.png",
        apple: "/icons/icon-192.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#0f172a",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
            </head>
            <body className={`${outfit.className} bg-slate-100 antialiased`}>
                {children}

                {/* Register Service Worker */}
                <Script id="sw-register" strategy="afterInteractive">
                    {`
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', function() {
                                navigator.serviceWorker.register('/sw.js')
                                    .then(function(registration) {
                                        console.log('SW registered:', registration.scope);
                                    })
                                    .catch(function(error) {
                                        console.log('SW registration failed:', error);
                                    });
                            });
                        }
                    `}
                </Script>
            </body>
        </html>
    );
}
