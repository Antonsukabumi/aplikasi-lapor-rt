import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Tidak ada sesi aktif' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan' },
            { status: 500 }
        );
    }
}
