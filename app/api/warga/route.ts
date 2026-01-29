import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// POST - Register warga baru (public)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { rt_id, no_kk, nama_kepala_keluarga, no_hp, alamat } = body;

        if (!rt_id || !no_kk || !nama_kepala_keluarga || !no_hp) {
            return NextResponse.json({
                success: false,
                error: 'RT, No. KK, Nama Kepala Keluarga, dan No. HP wajib diisi'
            }, { status: 400 });
        }

        const supabase = getSupabase();

        // Check RT exists and get quota
        const { data: rtData, error: rtError } = await supabase
            .from('rt_units')
            .select('id, nama, kuota_kk')
            .eq('id', rt_id)
            .eq('is_active', true)
            .single();

        if (rtError || !rtData) {
            return NextResponse.json({
                success: false,
                error: 'RT tidak ditemukan'
            }, { status: 404 });
        }

        // Check current warga count
        const { count: currentCount, error: countError } = await supabase
            .from('warga')
            .select('*', { count: 'exact', head: true })
            .eq('rt_id', rt_id)
            .eq('is_active', true);

        if (countError) {
            return NextResponse.json({
                success: false,
                error: 'Gagal memeriksa kuota'
            }, { status: 500 });
        }

        const kuota = rtData.kuota_kk || 100;
        if ((currentCount || 0) >= kuota) {
            return NextResponse.json({
                success: false,
                error: `Kuota warga ${rtData.nama} sudah penuh (${kuota} KK)`
            }, { status: 400 });
        }

        // Check if KK already registered in this RT
        const { data: existingWarga } = await supabase
            .from('warga')
            .select('id')
            .eq('rt_id', rt_id)
            .eq('no_kk', no_kk)
            .single();

        if (existingWarga) {
            return NextResponse.json({
                success: false,
                error: 'No. KK sudah terdaftar di RT ini'
            }, { status: 400 });
        }

        // Register warga
        const { data, error } = await supabase
            .from('warga')
            .insert({
                rt_id,
                no_kk,
                nama_kepala_keluarga,
                no_hp,
                alamat,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            console.error('Insert error:', error);
            return NextResponse.json({
                success: false,
                error: 'Gagal mendaftarkan warga'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Berhasil terdaftar!',
            data
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Terjadi kesalahan'
        }, { status: 500 });
    }
}

// GET - Check registration status (Public) OR List Warga (Admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const no_kk = searchParams.get('no_kk');
        const rt_id = searchParams.get('rt_id');

        // Case 1: Public Check (Requires No. KK)
        if (no_kk) {
            const supabase = getSupabase();

            let query = supabase
                .from('warga')
                .select('*, rt_unit:rt_units(nama, nomor_rt, nomor_rw)')
                .eq('no_kk', no_kk)
                .eq('is_active', true);

            if (rt_id) {
                query = query.eq('rt_id', rt_id);
            }

            const { data, error } = await query.single();

            if (error || !data) {
                return NextResponse.json({
                    success: true,
                    registered: false,
                    message: 'No. KK belum terdaftar'
                });
            }

            return NextResponse.json({
                success: true,
                registered: true,
                data
            });
        }

        // Case 2: Admin List Warga (Requires Auth)
        try {
            // Lazy import to avoid circular dependency issues if any, or just standard import usage
            const { requireAuth } = await import('@/lib/auth');
            const session = await requireAuth();

            const supabase = getSupabase();
            let query = supabase
                .from('warga')
                .select('*, rt_unit:rt_units(nama)')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            // Security: Multi-Tenancy Filtering
            if (session.role === 'SUPER_ADMIN') {
                if (rt_id) {
                    query = query.eq('rt_id', rt_id);
                }
            } else {
                // Admin RT
                if (!session.rt_id) {
                    return NextResponse.json({ success: false, data: [] });
                }
                query = query.eq('rt_id', session.rt_id);
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

        } catch (authError) {
            // If auth fails for listing, return 401
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Terjadi kesalahan'
        }, { status: 500 });
    }
}
