
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Force reload env
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uadurfgrkjjbexnpcjdq.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    headers: { Authorization: `Bearer ${SERVICE_KEY}` }
  }
});

const mode = process.argv[2]; 
const payload = process.argv[3];

async function run() {
  if (!mode || !payload) {
    console.error('Usage: npx tsx scripts/db-executor-rpc.ts <query|file> <payload>');
    return;
  }

  let sql = '';
  if (mode === 'file') {
    if (!fs.existsSync(payload)) {
      console.error(`❌ File not found: ${payload}`);
      process.exit(1);
    }
    sql = fs.readFileSync(payload, 'utf-8');
  } else {
    sql = payload;
  }

  console.log(`⚡ Executing SQL via RPC...`);
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ RPC Transport Error:', error);
    process.exit(1);
  }

  // FORCE PRINT FULL DATA FOR DEBUGGING
  console.log('\n🔍 --- DEBUG RAW RESPONSE ---');
  console.log(JSON.stringify(data, null, 2));
  console.log('-----------------------------\n');

  if (data && data.error) {
     console.error('❌ SQL execution failed.');
     process.exit(1);
  }

  console.log('✅ Success!');
}

run();
