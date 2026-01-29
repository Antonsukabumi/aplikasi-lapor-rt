import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET - List warga for Admin RT
export async function GET() {
    try {
        const session = await requireAuth(['ADMIN_RT', 'SUPER_ADMIN']);

        const supabase = getSupabase();

        let query = supabase
            .from('warga')
            .select('*')
            .order('created_at', { ascending: false });

        // Admin RT only sees their RT warga
        if (session.role === 'ADMIN_RT' && session.rt_id) {
            query = query.eq('rt_id', session.rt_id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Get quota info
        let quotaInfo = null;
        if (session.rt_id) {
            const { data: rtData } = await supabase
                .from('rt_units')
                .select('kuota_kk')
                .eq('id', session.rt_id)
                .single();

            const activeCount = data?.filter(w => w.is_active).length || 0;
            quotaInfo = {
                kuota: rtData?.kuota_kk || 100,
                terpakai: activeCount,
                tersedia: (rtData?.kuota_kk || 100) - activeCount
            };
        }

        return NextResponse.json({
            success: true,
            data: data || [],
            quota: quotaInfo
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// POST - Admin add warga manually
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['ADMIN_RT', 'SUPER_ADMIN']);

        const body = await request.json();
        const { no_kk, nama_kepala_keluarga, no_hp, alamat, rt_id } = body;

        if (!no_kk || !nama_kepala_keluarga || !no_hp) {
            return NextResponse.json({
                success: false,
                error: 'No. KK, Nama, dan No. HP wajib diisi'
            }, { status: 400 });
        }

        // Admin RT uses their own rt_id
        const targetRtId = session.role === 'ADMIN_RT' ? session.rt_id : rt_id;

        if (!targetRtId) {
            return NextResponse.json({
                success: false,
                error: 'RT ID diperlukan'
            }, { status: 400 });
        }

        const supabase = getSupabase();

        // Check quota
        const { data: rtData } = await supabase
            .from('rt_units')
            .select('kuota_kk, nama')
            .eq('id', targetRtId)
            .single();

        const { count } = await supabase
            .from('warga')
            .select('*', { count: 'exact', head: true })
            .eq('rt_id', targetRtId)
            .eq('is_active', true);

        const kuota = rtData?.kuota_kk || 100;
        if ((count || 0) >= kuota) {
            return NextResponse.json({
                success: false,
                error: `Kuota warga sudah penuh (${kuota} KK)`
            }, { status: 400 });
        }

        // Insert warga
        const { data, error } = await supabase
            .from('warga')
            .insert({
                rt_id: targetRtId,
                no_kk,
                nama_kepala_keluarga,
                no_hp,
                alamat,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({
                    success: false,
                    error: 'No. KK sudah terdaftar'
                }, { status: 400 });
            }
            console.error('Insert error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Warga berhasil ditambahkan',
            data
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal menambah warga' }, { status: 500 });
    }
}

// DELETE - Admin remove warga
export async function DELETE(request: NextRequest) {
    try {
        await requireAuth(['ADMIN_RT', 'SUPER_ADMIN']);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        const supabase = getSupabase();
        const { error } = await supabase
            .from('warga')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Warga berhasil dihapus'
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal menghapus warga' }, { status: 500 });
    }
}
