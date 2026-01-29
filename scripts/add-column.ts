// Script to add missing columns using Supabase SQL execution
// Run with: npx tsx scripts/add-column.ts

import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function addColumn() {
    console.log('🔧 Adding missing alamat_lengkap column...\n');

    try {
        // Use the Supabase REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                sql: 'ALTER TABLE rt_units ADD COLUMN IF NOT EXISTS alamat_lengkap TEXT;'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('⚠️ RPC method not available:', response.status);
            console.log('\n📋 Please run the following SQL manually in Supabase Dashboard:\n');
            console.log('=====================================');
            console.log('ALTER TABLE rt_units ADD COLUMN IF NOT EXISTS alamat_lengkap TEXT;');
            console.log('=====================================');
            console.log('\n📋 Steps:');
            console.log('   1. Go to: https://supabase.com/dashboard');
            console.log('   2. Select your project: mnqxpciekuosdldvmbxz');
            console.log('   3. Click "SQL Editor" in the left sidebar');
            console.log('   4. Paste the SQL command above');
            console.log('   5. Click "Run"');
            console.log('   6. Refresh your browser at localhost:3000');
            return;
        }

        console.log('✅ Column added successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
        console.log('\n📋 Please run the following SQL manually in Supabase Dashboard:\n');
        console.log('=====================================');
        console.log('ALTER TABLE rt_units ADD COLUMN IF NOT EXISTS alamat_lengkap TEXT;');
        console.log('=====================================');
    }
}

addColumn();
