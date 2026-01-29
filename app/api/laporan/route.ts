import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET - Get all laporan (Secured Multi-Tenancy)
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth(); // Require login
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const jenis = searchParams.get('jenis');
        const rtIdParam = searchParams.get('rt_id');

        let query = supabase
            .from('laporan')
            .select('*')
            .order('created_at', { ascending: false });

        // Security: Multi-Tenancy Filtering
        if (session.role === 'SUPER_ADMIN') {
            // Super Admin can view all, or filter by specific rt_id if provided
            if (rtIdParam) {
                query = query.eq('rt_id', rtIdParam);
            }
        } else {
            // Admin RT can ONLY view their own RT's data
            if (!session.rt_id) {
                return NextResponse.json({ success: false, data: [] }); // Should not happen for active Admin RT
            }
            query = query.eq('rt_id', session.rt_id);
        }

        // Standard filters
        if (status && status !== 'semua') {
            query = query.eq('status', status.toUpperCase());
        }

        if (jenis) {
            query = query.eq('jenis', jenis.toUpperCase());
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error fetching laporan:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data laporan' }, { status: 500 });
    }
}

// POST - Create new laporan
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama_pelapor, no_hp_pelapor, lokasi, deskripsi, jenis } = body;

        if (!nama_pelapor || !lokasi || !deskripsi || !jenis) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('laporan')
            .insert({
                jenis: jenis.toUpperCase(),
                nama_pelapor,
                no_hp_pelapor: no_hp_pelapor || null,
                lokasi,
                deskripsi,
                status: 'BARU'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Laporan berhasil dikirim',
            data
        });
    } catch (error) {
        console.error('Error creating laporan:', error);
        return NextResponse.json({ success: false, error: 'Gagal membuat laporan' }, { status: 500 });
    }
}

// PUT - Update laporan status
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ success: false, error: 'ID dan status diperlukan' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('laporan')
            .update({
                status: status.toUpperCase(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Status berhasil diupdate',
            data
        });
    } catch (error) {
        console.error('Error updating laporan:', error);
        return NextResponse.json({ success: false, error: 'Gagal update status' }, { status: 500 });
    }
}
