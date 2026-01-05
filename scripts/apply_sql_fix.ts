import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
    const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/FIX_LAB_FK_POINTER.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log("Applying SQL Fix from:", sqlPath);
    console.log("-----------------------------------");
    
    // exec_sql requires a single string. The file might contain comments.
    // Ideally we strip comments or just pass it as is if Postgres accepts it.
    // However, explicit 'DROP FUNCTION' and 'CREATE FUNCTION' usually work fine.
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
        console.error("SQL APPLY FAILED:", JSON.stringify(error, null, 2));
    } else {
        console.log("SQL APPLY SUCCESS:", JSON.stringify(data, null, 2));
    }
}

run();
