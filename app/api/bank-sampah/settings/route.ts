import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get bank sampah settings
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('bank_sampah_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            // If no data, return default
            if (error.code === 'PGRST116') {
                return NextResponse.json({
                    success: true,
                    data: {
                        nama_pengelola: 'Bu Rina',
                        no_wa: '081234567890',
                        alamat: 'Pos RT 05, Jl. Mawar No. 10',
                        jam_operasional: 'Sabtu, 08:00-11:00 WIB',
                        minimal_pickup: 5
                    }
                });
            }
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// PUT - Update bank sampah settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama_pengelola, no_wa, alamat, jam_operasional, minimal_pickup } = body;

        // Try to update existing record
        const { data: existingData } = await supabase
            .from('bank_sampah_settings')
            .select('id')
            .eq('id', 1)
            .single();

        let result;

        if (existingData) {
            // Update existing
            result = await supabase
                .from('bank_sampah_settings')
                .update({
                    nama_pengelola,
                    no_wa,
                    alamat,
                    jam_operasional,
                    minimal_pickup,
                    updated_at: new Date().toISOString()
                })
                .eq('id', 1)
                .select()
                .single();
        } else {
            // Insert new
            result = await supabase
                .from('bank_sampah_settings')
                .insert({
                    id: 1,
                    nama_pengelola,
                    no_wa,
                    alamat,
                    jam_operasional,
                    minimal_pickup
                })
                .select()
                .single();
        }

        if (result.error) {
            console.error('Supabase error:', result.error);
            return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Settings berhasil disimpan',
            data: result.data
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ success: false, error: 'Gagal menyimpan settings' }, { status: 500 });
    }
}
