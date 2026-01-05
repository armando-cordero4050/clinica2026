import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 Verificando esquema de tabla services...\n')
  
  // Get all columns from services table
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Columnas disponibles en services:')
    console.log(Object.keys(data[0]))
    console.log('\n📊 Datos del primer servicio:')
    console.log(JSON.stringify(data[0], null, 2))
  } else {
    console.log('⚠️  No hay datos en services')
  }

  // Also check schema_lab.services directly
  console.log('\n🔍 Intentando acceder a schema_lab.services directamente...')
  const { data: labData, error: labError } = await supabase
    .schema('schema_lab')
    .from('services')
    .select('*')
    .limit(1)

  if (labError) {
    console.error('❌ Error accediendo a schema_lab.services:', labError)
  } else if (labData && labData.length > 0) {
    console.log('✅ Columnas en schema_lab.services:')
    console.log(Object.keys(labData[0]))
    console.log('\n📊 Datos:')
    console.log(JSON.stringify(labData[0], null, 2))
  }
}

checkSchema()
