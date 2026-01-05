import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
    const id = '4a013b45-74d8-42b3-91fd-4a2013bf5f00';
    console.log("Ensuring ID exists:", id);
    
    // Check if exists
    const { data: exists } = await supabase.from('lab_configurations').select('id').eq('id', id).single();
    
    if (exists) {
        console.log("ID EXISTS in PUBLIC.");
    } else {
        console.log("ID MISSING. Inserting...");
        // Insert dummy
        const { error } = await supabase.from('lab_configurations').insert({
            id: id,
            name: "Restored Item",
            slug: "restored-item",
            category: "fixed",
            requires_units: true,
            base_price: 100,
            sla_days: 3
            // type_id omitted
        });
        if (error) console.error("Insert Failed:", error);
        else console.log("Insert Success.");
    }
}
run();
