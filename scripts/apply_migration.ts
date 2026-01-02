import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
  
  let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
     console.error('No DATABASE_URL or POSTGRES_URL found in .env');
     process.exit(1);
  }

  // Strip single or double quotes if present
  connectionString = connectionString.replace(/^['"]|['"]$/g, '');

  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } 
  });

  try {
    const client = await pool.connect();
    console.log(`Executing ${path.basename(filePath)}...`);
    await client.query(sql);
    console.log('Migration applied successfully!');
    client.release();
  } catch (err) {
    console.error('Error executing SQL:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
