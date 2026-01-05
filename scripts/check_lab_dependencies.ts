
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDependencies() {
  console.log('Checking dependencies...');

  // Check Schemas
  const { data: schemas, error: schemaError } = await supabase.rpc('utils_get_schemas'); 
  // Wait, I don't know if this RPC exists. I should use plain SQL if I can, but I can't via client easily without RPC.
  // Alternatively, try to select from the tables.

  const checks = [
    { table: 'schema_medical.clinics', name: 'Clinics' },
    { table: 'schema_medical.patients', name: 'Patients' },
    { table: 'schema_core.users', name: 'Core Users' },
    { table: 'schema_lab.some_table', name: 'Schema Lab (check existence via info)' } 
    // We can't query information_schema easily unless we have wrapper.
  ];

  for (const check of checks) {
    try {
        console.log(`Checking ${check.table}...`);
        // Just try to select 1, ignoring errors might not be enough, we need to distinguish "table not found" from "permission denied" or empty.
        // Actually, if table doesn't exist, it throws error.
        const { error } = await supabase.from(check.table).select('id').limit(1);
        
        if (error) {
            console.error(`Error referencing ${check.table}:`, error.message);
        } else {
            console.log(`SUCCESS: ${check.table} is accessible.`);
        }
    } catch (e) {
        console.error(`Exception checking ${check.table}:`, e);
    }
  }
}

checkDependencies();
