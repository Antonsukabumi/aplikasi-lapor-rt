import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import type { StatusLaporan } from '@/types';

type RouteParams = {
    params: Promise<{ id: string }>;
};

// GET - Get single laporan
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth(); // Require login
        const { id } = await params;
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('laporan')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ success: false, error: 'Laporan tidak ditemukan' }, { status: 404 });
        }

        // Security: Multi-Tenancy Check
        if (session.role !== 'SUPER_ADMIN') {
            // If Admin RT, ensure report belongs to their RT
            if (data.rt_id && data.rt_id !== session.rt_id) {
                return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
            }
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('API error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

// PATCH - Update laporan (Status, Balasan)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth(); // Require login
        const { id } = await params;
        const body = await request.json();

        // Fields to update
        const { status, balasan } = body;

        const supabase = getSupabase();

        // 1. Fetch existing report to verify permissions
        const { data: existing, error: fetchError } = await supabase
            .from('laporan')
            .select('rt_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json({ success: false, error: 'Laporan tidak ditemukan' }, { status: 404 });
        }

        // 2. Security Check
        if (session.role !== 'SUPER_ADMIN') {
            if (existing.rt_id && existing.rt_id !== session.rt_id) {
                return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
            }
        }

        // 3. Prepare Update Data
        const updateData: any = {
            updated_at: new Date().toISOString(),
            admin_id: session.id // Track who updated it
        };

        if (status) updateData.status = status;
        if (balasan) updateData.balasan = balasan;

        // 4. Perform Update
        const { data, error } = await supabase
            .from('laporan')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Laporan berhasil diupdate',
            data
        });

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('API error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
