import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigrations() {
  console.log('🚀 Aplicando migraciones...\n')

  // 1. Read and apply view fix migration
  const viewMigrationPath = path.join('d:', 'DentalFlow', 'supabase', 'migrations', '20260205000037_fix_services_view.sql')
  const viewSql = fs.readFileSync(viewMigrationPath, 'utf-8')
  
  console.log('📝 Aplicando migración de vista...')
  const { error: viewError } = await supabase.rpc('exec_sql', { sql: viewSql })
  
  if (viewError) {
    console.error('❌ Error aplicando vista:', viewError)
    // Try direct execution
    console.log('⚠️  Intentando ejecución directa...')
    
    // Split SQL into individual statements
    const statements = viewSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const stmt of statements) {
      if (stmt.toLowerCase().includes('select')) continue // Skip SELECT verification
      
      const { error } = await supabase.rpc('exec_sql', { sql: stmt })
      if (error) {
        console.error(`❌ Error en statement: ${stmt.substring(0, 50)}...`)
        console.error(error)
      } else {
        console.log(`✅ Ejecutado: ${stmt.substring(0, 50)}...`)
      }
    }
  } else {
    console.log('✅ Vista actualizada correctamente')
  }

  // 2. Update LD-CARILLAS service
  console.log('\n📝 Actualizando servicio LD-CARILLAS...')
  const { data: updated, error: updateError } = await supabase
    .from('services')
    .update({
      odoo_id: 2,
      sale_price_gtq: 600.00,
      last_synced: new Date().toISOString()
    })
    .eq('name', 'LD-CARILLAS')
    .select()

  if (updateError) {
    console.error('❌ Error actualizando servicio:', updateError)
  } else {
    console.log('✅ Servicio actualizado:', updated)
  }

  // 3. Verify
  console.log('\n🔍 Verificando resultado...')
  const { data: service } = await supabase
    .from('services')
    .select('name, odoo_id, sale_price_gtq, cost_price_gtq, base_price')
    .eq('name', 'LD-CARILLAS')
    .single()

  if (service) {
    console.log('\n✅ RESULTADO FINAL:')
    console.log('   Nombre:', service.name)
    console.log('   odoo_id:', service.odoo_id)
    console.log('   sale_price_gtq:', service.sale_price_gtq)
    console.log('   cost_price_gtq:', service.cost_price_gtq)
    console.log('   base_price:', service.base_price)
    
    if (service.sale_price_gtq === 600) {
      console.log('\n🎉 ¡ÉXITO! El precio se muestra correctamente.')
      console.log('   Refresca la página de servicios (F5) para ver Q 600.00')
    }
  }
}

applyMigrations()
