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

async function checkMigration(name: string, checkQuery: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: checkQuery });
    
    if (error) {
        console.error(`❌ Error checking ${name}:`, error);
        return false;
    }
    
    // Si data es un array con elementos, la migración está aplicada
    if (Array.isArray(data) && data.length > 0) {
        return true;
    }
    
    return false;
}

async function run() {
    console.log("🔍 Verificando migraciones EJECUTAR_AHORA_*...\n");

    const migrations = [
        {
            name: "EJECUTAR_AHORA_fix_appointment_creation.sql",
            check: `SELECT proname FROM pg_proc WHERE proname = 'create_appointment_rpc'`,
            description: "RPC create_appointment_rpc con fix de sale_price_gtq"
        },
        {
            name: "EJECUTAR_AHORA_create_lab_catalog.sql",
            check: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lab_configurations'`,
            description: "Tabla public.lab_configurations"
        },
        {
            name: "EJECUTAR_AHORA_add_logistics.sql",
            check: `SELECT column_name FROM information_schema.columns WHERE table_schema = 'schema_lab' AND table_name = 'lab_orders' AND column_name = 'shipping_type'`,
            description: "Columna shipping_type en lab_orders"
        },
        {
            name: "EJECUTAR_AHORA_fix_get_doctors.sql",
            check: `SELECT proname FROM pg_proc WHERE proname = 'get_doctors_rpc'`,
            description: "RPC get_doctors_rpc"
        },
        {
            name: "EJECUTAR_AHORA_fix_pricing.sql",
            check: `SELECT column_name FROM information_schema.columns WHERE table_schema = 'schema_medical' AND table_name = 'clinic_service_prices' AND column_name = 'margin_gtq'`,
            description: "Columna margin_gtq en clinic_service_prices"
        },
        {
            name: "EJECUTAR_AHORA_fix_qnan.sql",
            check: `SELECT proname FROM pg_proc WHERE proname LIKE '%qnan%'`,
            description: "Fix relacionado con QNaN"
        },
        {
            name: "EJECUTAR_AHORA_update_sync_rpc.sql",
            check: `SELECT proname FROM pg_proc WHERE proname = 'sync_service_from_odoo'`,
            description: "RPC sync_service_from_odoo actualizado"
        }
    ];

    for (const migration of migrations) {
        const isApplied = await checkMigration(migration.name, migration.check);
        const status = isApplied ? "✅ APLICADA" : "❌ NO APLICADA";
        console.log(`${status} - ${migration.name}`);
        console.log(`   Verificación: ${migration.description}\n`);
    }
}

run();
