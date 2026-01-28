import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get all active jenis sampah
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('jenis_sampah')
            .select('*')
            .eq('aktif', true)
            .order('nama', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching jenis sampah:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// POST - Add new jenis sampah
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama, harga, poin, icon } = body;

        if (!nama || !harga || !poin || !icon) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('jenis_sampah')
            .insert({
                nama,
                harga,
                poin,
                icon,
                aktif: true
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Jenis sampah berhasil ditambahkan',
            data
        });
    } catch (error) {
        console.error('Error adding jenis sampah:', error);
        return NextResponse.json({ success: false, error: 'Gagal menambah data' }, { status: 500 });
    }
}

// PUT - Update jenis sampah
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, nama, harga, poin, icon } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('jenis_sampah')
            .update({ nama, harga, poin, icon })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Jenis sampah berhasil diupdate',
            data
        });
    } catch (error) {
        console.error('Error updating jenis sampah:', error);
        return NextResponse.json({ success: false, error: 'Gagal update data' }, { status: 500 });
    }
}

// DELETE - Soft delete jenis sampah
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        const { error } = await supabase
            .from('jenis_sampah')
            .update({ aktif: false })
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Jenis sampah berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting jenis sampah:', error);
        return NextResponse.json({ success: false, error: 'Gagal menghapus data' }, { status: 500 });
    }
}
