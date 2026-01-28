import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';

// GET - Get current admin profile
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('admin_users')
            .select(`
                id, email, nama, role, rt_id, no_hp, avatar_url, last_login, created_at,
                rt_unit:rt_units(id, nama, nomor_rt, nomor_rw, kelurahan, kecamatan, kota)
            `)
            .eq('id', session.id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// PUT - Update current admin profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { nama, no_hp, current_password, new_password } = body;

        const supabase = getSupabase();
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        };

        // Update nama and no_hp if provided
        if (nama) updateData.nama = nama;
        if (no_hp !== undefined) updateData.no_hp = no_hp;

        // Handle password change
        if (current_password && new_password) {
            // Verify current password
            const { data: admin } = await supabase
                .from('admin_users')
                .select('password_hash')
                .eq('id', session.id)
                .single();

            if (!admin) {
                return NextResponse.json({ success: false, error: 'Admin tidak ditemukan' }, { status: 404 });
            }

            const isValid = await verifyPassword(current_password, admin.password_hash);
            if (!isValid) {
                return NextResponse.json({ success: false, error: 'Password saat ini salah' }, { status: 400 });
            }

            // Hash new password
            updateData.password_hash = await hashPassword(new_password);
        }

        const { data, error } = await supabase
            .from('admin_users')
            .update(updateData)
            .eq('id', session.id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memperbarui profil' }, { status: 500 });
    }
}
