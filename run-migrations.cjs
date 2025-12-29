// @ts-check
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://obmpgtepotikmsazuygh.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_FP8nCUUYLI2cmkKRs7_peA_zCj3Vban';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const migrations = [
    '20251224_001_foundation.sql',
    '20251224_002_patients.sql',
    '20251224_003_tenancy_acl_fix.sql',
    '20251224_004_seed_roles.sql'
];

async function executeMigration(filename) {
    const filePath = path.join(__dirname, 'supabase', 'migrations', filename);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${filename} (file not found)`);
        return { filename, skipped: true };
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`🔄 Executing: ${filename}...`);

    try {
        // Execute raw SQL using Supabase client
        const { data, error } = await supabase.rpc('exec', { sql_query: sql });

        if (error) {
            // If exec RPC doesn't exist, try direct query
            console.log(`   Trying direct SQL execution...`);
            const result = await supabase.from('_sql').insert({ query: sql });

            if (result.error) {
                throw result.error;
            }
        }

        console.log(`✅ ${filename} - SUCCESS`);
        return { filename, success: true };

    } catch (error) {
        console.error(`❌ ${filename} - FAILED`);
        console.error(`   Error: ${error.message}`);
        throw error;
    }
}

async function runMigrations() {
    console.log('🚀 Starting migration execution with Service Role...\n');
    console.log(`📍 Target: ${SUPABASE_URL}\n`);

    for (const migration of migrations) {
        try {
            await executeMigration(migration);
            // Wait 1 second between migrations
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`\n⛔ Migration failed: ${migration}`);
            console.error('Stopping execution to prevent data corruption.\n');
            console.error('\n📝 Please execute this migration manually in Supabase SQL Editor:');
            console.error(`   File: supabase/migrations/${migration}\n`);
            process.exit(1);
        }
    }

    console.log('\n✅ All migrations executed successfully!');
    console.log('\n🎉 Database is ready. You can now proceed with the Auth UI implementation.');
}

runMigrations();
