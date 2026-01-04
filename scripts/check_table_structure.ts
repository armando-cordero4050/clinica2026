import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('🔍 Checking odoo_customers table structure...\n')
  
  // Query to get column information
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_schema', 'schema_core')
    .eq('table_name', 'odoo_customers')
    .order('ordinal_position')
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log('📊 Columns in schema_core.odoo_customers:')
  console.table(data)
  
  // Check if odoo_customer_id exists
  const hasOdooCustomerId = data?.some(col => col.column_name === 'odoo_customer_id')
  const hasOdooPartnerId = data?.some(col => col.column_name === 'odoo_partner_id')
  
  console.log('\n✅ Has odoo_customer_id:', hasOdooCustomerId)
  console.log('❌ Has odoo_partner_id:', hasOdooPartnerId)
  
  if (!hasOdooCustomerId) {
    console.log('\n⚠️  Migration did NOT apply! Column still named odoo_partner_id')
  } else {
    console.log('\n✅ Migration applied successfully!')
  }
}

checkTableStructure()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
