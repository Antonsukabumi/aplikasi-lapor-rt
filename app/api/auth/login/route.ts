import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email dan password wajib diisi' },
                { status: 400 }
            );
        }

        const result = await login(email, password);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Login berhasil',
            data: result.session
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat login' },
            { status: 500 }
        );
    }
}
