import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false
  }
});

async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(fullPath, 'utf8');

  console.log(`Executing ${path.basename(filePath)} via RPC exec_sql...`);
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // If exec_sql missing, try to create it? No, that requires SQL.
    console.error('Error executing SQL via RPC:', error);
    // If the error is "function not found", we are stuck and user needs to apply manually first.
    if (error.code === '42883' || error.message.includes('function') && error.message.includes('not found')) {
        console.error('CRITICAL: functionality to run SQL via Agent is missing (schema_core.exec_sql).');
        console.error('Please run "20260201999998_enable_agent_sql_exec.sql" manually in Supabase SQL Editor first.');
    }
    process.exit(1);
  }

  console.log('Migration Result:', JSON.stringify(data, null, 2));
  
  if (data && data.error) {
      console.error('SQL Execution Error:', data.error);
      process.exit(1);
  }
}

run();
