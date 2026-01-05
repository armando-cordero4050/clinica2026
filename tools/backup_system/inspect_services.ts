
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectServices() {
  console.log('Inspecting services and prices...')
  
  const { data: services, error: sErr } = await supabase
    .from('services')
    .select('*')
    .limit(5)
    
  if (sErr) console.error('Services error:', sErr)
  else console.log('Services count:', services.length, 'Sample:', services[0])

  const { data: prices, error: pErr } = await supabase
    .from('clinic_service_prices')
    .select('*')
    .limit(5)

  if (pErr) console.error('Prices error:', pErr)
  else console.log('Prices count:', prices.length, 'Sample:', prices[0])
}

inspectServices()
