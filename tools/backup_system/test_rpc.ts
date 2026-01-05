import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRPC() {
  console.log('🔍 Probando RPC get_active_lab_services...\n')
  
  const { data, error } = await supabase.rpc('get_active_lab_services')
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log('✅ RPC ejecutado correctamente')
  console.log(`📊 Servicios encontrados: ${data?.length || 0}\n`)
  
  if (data && data.length > 0) {
    const carillas = data.find((s: any) => s.name === 'LD-CARILLAS')
    
    if (carillas) {
      console.log('🎯 Servicio LD-CARILLAS:')
      console.log('   Columnas disponibles:', Object.keys(carillas))
      console.log('\n📋 Datos completos:')
      console.log(JSON.stringify(carillas, null, 2))
    } else {
      console.log('⚠️  LD-CARILLAS no encontrado')
      console.log('\n📋 Primer servicio como ejemplo:')
      console.log(JSON.stringify(data[0], null, 2))
    }
  } else {
    console.log('⚠️  No se encontraron servicios')
  }
}

testRPC()
