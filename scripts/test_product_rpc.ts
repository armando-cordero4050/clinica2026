
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

async function testSyncRpc() {
  console.log("🧪 Testing sync_service_from_odoo RPC...");

  // Mock payload for "LD-CARILLAS"
  const payload = {
    p_odoo_id: 2,
    p_name: "LD-CARILLAS",
    p_code: "ODOO-2",
    p_category: "Laboratorio",
    p_price: 600.0,
    p_type: "product",
    p_raw_data: { test: true }
  };

  const { data, error } = await supabase.rpc('sync_service_from_odoo', payload);

  if (error) {
    console.error("❌ RPC Error:", error);
  } else {
    console.log("✅ RPC Result:", data);
  }
}

testSyncRpc();
