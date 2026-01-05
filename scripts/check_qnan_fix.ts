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
    console.log("🔍 Verificando RPC get_active_lab_services...\n");

    // Obtener la definición del RPC
    const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: `SELECT prosrc FROM pg_proc WHERE proname = 'get_active_lab_services'` 
    });
    
    if (error) {
        console.error("❌ Error:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("❌ RPC get_active_lab_services NO EXISTE");
        return;
    }

    const source = data[0].prosrc;
    
    // Verificar si incluye sale_price_gtq y cost_price_gtq
    const hasSalePrice = source.includes('sale_price_gtq');
    const hasCostPrice = source.includes('cost_price_gtq');
    
    console.log("Definición del RPC:");
    console.log("- Incluye sale_price_gtq:", hasSalePrice ? "✅ SÍ" : "❌ NO");
    console.log("- Incluye cost_price_gtq:", hasCostPrice ? "✅ SÍ" : "❌ NO");
    
    if (hasSalePrice && hasCostPrice) {
        console.log("\n✅ El fix de QNaN YA ESTÁ APLICADO (por otra migración)");
    } else {
        console.log("\n❌ El fix de QNaN NO ESTÁ APLICADO - Se requiere ejecutar EJECUTAR_AHORA_fix_qnan.sql");
    }
}

run();
