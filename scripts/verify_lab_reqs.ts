
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(JSON.stringify({ error: 'Missing env vars' }));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const results: any = {};

  try {
      // Check schema_medical.clinics
      const { data: cData, error: cError } = await supabase
        .from('clinics') 
        // Wait, supabase client usually defaults to 'public'. 
        // We can't select specific schema 'schema_medical' easily unless we configure client or 'clinics' is in public search path.
        // But we DO know public.clinics is a VIEW calling schema_medical.clinics.
        // If we can query detailed info via a raw SQL, that's best.
        // But we don't have raw sql tool exposed via client usually unless enabled via RPC.
        // Let's rely on RPC 'exec_sql' if it exists (often added by devs) or standard queries.
        // If we lack 'exec_sql', debugging is hard.
        // Let's assume we can try to hit the PUBLIC views which point to them.
       
       console.log('Testing exec_sql RPC...');
       const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' });
       results.rpc_exec_sql = { success: !rpcError, data: rpcData, error: rpcError };
       
       console.log(JSON.stringify(results, null, 2));
  } catch (e: any) {
    console.log(JSON.stringify({ fatal: e.message }));
  }
}

verify();
