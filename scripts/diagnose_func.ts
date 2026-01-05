import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
    console.log("Getting RPC Source...");
    const sql = `SELECT prosrc FROM pg_proc WHERE proname = 'create_lab_order_transaction_v2'`;
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) console.error("RPC Error:", error);
    else console.log("SOURCE:", JSON.stringify(data, null, 2));
}
run();
