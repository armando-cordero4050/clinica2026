
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import xmlrpc from 'xmlrpc';

// 1. Env Setup
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) process.env[k] = envConfig[k];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ODOO_URL = process.env.ODOO_URL!;
const ODOO_DB = process.env.ODOO_DB!;
const ODOO_USER = process.env.ODOO_USERNAME!;
const ODOO_PASS = process.env.ODOO_PASSWORD!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

interface OdooProduct {
  id: number
  name: string
  default_code: string | false
  list_price: number
  detailed_type: string
  categ_id: [number, string] | false
  active: boolean
}

async function debugSync() {
  console.log('🚀 Starting Debug Sync...');

  // 1. Connect to Odoo
  console.log(`🔌 Connecting to Odoo: ${ODOO_URL} (${ODOO_DB})`);
  const common = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/common` });
  
  const uid = await new Promise<number>((resolve, reject) => {
    common.methodCall('authenticate', [ODOO_DB, ODOO_USER, ODOO_PASS, {}], (error, value) => {
        if (error) reject(error);
        else resolve(value as number);
    });
  });

  console.log(`✅ Authenticated UID: ${uid}`);
  const models = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });

  // 2. Fetch Products
  console.log('📦 Fetching Products...');
  const products = await new Promise<OdooProduct[]>((resolve, reject) => {
    models.methodCall('execute_kw', [
        ODOO_DB, uid, ODOO_PASS,
        'product.template', 'search_read',
        [[['active', '=', true]]],
        { fields: ['id', 'name', 'default_code', 'list_price', 'detailed_type', 'categ_id'] }
    ], (err, val) => {
        if (err) reject(err);
        else resolve(val as OdooProduct[]);
    });
  });

  console.log(`📦 Found ${products.length} products.`);

  // 3. Process Each
  for (const p of products) {
      console.log(`\n🔄 Processing ID: ${p.id} Name: ${p.name}`);
      console.log(`   Type: ${p.detailed_type}, Code: ${p.default_code}, Price: ${p.list_price}`);

      const payload = {
        p_odoo_id: p.id,
        p_name: p.name,
        p_code: p.default_code || '',
        p_category: Array.isArray(p.categ_id) ? p.categ_id[1] : 'Unknown',
        p_price: p.list_price || 0,
        p_type: p.detailed_type || 'service',
        p_raw_data: p
      };

      console.log("   📤 Payload:", JSON.stringify(payload));

      const { data, error } = await supabase.rpc('sync_service_from_odoo', payload);

      if (error) {
        console.error(`   ❌ RPC ERROR:`, error);
        console.error(`   👉 Message: ${error.message}`);
        console.error(`   👉 Details: ${error.details}`);
        console.error(`   👉 Hint: ${error.hint}`);
      } else {
        console.log(`   ✅ RPC SUCCESS:`, data);
      }
  }
}

debugSync().catch(console.error);
