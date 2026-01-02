
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL not found in .env');
  process.exit(1);
}

// Check arguments
const mode = process.argv[2]; // 'query' or 'file'
const payload = process.argv[3];

if (!mode || !payload) {
  console.error('Usage: npx tsx scripts/db-executor.ts <query|file> <"sql_string"|file_path>');
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL, usually self-signed in dev implies specific config, but 'false' is standard for quick connect
  });

  try {
    await client.connect();

    let sql = '';

    if (mode === 'file') {
      const filePath = path.resolve(process.cwd(), payload);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      sql = fs.readFileSync(filePath, 'utf-8');
    } else {
      sql = payload;
    }

    console.log(`🔌 Executing SQL (${mode})...`);
    
    // Simple query execution
    const res = await client.query(sql);

    console.log('✅ Success!');
    if (res.rows && res.rows.length > 0) {
      console.log('📊 Result (First 5 rows):');
      console.log(JSON.stringify(res.rows.slice(0, 5), null, 2));
      if (res.rows.length > 5) console.log(`... and ${res.rows.length - 5} more rows.`);
    } else {
      console.log(`ℹ️ Affected rows: ${res.rowCount}`);
    }

  } catch (err: any) {
    console.error('❌ SQL Execution Error:', err.message);
    if (err.position) {
      console.error(`   at position: ${err.position}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
