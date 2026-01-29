
import 'dotenv/config';
import { login } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

async function verifyLogin() {
    console.log('🔍 Verifying Login Functionality...\n');

    // 1. Test Super Admin Login
    console.log('1. Testing Super Admin Login (superadmin@lapor.rt / admin123)...');
    try {
        const result = await login('superadmin@lapor.rt', 'admin123');
        if (result.success) {
            console.log('   ✅ Super Admin Login: SUCCESS');
            console.log(`      Role: ${result.session?.role}`);
        } else {
            console.log('   ❌ Super Admin Login: FAILED');
            console.log(`      Error: ${result.error}`);
        }
    } catch (err) {
        console.error('   ❌ Exception:', err);
    }

    // 2. Test Admin RT Login
    // First, let's create or find a test admin
    console.log('\n2. Testing Admin RT Login...');
    const supabase = getSupabase();

    // Check if we have an admin user
    const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('role', 'ADMIN_RT')
        .eq('is_active', true)
        .limit(1)
        .single();

    if (admin) {
        console.log(`   Found active Admin RT: ${admin.email}`);
        // We can't know the password of an existing random user easily unless we set it.
        // So let's create a temp test user if needed, or just report we need one.
        // For verification, I'll create a temp "test_admin" with known password.
    } else {
        console.log('   No active Admin RT found. Creating test user...');
    }

    // Create/Update test user
    const testEmail = 'test_rt@lapor.rt';
    const testPass = 'password123';

    // Hash manually (simple hash as per auth.ts)
    const encoder = new TextEncoder();
    const data = encoder.encode(testPass);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = Buffer.from(hashBuffer).toString('hex');

    // Upsert test user
    // Need an RT first
    const { data: rt } = await supabase.from('rt_units').select('id').limit(1).single();
    if (!rt) {
        console.log('   ❌ No RT units found! Cannot create Admin RT.');
        return;
    }

    const { error: upsertError } = await supabase.from('admin_users').upsert({
        email: testEmail,
        password_hash: hash,
        nama: 'Test Admin RT',
        role: 'ADMIN_RT',
        rt_id: rt.id,
        is_active: true,
        no_hp: '08123456789'
    }, { onConflict: 'email' });

    if (upsertError) {
        console.log('   ❌ Failed to create/update test admin:', upsertError.message);
    } else {
        console.log(`   ✅ Test Admin ready (${testEmail} / ${testPass})`);

        // Try login
        const adminResult = await login(testEmail, testPass);
        if (adminResult.success) {
            console.log('   ✅ Admin RT Login: SUCCESS');
            console.log(`      Role: ${adminResult.session?.role}`);
            console.log(`      RT ID: ${adminResult.session?.rt_id}`);
        } else {
            console.log('   ❌ Admin RT Login: FAILED');
            console.log(`      Error: ${adminResult.error}`);
        }
    }
}

verifyLogin();
