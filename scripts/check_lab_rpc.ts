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
    console.log("Checking for 'create_lab_order_transaction' functions...");
    

    // Check FK
    const fkSql = `SELECT tc.constraint_name, ccu.table_schema AS foreign_table_schema, ccu.table_name AS foreign_table_name FROM information_schema.table_constraints AS tc JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.table_name='lab_order_items' AND tc.constraint_type = 'FOREIGN KEY'`;
    const { data: fkData } = await supabase.rpc('exec_sql', { sql_query: fkSql });
    console.log("FK Config:", JSON.stringify(fkData, null, 2));

}

run();
