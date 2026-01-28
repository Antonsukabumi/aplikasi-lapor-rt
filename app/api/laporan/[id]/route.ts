import { NextRequest, NextResponse } from 'next/server';
import { getLaporanById, updateLaporan } from '@/lib/local-db';
import type { StatusLaporan } from '@/types/database';

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const data = await getLaporanById(id);

        if (!data) {
            return NextResponse.json(
                { error: 'Laporan tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: {
            status?: StatusLaporan;
            balasan?: string;
            admin_id?: string;
        } = {};

        if (body.status) {
            updateData.status = body.status as StatusLaporan;
        }
        if (body.balasan) {
            updateData.balasan = body.balasan;
        }
        if (body.admin_id) {
            updateData.admin_id = body.admin_id;
        }

        const data = await updateLaporan(id, updateData);

        if (!data) {
            return NextResponse.json(
                { error: 'Laporan tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Laporan berhasil diupdate',
            data: data
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
