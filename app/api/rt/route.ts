import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// GET - Get all active RT units (public)
export async function GET() {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('rt_units')
            .select('id, nama, nomor_rt, nomor_rw, kelurahan, kecamatan, kota, kuota_kk')
            .eq('is_active', true)
            .order('nomor_rw', { ascending: true })
            .order('nomor_rt', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}
