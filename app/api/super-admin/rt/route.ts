import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET - Get all RT units
export async function GET() {
    try {
        await requireAuth(['SUPER_ADMIN']);

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('rt_units')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// POST - Create new RT unit
export async function POST(request: NextRequest) {
    try {
        await requireAuth(['SUPER_ADMIN']);

        const body = await request.json();
        const { nomor_rt, nomor_rw, kelurahan, kecamatan, kota, alamat_lengkap } = body;

        if (!nomor_rt || !nomor_rw) {
            return NextResponse.json({ success: false, error: 'Nomor RT dan RW wajib diisi' }, { status: 400 });
        }

        const nama = `RT ${nomor_rt} / RW ${nomor_rw}`;

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('rt_units')
            .insert({
                nama,
                nomor_rt,
                nomor_rw,
                kelurahan,
                kecamatan,
                kota,
                alamat_lengkap,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'RT berhasil ditambahkan',
            data
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal menambah RT' }, { status: 500 });
    }
}

// PUT - Update RT unit
export async function PUT(request: NextRequest) {
    try {
        await requireAuth(['SUPER_ADMIN']);

        const body = await request.json();
        const { id, nomor_rt, nomor_rw, kelurahan, kecamatan, kota, alamat_lengkap, is_active } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        const nama = `RT ${nomor_rt} / RW ${nomor_rw}`;

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('rt_units')
            .update({
                nama,
                nomor_rt,
                nomor_rw,
                kelurahan,
                kecamatan,
                kota,
                alamat_lengkap,
                is_active,
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
            message: 'RT berhasil diupdate',
            data
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal update RT' }, { status: 500 });
    }
}

// DELETE - Deactivate RT unit
export async function DELETE(request: NextRequest) {
    try {
        await requireAuth(['SUPER_ADMIN']);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        const supabase = getSupabase();
        const { error } = await supabase
            .from('rt_units')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'RT berhasil dinonaktifkan'
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal menonaktifkan RT' }, { status: 500 });
    }
}
