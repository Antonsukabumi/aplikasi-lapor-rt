import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// GET - Public check saldo by Phone Number
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const no_hp = searchParams.get('no_hp');

        if (!no_hp) {
            return NextResponse.json({ success: false, error: 'Nomor HP diperlukan' }, { status: 400 });
        }

        const supabase = getSupabase();

        // 1. Find Warga by No HP
        // We use explicit select to avoid returning sensitive data if any
        const { data: warga, error: wargaError } = await supabase
            .from('warga')
            .select('id, nama')
            .eq('no_hp', no_hp) // Phone number must be exact match
            .single();

        if (wargaError || !warga) {
            return NextResponse.json({ success: false, error: 'Data warga tidak ditemukan dengan nomor HP tersebut' }, { status: 404 });
        }

        // 2. Get Saldo
        const { data: saldo } = await supabase
            .from('bank_sampah_saldo')
            .select('*')
            .eq('warga_id', warga.id)
            .single();

        // 3. Get Recent Transactions (Last 5)
        const { data: history } = await supabase
            .from('bank_sampah_transaksi')
            .select(`
                id, berat_kg, poin, uang, created_at,
                jenis_sampah:jenis_sampah_id (nama)
            `)
            .eq('warga_id', warga.id)
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            success: true,
            data: {
                warga: warga,
                saldo: saldo || { total_poin: 0, total_uang: 0 },
                history: history || []
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
