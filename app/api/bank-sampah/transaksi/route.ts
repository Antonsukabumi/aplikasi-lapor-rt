import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET - List Transactions (Admin sees RT's, User sees own)
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);
        const wargaId = searchParams.get('warga_id');
        const limit = parseInt(searchParams.get('limit') || '20');

        const supabase = getSupabase();
        let query = supabase
            .from('bank_sampah_transaksi')
            .select(`
                *,
                jenis_sampah:jenis_sampah_id (nama, icon),
                warga:warga_id (nama, alamat)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        // Security & Filtering
        if (session.role === 'SUPER_ADMIN') {
            // Can see all
            if (wargaId) query = query.eq('warga_id', wargaId);
        } else if (session.role === 'ADMIN_RT') {
            // Can see own RT only
            if (session.rt_id) {
                query = query.eq('rt_id', session.rt_id);
            }
            if (wargaId) query = query.eq('warga_id', wargaId);
        } else {
            // Normal user (if we had user auth) - currently this API is mostly for Admin
            // For now, if no role matches known ones, return empty or error
            // Assuming this endpoint is for ALL admins
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase fetch error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST - Create Transaction (Deposit Waste)
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();
        const { warga_id, jenis_sampah_id, berat_kg } = body;

        if (!warga_id || !jenis_sampah_id || !berat_kg) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
        }

        const supabase = getSupabase();

        // 1. Get Jenis Sampah info (Price & Points)
        const { data: jenis, error: jenisError } = await supabase
            .from('jenis_sampah')
            .select('*')
            .eq('id', jenis_sampah_id)
            .single();

        if (jenisError || !jenis) {
            return NextResponse.json({ success: false, error: 'Jenis sampah tidak ditemukan' }, { status: 400 });
        }

        // 2. Calculate Total
        const total_uang = Math.floor(jenis.harga * berat_kg);
        const total_poin = Math.floor(jenis.poin * berat_kg);

        // 3. Start Transaction (Insert Log + Update Saldo)
        // Note: Supabase doesn't support transactions in JS client easily without RPC.
        // We will do two operations. If second fails, it's an issue. 
        // Ideal: Use RPC. For now: Sequential.

        // A. Insert Transaction
        const { data: trx, error: trxError } = await supabase
            .from('bank_sampah_transaksi')
            .insert({
                warga_id,
                jenis_sampah_id,
                berat_kg,
                poin: total_poin,
                uang: total_uang,
                status: 'SELESAI', // Admin direct deposit is always 'SELESAI'
                admin_id: session.id, // Who processed it
                rt_id: session.rt_id // Attach to Admin's RT
            })
            .select()
            .single();

        if (trxError) {
            throw new Error(`Gagal simpan transaksi: ${trxError.message}`);
        }

        // B. Update/Upsert Saldo
        // First check existing saldo
        const { data: existSaldo } = await supabase
            .from('bank_sampah_saldo')
            .select('*')
            .eq('warga_id', warga_id)
            .single();

        let saldoError;

        if (existSaldo) {
            // Update
            const { error } = await supabase
                .from('bank_sampah_saldo')
                .update({
                    total_poin: existSaldo.total_poin + total_poin,
                    total_uang: existSaldo.total_uang + total_uang,
                    updated_at: new Date().toISOString()
                })
                .eq('warga_id', warga_id);
            saldoError = error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('bank_sampah_saldo')
                .insert({
                    warga_id,
                    total_poin,
                    total_uang
                });
            saldoError = error;
        }

        if (saldoError) {
            // Ideally rollback A, but for MVP we log error.
            console.error('CRITICAL: Failed to update saldo after transaction!', saldoError);
            return NextResponse.json({ warning: 'Transaksi tercatat tapi saldo gagal update. Hubungi developer.' }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            message: 'Setoran berhasil dicatat',
            data: {
                transaksi: trx,
                totals: { poin: total_poin, uang: total_uang }
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
