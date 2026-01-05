import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
    console.log("Listing tables in schema_lab...");

    const sql = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'lab_%'`;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        console.error("LIST FAILED:", JSON.stringify(error, null, 2));
    } else {
        console.log("TABLES:", JSON.stringify(data, null, 2));
    }
}

run();
