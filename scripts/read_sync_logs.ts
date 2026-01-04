
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) process.env[k] = envConfig[k];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function readLogs() {
  console.log("📖 Reading latest sync logs...");
  
  const { data, error } = await supabase
    .from('odoo_sync_log')
    .select('*')
    .eq('module', 'products')
    .order('started_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error reading logs:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.log("⚠️ No logs found for module 'products'");
  } else {
    data.forEach(log => {
       console.log(`\n🔹 [${log.status.toUpperCase()}] ${log.started_at}`);
       console.log(`   Processed: ${log.records_processed} | Failed: ${log.records_failed}`);
       if (log.error_message) console.log(`   🔴 ERROR: ${log.error_message}`);
    });
  }
}

readLogs();
