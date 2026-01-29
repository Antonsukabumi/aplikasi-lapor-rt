import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET - List Pengumuman (Public or Secured)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rt_id = searchParams.get('rt_id');
        const limit = parseInt(searchParams.get('limit') || '10');

        const supabase = getSupabase();

        // Join with admin_users to filter by RT via admin
        // Note: Pengumuman table has admin_id. Admin belongs to RT.
        // We can filter by admin's rt_id.

        let query = supabase
            .from('pengumuman')
            .select('*, admin:admin_users(nama, rt_id)')
            .order('created_at', { ascending: false })
            .limit(limit);

        // If rt_id provided, we need to filter. 
        // Note: Supabase basic filtering on joined tables might be tricky without exact setup.
        // Assuming we can filter by admin.rt_id or we filter in application layer if volume is low.
        // A better schema would have rt_id directly on pengumuman, but schema says admin_id using admin table.
        // We rely on admin_users table having rt_id.
        // For now, let's fetch and filter if needed, or assume the client filters.
        // Ideally, schema modification adds rt_id to pengumuman for efficiency. 
        // But for strict security, we'll implement 'filter in app' if we can't deep filter easily or update schema.

        // However, for Multi-RT security (Admin), we MUST filter.
        // Let's check auth.
        // If this is an ADMIN request, we must ensure they only see their own announcements or all if Super Admin.

        // Checking for Auth header to see if it's an Admin request
        const authHeader = request.headers.get('cookie');
        let session = null;
        if (authHeader && authHeader.includes('admin_session')) {
            try {
                const { getSession } = await import('@/lib/auth');
                session = await getSession();
            } catch { }
        }

        const { data, error } = await query;

        if (error) throw error;

        let filteredData = data || [];

        // If Admin Session exists, restrict view based on role
        if (session) {
            if (session.role === 'SUPER_ADMIN') {
                if (rt_id) {
                    filteredData = filteredData.filter((p: any) => p.admin?.rt_id === rt_id);
                }
            } else {
                // Admin RT: Only show announcements from THEIR RT admins
                filteredData = filteredData.filter((p: any) => p.admin?.rt_id === session?.rt_id);
            }
        } else if (rt_id) {
            // Public view filtered by RT
            filteredData = filteredData.filter((p: any) => p.admin?.rt_id === rt_id);
        }

        return NextResponse.json({
            success: true,
            data: filteredData
        });

    } catch (error) {
        console.error('Error fetching pengumuman:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// POST - Create Pengumuman (Secure Admin Only)
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(); // Force Auth

        const body = await request.json();
        const { judul, isi, prioritas } = body;

        if (!judul || !isi) {
            return NextResponse.json({ success: false, error: 'Judul dan Isi wajib diisi' }, { status: 400 });
        }

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('pengumuman')
            .insert({
                admin_id: session.id, // Linked to the creating admin
                judul,
                isi,
                prioritas: prioritas || 'BIASA'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Pengumuman berhasil dibuat',
            data
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error creating pengumuman:', error);
        return NextResponse.json({ success: false, error: 'Gagal membuat pengumuman' }, { status: 500 });
    }
}

// DELETE - Delete Pengumuman (Secure Owner Only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        const supabase = getSupabase();

        // Verify ownership/permission
        // 1. Get pengumuman
        const { data: item } = await supabase.from('pengumuman').select('admin_id').eq('id', id).single();

        if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        // 2. Check permission
        // If Super Admin, allow.
        // If Admin RT, allow ONLY if they are the creator OR (better) if they belong to same RT (complex check).
        // For simplicity, allow creator or Super Admin.
        if (session.role !== 'SUPER_ADMIN' && item.admin_id !== session.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabase.from('pengumuman').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
    }
}
