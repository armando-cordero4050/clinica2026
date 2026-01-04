import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20260205000016_fix_odoo_customer_column_name.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    console.log('📄 Migration SQL:')
    console.log(migrationSQL)
    console.log('\n🔄 Applying migration...\n')
    
    // Execute each statement separately
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (!statement) continue
      
      console.log(`Executing: ${statement.substring(0, 80)}...`)
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      }).single()
      
      if (error) {
        console.error('❌ Error:', error)
        throw error
      }
      
      console.log('✅ Success')
    }
    
    console.log('\n✅ Migration applied successfully!')
    return true
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    return false
  }
}

applyMigration()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
