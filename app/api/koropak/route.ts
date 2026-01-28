import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get koropak data
export async function GET() {
    try {
        // Get settings
        const { data: settings } = await supabase
            .from('koropak_settings')
            .select('*')
            .eq('id', 1)
            .single();

        // Get donatur list
        const { data: donatur } = await supabase
            .from('koropak_donatur')
            .select('*')
            .order('total_nominal', { ascending: false });

        // Get penyaluran history
        const { data: penyaluran } = await supabase
            .from('koropak_penyaluran')
            .select('*')
            .order('created_at', { ascending: false });

        // Count total donatur
        const totalDonatur = donatur?.length || 0;

        return NextResponse.json({
            success: true,
            data: {
                total_terkumpul: settings?.total_terkumpul || 0,
                target_bulanan: settings?.target_bulanan || 500000,
                iuran_harian: settings?.iuran_harian || 500,
                total_donatur: totalDonatur,
                bulan_aktif: settings?.bulan_aktif || 'Januari 2026',
                riwayat_penyaluran: penyaluran || [],
                donatur: donatur || []
            }
        });
    } catch (error) {
        console.error('Error fetching koropak data:', error);
        return NextResponse.json({ success: false, error: 'Gagal membaca data' }, { status: 500 });
    }
}

// POST - Add new donation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama, jumlah_hari } = body;

        if (!nama || !jumlah_hari) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
        }

        // Get current iuran_harian
        const { data: settings } = await supabase
            .from('koropak_settings')
            .select('iuran_harian, total_terkumpul')
            .eq('id', 1)
            .single();

        const iuranHarian = settings?.iuran_harian || 500;
        const nominal = jumlah_hari * iuranHarian;

        // Check if donatur exists
        const { data: existingDonatur } = await supabase
            .from('koropak_donatur')
            .select('*')
            .ilike('nama', nama)
            .single();

        if (existingDonatur) {
            // Update existing donatur
            await supabase
                .from('koropak_donatur')
                .update({
                    total_hari: existingDonatur.total_hari + jumlah_hari,
                    total_nominal: existingDonatur.total_nominal + nominal,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingDonatur.id);
        } else {
            // Insert new donatur
            await supabase
                .from('koropak_donatur')
                .insert({
                    nama,
                    total_hari: jumlah_hari,
                    total_nominal: nominal
                });
        }

        // Update total terkumpul
        await supabase
            .from('koropak_settings')
            .update({
                total_terkumpul: (settings?.total_terkumpul || 0) + nominal,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        return NextResponse.json({
            success: true,
            message: `Terima kasih ${nama}! Iuran Rp ${nominal.toLocaleString()} tercatat.`
        });
    } catch (error) {
        console.error('Error adding donation:', error);
        return NextResponse.json({ success: false, error: 'Gagal menambah donasi' }, { status: 500 });
    }
}

// PUT - Add disbursement (penyaluran)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { penerima, keperluan, jumlah, keterangan } = body;

        if (!penerima || !keperluan || !jumlah) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
        }

        // Get current total
        const { data: settings } = await supabase
            .from('koropak_settings')
            .select('total_terkumpul')
            .eq('id', 1)
            .single();

        if (jumlah > (settings?.total_terkumpul || 0)) {
            return NextResponse.json({ success: false, error: 'Dana tidak mencukupi' }, { status: 400 });
        }

        // Insert penyaluran record
        await supabase
            .from('koropak_penyaluran')
            .insert({
                penerima,
                keperluan,
                jumlah,
                keterangan: keterangan || null
            });

        // Deduct from total
        await supabase
            .from('koropak_settings')
            .update({
                total_terkumpul: (settings?.total_terkumpul || 0) - jumlah,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        return NextResponse.json({
            success: true,
            message: `Dana Rp ${jumlah.toLocaleString()} berhasil disalurkan ke ${penerima}`
        });
    } catch (error) {
        console.error('Error adding disbursement:', error);
        return NextResponse.json({ success: false, error: 'Gagal menyalurkan dana' }, { status: 500 });
    }
}
