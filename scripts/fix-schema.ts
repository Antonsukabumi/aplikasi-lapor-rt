// Script to fix missing columns in database
// Run with: npx tsx scripts/fix-schema.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'NOT FOUND');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' }
});

async function fixSchema() {
    console.log('🔧 Fixing database schema...\n');

    try {
        // Check current rt_units structure
        const { data: rtData, error: rtError } = await supabase
            .from('rt_units')
            .select('*')
            .limit(1);

        if (rtError) {
            console.log('❌ Error accessing rt_units:', rtError.message);

            if (rtError.message.includes('alamat_lengkap')) {
                console.log('\n📋 The "alamat_lengkap" column is missing from the rt_units table.');
                console.log('\n🛠️ To fix this, run the following SQL in Supabase Dashboard:\n');
                console.log('-----------------------------------------------------------');
                console.log('ALTER TABLE rt_units ADD COLUMN IF NOT EXISTS alamat_lengkap TEXT;');
                console.log('-----------------------------------------------------------');
                console.log('\n📋 Steps:');
                console.log('   1. Go to https://supabase.com/dashboard');
                console.log('   2. Select your project');
                console.log('   3. Click "SQL Editor" in the sidebar');
                console.log('   4. Paste the SQL command above');
                console.log('   5. Click "Run"');
                console.log('   6. Restart your Next.js dev server');
            }
            return;
        }

        console.log('✅ rt_units table is accessible');

        // Check if alamat_lengkap exists by trying to read it
        if (rtData && rtData.length > 0) {
            const hasAlamatLengkap = 'alamat_lengkap' in rtData[0];
            console.log(`   alamat_lengkap column: ${hasAlamatLengkap ? '✅ Exists' : '❌ Missing'}`);
        } else {
            console.log('   (No records to check column structure)');
        }

        console.log('\n✅ Schema check complete!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixSchema();
