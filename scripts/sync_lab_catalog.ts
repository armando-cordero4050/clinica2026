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
    console.log("Starting JS-Based Lab Sync...");

    // 1. Fetch from PUBLIC schema (via default client)
    console.log("Fetching Public Data...");
    
    const { data: mats, error: errM } = await supabase.from('lab_materials').select('*');
    if (errM) { console.error("Error fetching Public Materials:", errM); return; }
    console.log(`- Materials: ${mats.length}`);

    const { data: types, error: errT } = await supabase.from('lab_material_types').select('*');
    if (errT) { console.error("Error fetching Public Types:", errT); return; }
    console.log(`- Types: ${types.length}`);

    const { data: configs, error: errC } = await supabase.from('lab_configurations').select('*');
    if (errC) { console.error("Error fetching Public Configs:", errC); return; }
    console.log(`- Configs: ${configs.length}`);

    // 2. Clear SCHEMA_LAB tables
    // We use exec_sql for Truncate because of Cascade convenience
    console.log("Truncating Schema_Lab Tables...");
    const truncateSql = `
        TRUNCATE TABLE schema_lab.lab_configurations CASCADE;
        TRUNCATE TABLE schema_lab.lab_material_types CASCADE;
        TRUNCATE TABLE schema_lab.lab_materials CASCADE;
    `;
    const { error: truncError } = await supabase.rpc('exec_sql', { sql_query: truncateSql });
    if (truncError) { console.error("Truncate Failed:", truncError); return; }
    
    // 3. Insert into SCHEMA_LAB using schema() selector
    // Note: service_role key allows bypassing RLS, but we need to ensure we can write to this schema.
    // If the tables are not exposed in PostgREST (schema_lab might not be in exposed_schemas),
    // supabase-js might fail.
    // In that case, we MUST use direct SQL Insert.
    
    // Let's TRY direct SQL Insert via exec_sql with constructed strings if JS fails?
    // Or just try JS first.
    
    // Wait, PostgREST usually only exposes 'public'.
    // If 'schema_lab' is not exposed, supabase.schema('schema_lab') checks might fail or url might be 404.
    
    // We will assume 'schema_lab' IS exposed or accessible by service_role.
    

    // Helper to sanitize string
    const sanitize = (val: any) => {
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (val instanceof Date) return `'${val.toISOString()}'`;
        return val;
    };

    console.log("Inserting into Schema_Lab via SQL...");

    // Materials
    if (mats && mats.length > 0) {
        const values = mats.map((row: any) => `(${sanitize(row.id)}, ${sanitize(row.name)}, ${sanitize(row.slug)}, ${sanitize(row.description)}, ${sanitize(row.is_active)}, ${sanitize(row.created_at)}, ${sanitize(row.updated_at)})`).join(',');
        const sqlM = `INSERT INTO schema_lab.lab_materials (id, name, slug, description, is_active, created_at, updated_at) VALUES ${values};`;
        const { data: resM, error: rpcErrM } = await supabase.rpc('exec_sql', { sql_query: sqlM });
        if (rpcErrM) console.error("RPC Fail M:", rpcErrM);
        else if (resM && resM.error) console.error("SQL Fail M:", resM.error, resM.detail);
        else console.log("Materials Inserted.");
    }

    // Types
    if (types && types.length > 0) {
        const values = types.map((row: any) => `(${sanitize(row.id)}, ${sanitize(row.material_id)}, ${sanitize(row.name)}, ${sanitize(row.slug)}, ${sanitize(row.description)}, ${sanitize(row.created_at)}, ${sanitize(row.updated_at)})`).join(',');
        const sqlT = `INSERT INTO schema_lab.lab_material_types (id, material_id, name, slug, description, created_at, updated_at) VALUES ${values};`;
        const { data: resT, error: rpcErrT } = await supabase.rpc('exec_sql', { sql_query: sqlT });
        if (rpcErrT) console.error("RPC Fail T:", rpcErrT);
        else if (resT && resT.error) console.error("SQL Fail T:", resT.error, resT.detail);
        else console.log("Types Inserted.");
    }

    // Configs
    if (configs && configs.length > 0) {
        const values = configs.map((row: any) => `(${sanitize(row.id)}, ${sanitize(row.type_id)}, ${sanitize(row.name)}, ${sanitize(row.slug)}, ${sanitize(row.category)}, ${sanitize(row.requires_units)}, ${sanitize(row.base_price)}, ${sanitize(row.sla_days)}, ${sanitize(row.created_at)}, ${sanitize(row.updated_at)})`).join(',');
        const sqlC = `INSERT INTO schema_lab.lab_configurations (id, type_id, name, slug, category, requires_units, base_price, sla_days, created_at, updated_at) VALUES ${values};`;
        const { data: resC, error: rpcErrC } = await supabase.rpc('exec_sql', { sql_query: sqlC });
        if (rpcErrC) console.error("RPC Fail C:", rpcErrC);
        else if (resC && resC.error) console.error("SQL Fail C:", resC.error, resC.detail);
        else console.log("Configs Inserted.");
    }
}

run();
