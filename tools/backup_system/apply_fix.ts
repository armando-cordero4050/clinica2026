import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'schema_lab' }
})

async function applyFix() {
  console.log('🚀 Aplicando fix de precios...\n')

  // Direct update to schema_lab.services
  console.log('📝 Actualizando servicio LD-CARILLAS en schema_lab.services...')
  
  const { data: updated, error: updateError } = await supabase
    .schema('schema_lab')
    .from('services')
    .update({
      odoo_id: 2,
      sale_price_gtq: 600.00,
      last_synced: new Date().toISOString()
    })
    .eq('name', 'LD-CARILLAS')
    .select()

  if (updateError) {
    console.error('❌ Error:', updateError)
    console.log('\n⚠️  Intentando con cliente público...')
    
    // Try with public schema
    const publicClient = createClient(supabaseUrl, supabaseKey)
    const { data: result, error: err2 } = await publicClient
      .from('services')
      .update({
        odoo_id: 2,
        sale_price_gtq: 600.00
      })
      .eq('name', 'LD-CARILLAS')
      .select()
    
    if (err2) {
      console.error('❌ Error con cliente público:', err2)
      console.log('\n📋 Ejecuta este SQL manualmente en Supabase Dashboard:')
      console.log(`
UPDATE schema_lab.services
SET 
    odoo_id = 2,
    sale_price_gtq = 600.00,
    last_synced = NOW()
WHERE name = 'LD-CARILLAS';
      `)
    } else {
      console.log('✅ Actualizado con cliente público:', result)
    }
  } else {
    console.log('✅ Servicio actualizado:', updated)
  }

  // Verify with public view
  console.log('\n🔍 Verificando con vista pública...')
  const publicClient = createClient(supabaseUrl, supabaseKey)
  const { data: service, error: verifyError } = await publicClient
    .from('services')
    .select('*')
    .eq('name', 'LD-CARILLAS')
    .single()

  if (verifyError) {
    console.error('❌ Error verificando:', verifyError)
  } else {
    console.log('\n✅ RESULTADO:')
    console.log('Columnas disponibles:', Object.keys(service))
    console.log('\nDatos:')
    console.log('   Nombre:', service.name)
    console.log('   sale_price_gtq:', service.sale_price_gtq)
    console.log('   cost_price_gtq:', service.cost_price_gtq)
    console.log('   base_price:', service.base_price)
    console.log('   odoo_id:', service.odoo_id)
  }
}

applyFix()
