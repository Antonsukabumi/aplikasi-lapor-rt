import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// POST - Register as Admin RT (pending approval)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama, email, password, no_hp, rt_id } = body;

        if (!nama || !email || !password || !rt_id) {
            return NextResponse.json({
                success: false,
                error: 'Nama, Email, Password, dan RT wajib diisi'
            }, { status: 400 });
        }

        const supabase = getSupabase();

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: 'Email sudah terdaftar'
            }, { status: 400 });
        }

        // Check if RT exists
        const { data: rtData } = await supabase
            .from('rt_units')
            .select('id, nama')
            .eq('id', rt_id)
            .eq('is_active', true)
            .single();

        if (!rtData) {
            return NextResponse.json({
                success: false,
                error: 'RT tidak ditemukan'
            }, { status: 404 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin with PENDING status
        const { data, error } = await supabase
            .from('admin_users')
            .insert({
                nama,
                email,
                password: hashedPassword,
                no_hp,
                role: 'ADMIN_RT',
                rt_id,
                is_active: false, // Pending approval
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id, nama, email, role')
            .single();

        if (error) {
            console.error('Insert error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Pendaftaran berhasil! Menunggu persetujuan Super Admin.',
            data
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mendaftar' }, { status: 500 });
    }
}
