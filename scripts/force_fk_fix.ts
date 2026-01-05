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
    console.log("Forcing FK Fix...");

    // 1. Drop Constraint
    console.log("Dropping Constraint...");
    const dropSql = `ALTER TABLE schema_lab.lab_order_items DROP CONSTRAINT IF EXISTS lab_order_items_configuration_id_fkey;`;
    const { data: d1, error: e1 } = await supabase.rpc('exec_sql', { sql_query: dropSql });
    if (e1) console.error("Drop Failed RPC:", e1);
    else if (d1 && d1.error) console.error("Drop Failed SQL:", d1.error);
    else console.log("Drop Success.");

    // 2. Add Constraint
    console.log("Adding Constraint (Reference PUBLIC)...");
    const addSql = `ALTER TABLE schema_lab.lab_order_items ADD CONSTRAINT lab_order_items_configuration_id_fkey FOREIGN KEY (configuration_id) REFERENCES public.lab_configurations(id);`;
    const { data: d2, error: e2 } = await supabase.rpc('exec_sql', { sql_query: addSql });
    if (e2) console.error("Add Failed RPC:", e2);
    else if (d2 && d2.error) console.error("Add Failed SQL:", d2.error, d2.detail);
    else console.log("Add Success.");
}

run();
