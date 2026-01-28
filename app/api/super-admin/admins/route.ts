import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAuth, hashPassword } from '@/lib/auth';

// GET - Get all admin users
export async function GET() {
    try {
        await requireAuth(['SUPER_ADMIN']);

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('admin_users')
            .select(`
                id, email, nama, role, rt_id, no_hp, avatar_url, is_active, last_login, created_at,
                rt_unit:rt_units(id, nama, nomor_rt, nomor_rw)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
    try {
        await requireAuth(['SUPER_ADMIN']);

        const body = await request.json();
        const { email, password, nama, role, rt_id, no_hp } = body;

        if (!email || !password || !nama) {
            return NextResponse.json({ success: false, error: 'Email, password, dan nama wajib diisi' }, { status: 400 });
        }

        if (role === 'ADMIN_RT' && !rt_id) {
            return NextResponse.json({ success: false, error: 'Admin RT harus memilih RT' }, { status: 400 });
        }

        // Hash password
        const password_hash = await hashPassword(password);

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('admin_users')
            .insert({
                email: email.toLowerCase(),
                password_hash,
                nama,
                role: role || 'ADMIN_RT',
                rt_id: role === 'SUPER_ADMIN' ? null : rt_id,
                no_hp,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
            }
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin berhasil ditambahkan',
            data
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal menambah admin' }, { status: 500 });
    }
}

// PUT - Update admin user
export async function PUT(request: NextRequest) {
    try {
        await requireAuth(['SUPER_ADMIN']);

        const body = await request.json();
        const { id, email, password, nama, role, rt_id, no_hp, is_active } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            email: email?.toLowerCase(),
            nama,
            role,
            rt_id: role === 'SUPER_ADMIN' ? null : rt_id,
            no_hp,
            is_active,
            updated_at: new Date().toISOString()
        };

        // Only update password if provided
        if (password) {
            updateData.password_hash = await hashPassword(password);
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) delete updateData[key];
        });

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('admin_users')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin berhasil diupdate',
            data
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal update admin' }, { status: 500 });
    }
}

// DELETE - Deactivate admin user
export async function DELETE(request: NextRequest) {
    try {
        const session = await requireAuth(['SUPER_ADMIN']);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
        }

        // Prevent self-deactivation
        if (id === session.id) {
            return NextResponse.json({ success: false, error: 'Tidak bisa menonaktifkan akun sendiri' }, { status: 400 });
        }

        const supabase = getSupabase();
        const { error } = await supabase
            .from('admin_users')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin berhasil dinonaktifkan'
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal menonaktifkan admin' }, { status: 500 });
    }
}
