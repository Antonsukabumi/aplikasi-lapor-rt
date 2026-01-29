// Script to run database migration
// Run with: npx tsx scripts/run-migration.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'NOT FOUND');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Starting database migration...\n');

    try {
        // 1. Create rt_units table
        console.log('📦 Creating rt_units table...');
        const { error: rtError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS rt_units (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    nama VARCHAR(100) NOT NULL,
                    nomor_rt VARCHAR(10) NOT NULL,
                    nomor_rw VARCHAR(10) NOT NULL,
                    kelurahan VARCHAR(100),
                    kecamatan VARCHAR(100),
                    kota VARCHAR(100),
                    alamat_lengkap TEXT,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `
        });

        if (rtError) {
            // Try direct insert approach instead
            console.log('   Using alternative approach...');
        }

        // Check if rt_units exists
        const { data: rtCheck } = await supabase.from('rt_units').select('id').limit(1);

        if (rtCheck === null) {
            console.log('❌ rt_units table does not exist. Please run the SQL migration manually in Supabase Dashboard.');
            console.log('\n📋 Go to: https://supabase.com/dashboard');
            console.log('   1. Select your project');
            console.log('   2. Click SQL Editor');
            console.log('   3. Paste the SQL from: supabase/migrations/001_multi_rt_admin.sql');
            console.log('   4. Click Run');
            return;
        }

        // Check if we have data
        const { data: rtData } = await supabase.from('rt_units').select('*');
        console.log(`   ✅ rt_units table exists (${rtData?.length || 0} records)`);

        // Insert default RT if empty
        if (!rtData || rtData.length === 0) {
            console.log('   📥 Inserting default RT...');
            const { error: insertRtError } = await supabase.from('rt_units').insert({
                nama: 'RT 05 / RW 03',
                nomor_rt: '05',
                nomor_rw: '03',
                kelurahan: 'Kelurahan Digital',
                kecamatan: 'Kecamatan Maju',
                kota: 'Kota Harapan',
                is_active: true
            });
            if (insertRtError) console.log('   ⚠️ RT insert error:', insertRtError.message);
            else console.log('   ✅ Default RT created');
        }

        // Check admin_users
        const { data: adminCheck } = await supabase.from('admin_users').select('id').limit(1);

        if (adminCheck === null) {
            console.log('❌ admin_users table does not exist. Please run the SQL migration manually.');
            return;
        }

        const { data: adminData } = await supabase.from('admin_users').select('*');
        console.log(`   ✅ admin_users table exists (${adminData?.length || 0} records)`);

        // Insert default Super Admin if empty
        if (!adminData || adminData.length === 0) {
            console.log('   📥 Inserting default Super Admin...');
            const { error: insertAdminError } = await supabase.from('admin_users').insert({
                email: 'superadmin@lapor.rt',
                password_hash: '240be518fabd2724ddb6f04eeb9d5b7a048d91b4c5cd60b7cbaaf9e88a09f5c4',
                nama: 'Super Admin',
                role: 'SUPER_ADMIN',
                is_active: true
            });
            if (insertAdminError) console.log('   ⚠️ Admin insert error:', insertAdminError.message);
            else console.log('   ✅ Default Super Admin created');
        }

        console.log('\n✅ Migration check complete!');
        console.log('\n📝 Login credentials:');
        console.log('   Email: superadmin@lapor.rt');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Migration error:', error);
    }
}

runMigration();
