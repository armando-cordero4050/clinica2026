import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkServicePricing() {
  console.log('🔍 Verificando precios de servicios...\n')
  
  // 1. Check services table
  const { data: services, error: svcError } = await supabase
    .from('services')
    .select('*')
    .eq('name', 'LD-CARILLAS')
    .single()

  if (svcError) {
    console.error('❌ Error fetching service:', svcError)
  } else if (services) {
    console.log('✅ Servicio encontrado en DB:')
    console.log('   Nombre:', services.name)
    console.log('   base_price:', services.base_price)
    console.log('   sale_price_gtq:', services.sale_price_gtq)
    console.log('   cost_price_gtq:', services.cost_price_gtq)
    console.log('   odoo_id:', services.odoo_id)
    console.log('   last_synced:', services.last_synced)
  } else {
    console.log('⚠️  Servicio "LD-CARILLAS" no encontrado')
  }

  console.log('\n📊 Todos los servicios:')
  const { data: allServices } = await supabase
    .from('services')
    .select('name, base_price, sale_price_gtq, cost_price_gtq, odoo_id')
    .order('name')

  if (allServices && allServices.length > 0) {
    console.table(allServices)
  } else {
    console.log('⚠️  No hay servicios en la tabla')
  }

  // 2. Check odoo_products table
  console.log('\n🔗 Verificando tabla odoo_products:')
  const { data: odooProducts } = await supabase
    .from('odoo_products')
    .select('*')
    .limit(5)

  if (odooProducts && odooProducts.length > 0) {
    console.table(odooProducts.map(p => ({
      id: p.odoo_product_id,
      name: p.name,
      list_price: p.list_price,
      last_synced: p.last_synced
    })))
  } else {
    console.log('⚠️  Tabla odoo_products vacía')
  }
}

checkServicePricing()
