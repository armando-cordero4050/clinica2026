
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
    console.error('Please provide a migration file path.');
    process.exit(1);
}

async function applyMigration() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log(`Applying migration: ${migrationFile}`);
        await client.query(sql);
        console.log('Migration applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
