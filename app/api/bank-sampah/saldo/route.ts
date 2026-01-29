import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET - Get Saldo (User sees own, Admin sees specific user's)
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);
        let wargaId = searchParams.get('warga_id');

        const supabase = getSupabase();

        // Security
        if (session.role === 'ADMIN_RT' || session.role === 'SUPER_ADMIN') {
            if (!wargaId) {
                return NextResponse.json({ success: false, error: 'Warga ID diperlukan untuk Admin' }, { status: 400 });
            }
        } else {
            // Normal user (Future proofing)
            // TODO: if we have user session, set wargaId = session.warga_id
            // For now, assume this API is mainly for admin dashboard or secured frontend
        }

        const { data, error } = await supabase
            .from('bank_sampah_saldo')
            .select('*')
            .eq('warga_id', wargaId!)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error('Supabase fetch error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Return 0 if not found
        const saldo = data || { total_poin: 0, total_uang: 0 };

        return NextResponse.json({
            success: true,
            data: saldo
        });

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
