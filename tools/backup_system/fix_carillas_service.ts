import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixCarillasService() {
  console.log('🔧 Arreglando servicio LD-CARILLAS...\n')
  
  // 1. Check odoo_products for CARILLAS
  const { data: odooProduct } = await supabase
    .from('odoo_products')
    .select('*')
    .ilike('name', '%CARILLAS%')
    .single()

  if (!odooProduct) {
    console.log('❌ No se encontró producto CARILLAS en odoo_products')
    console.log('   La sincronización de Odoo no trajo este producto')
    return
  }

  console.log('✅ Producto encontrado en Odoo:')
  console.log('   ID:', odooProduct.odoo_product_id)
  console.log('   Nombre:', odooProduct.name)
  console.log('   Precio (list_price):', odooProduct.list_price)

  // 2. Update the service
  const { data: updated, error } = await supabase
    .from('services')
    .update({
      odoo_id: odooProduct.odoo_product_id,
      sale_price_gtq: odooProduct.list_price,
      last_synced: new Date().toISOString()
    })
    .eq('name', 'LD-CARILLAS')
    .select()
    .single()

  if (error) {
    console.error('❌ Error actualizando servicio:', error)
    return
  }

  console.log('\n✅ Servicio actualizado exitosamente:')
  console.log('   odoo_id:', updated.odoo_id)
  console.log('   sale_price_gtq:', updated.sale_price_gtq)
  console.log('   last_synced:', updated.last_synced)
}

fixCarillasService()
