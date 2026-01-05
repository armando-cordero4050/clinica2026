import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function findRPC() {
    console.log("🔍 Buscando RPC create_lab_order...\n");

    const sql = `
        SELECT 
            n.nspname as schema,
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname LIKE '%create_lab_order%'
        ORDER BY n.nspname, p.proname
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error("❌ Error:", error);
        return;
    }

    console.log("📋 RPCs encontrados:");
    console.log(JSON.stringify(data, null, 2));
}

findRPC();
