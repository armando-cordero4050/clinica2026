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
    console.log("Fixing Lab Schema Permissions...");

    const sql = `
        GRANT USAGE ON SCHEMA schema_lab TO service_role;
        GRANT USAGE ON SCHEMA schema_lab TO postgres;
        GRANT USAGE ON SCHEMA schema_lab TO authenticated;
        
        GRANT ALL ON ALL TABLES IN SCHEMA schema_lab TO service_role;
        GRANT ALL ON ALL TABLES IN SCHEMA schema_lab TO postgres;
        GRANT ALL ON ALL TABLES IN SCHEMA schema_lab TO authenticated;

        GRANT ALL ON ALL SEQUENCES IN SCHEMA schema_lab TO service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA schema_lab TO postgres;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        console.error("PERM FIX FAILED:", error);
    } else {
        console.log("PERM FIX SUCCESS:", JSON.stringify(data, null, 2));
    }
}

run();
