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
    console.log("Forcing Lab Data Sync...");

    const sql = `
        DO $$
        BEGIN
            -- 1. Sync Materials
            TRUNCATE TABLE schema_lab.lab_materials CASCADE;
            INSERT INTO schema_lab.lab_materials (id, name, slug, description, is_active, created_at, updated_at)
            SELECT id, name, slug, description, is_active, created_at, updated_at FROM public.lab_materials;

            -- 2. Sync Types
            -- TRUNCATE TABLE schema_lab.lab_material_types CASCADE; -- already cascaded? check if necessary
            INSERT INTO schema_lab.lab_material_types (id, material_id, name, slug, description, created_at, updated_at)
            SELECT id, material_id, name, slug, description, created_at, updated_at FROM public.lab_material_types;

            -- 3. Sync Configurations
            -- TRUNCATE TABLE schema_lab.lab_configurations CASCADE; -- already cascaded
            INSERT INTO schema_lab.lab_configurations (id, type_id, name, slug, category, requires_units, base_price, sla_days, created_at, updated_at)
            SELECT id, type_id, name, slug, category, requires_units, base_price, sla_days, created_at, updated_at FROM public.lab_configurations;
        END $$;
    `;
    
    // exec_sql might wrap in select, so DO $$ is safer if supported
    // But exec_sql does 'lower(sql) like select'. DO starts with D.
    // checks: 'do' like 'select' -> false.
    // EXECUTE sql.
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        console.error("SYNC FAILED:", JSON.stringify(error, null, 2));
    } else {
        console.log("SYNC SUCCESS:", JSON.stringify(data, null, 2));
    }
}

run();
