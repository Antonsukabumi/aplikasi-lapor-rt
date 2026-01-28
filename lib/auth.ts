import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { getSupabase } from './supabase';
import type { AdminSession, AdminRole } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'lapor-rt-secret-key-change-in-production'
);

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Hash password using simple approach (use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or argon2
    // For now, use a simple hash
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Buffer.from(hash).toString('hex');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

// Create JWT token
export async function createToken(payload: AdminSession): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<AdminSession | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as AdminSession;
    } catch {
        return null;
    }
}

// Login function
export async function login(email: string, password: string): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    try {
        const supabase = getSupabase();

        // Find admin user
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select(`
                *,
                rt_unit:rt_units(*)
            `)
            .eq('email', email.toLowerCase())
            .eq('is_active', true)
            .single();

        if (error || !admin) {
            return { success: false, error: 'Email atau password salah' };
        }

        // Verify password
        const isValid = await verifyPassword(password, admin.password_hash);
        if (!isValid) {
            return { success: false, error: 'Email atau password salah' };
        }

        // Create session
        const session: AdminSession = {
            id: admin.id,
            email: admin.email,
            nama: admin.nama,
            role: admin.role,
            rt_id: admin.rt_id,
            rt_info: admin.rt_unit ? {
                nama: admin.rt_unit.nama,
                nomor_rt: admin.rt_unit.nomor_rt,
                nomor_rw: admin.rt_unit.nomor_rw,
                kelurahan: admin.rt_unit.kelurahan,
            } : undefined,
        };

        // Create token and set cookie
        const token = await createToken(session);
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
            path: '/',
        });

        // Update last_login
        await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', admin.id);

        return { success: true, session };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Terjadi kesalahan saat login' };
    }
}

// Logout function
export async function logout(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

// Get current session
export async function getSession(): Promise<AdminSession | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;

        if (!token) {
            return null;
        }

        return await verifyToken(token);
    } catch {
        return null;
    }
}

// Require authentication (throws if not authenticated)
export async function requireAuth(allowedRoles?: AdminRole[]): Promise<AdminSession> {
    const session = await getSession();

    if (!session) {
        throw new Error('Unauthorized: Please login first');
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
        throw new Error('Forbidden: You do not have permission to access this resource');
    }

    return session;
}

// Check if user is Super Admin
export async function isSuperAdmin(): Promise<boolean> {
    const session = await getSession();
    return session?.role === 'SUPER_ADMIN';
}

// Check if user is Admin RT for specific RT
export async function isRtAdmin(rtId: string): Promise<boolean> {
    const session = await getSession();
    if (!session) return false;
    if (session.role === 'SUPER_ADMIN') return true;
    return session.rt_id === rtId;
}
