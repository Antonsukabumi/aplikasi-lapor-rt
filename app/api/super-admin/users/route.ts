import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET - List All Admin Users
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth(['SUPER_ADMIN']);
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('admin_users')
            .select('*, rt_unit:rt_units(nama)')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data || [] });

    } catch (error) {
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
}

// PUT - Approve/Update Admin User
export async function PUT(request: NextRequest) {
    try {
        const session = await requireAuth(['SUPER_ADMIN']);
        const body = await request.json();
        const { id, is_active } = body;

        console.log('Update Admin:', body); // Debug

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('admin_users')
            .update({ is_active, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Updated', data });

    } catch (error) {
        console.error('API Error:', error);
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
    }
}
