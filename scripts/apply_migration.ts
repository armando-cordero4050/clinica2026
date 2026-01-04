import { Client } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') })

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found in .env')
    process.exit(1)
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('✅ Connected to Database')

    const migrationPath = path.join(__dirname, '../supabase/migrations/20260205000030_fix_staff_role_mapping.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Applying migration: fix_staff_role_mapping.sql...')
    await client.query(sql)
    
    console.log('✅ Migration applied successfully!')
  } catch (err) {
    console.error('❌ Migration failed:', err)
  } finally {
    await client.end()
  }
}

applyMigration()
