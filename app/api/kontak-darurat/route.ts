import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get all active kontak darurat
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('kontak_darurat')
            .select('*')
            .eq('aktif', true)
            .order('kategori', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching kontak:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// POST - Add new kontak
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama, nomor, kategori, keterangan } = body;

        if (!nama || !nomor || !kategori) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('kontak_darurat')
            .insert({
                nama,
                nomor,
                kategori,
                keterangan: keterangan || null,
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
            message: 'Kontak berhasil ditambahkan',
            data
        });
    } catch (error) {
        console.error('Error adding kontak:', error);
        return NextResponse.json({ success: false, error: 'Gagal menambah kontak' }, { status: 500 });
    }
}

// PUT - Update kontak
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, nama, nomor, kategori, keterangan } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('kontak_darurat')
            .update({
                nama,
                nomor,
                kategori,
                keterangan
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
            message: 'Kontak berhasil diupdate',
            data
        });
    } catch (error) {
        console.error('Error updating kontak:', error);
        return NextResponse.json({ success: false, error: 'Gagal update kontak' }, { status: 500 });
    }
}

// DELETE - Soft delete kontak
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        const { error } = await supabase
            .from('kontak_darurat')
            .update({ aktif: false })
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Kontak berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting kontak:', error);
        return NextResponse.json({ success: false, error: 'Gagal menghapus kontak' }, { status: 500 });
    }
}
