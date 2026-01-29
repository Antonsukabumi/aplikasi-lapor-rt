import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'lapor-rt-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
    // Paths to protect
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
    const isSuperAdminPath = request.nextUrl.pathname.startsWith('/super-admin');

    if (isAdminPath || isSuperAdminPath) {
        const token = request.cookies.get('admin_session')?.value;

        if (!token) {
            const url = new URL('/login', request.url);
            url.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const role = payload.role as string;

            // Protect Super Admin routes
            if (isSuperAdminPath && role !== 'SUPER_ADMIN') {
                // If not super admin, redirect to regular admin or error
                return NextResponse.redirect(new URL('/admin', request.url));
            }

            // Allow access
            return NextResponse.next();

        } catch (error) {
            // Invalid token
            const url = new URL('/login', request.url);
            url.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/super-admin/:path*'],
};
