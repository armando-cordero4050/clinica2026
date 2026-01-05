import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function listOdooProducts() {
  console.log('📦 Productos en odoo_products:\n')
  
  const { data: products, error } = await supabase
    .from('odoo_products')
    .select('*')
    .order('name')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (!products || products.length === 0) {
    console.log('⚠️  No hay productos en odoo_products')
    console.log('   Esto significa que la sincronización de Odoo no está trayendo productos')
    return
  }

  console.log(`✅ Encontrados ${products.length} productos:\n`)
  products.forEach(p => {
    console.log(`ID: ${p.odoo_product_id}`)
    console.log(`Nombre: ${p.name}`)
    console.log(`Código: ${p.default_code || 'N/A'}`)
    console.log(`Precio Lista: Q ${p.list_price || 0}`)
    console.log(`Precio Costo: Q ${p.standard_price || 0}`)
    console.log(`Tipo: ${p.type}`)
    console.log(`Última Sync: ${p.last_synced}`)
    console.log('---')
  })
}

listOdooProducts()
