import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeRawSQL(sql: string) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    // If exec_sql doesn't exist, we'll need to execute via REST API
    console.log('⚠️  exec_sql RPC not available, trying direct execution...')
    
    // For PostgreSQL functions, we can use the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return { success: true, data: await response.json() }
  }
}

async function applyRPCFix() {
  console.log('🚀 Aplicando fix para QNaN...\n')

  const sql = `
CREATE OR REPLACE FUNCTION public.get_active_lab_services()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  sale_price_gtq DECIMAL,
  sale_price_usd DECIMAL,
  cost_price_gtq DECIMAL,
  cost_price_usd DECIMAL,
  turnaround_days INTEGER,
  is_active BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, schema_lab
AS $$
  SELECT 
    id,
    name,
    description,
    category,
    image_url,
    sale_price_gtq,
    sale_price_usd,
    cost_price_gtq,
    cost_price_usd,
    turnaround_days,
    is_active
  FROM schema_lab.services
  WHERE is_active = true
  ORDER BY name;
$$;
  `

  console.log('📝 Ejecutando SQL...')
  console.log('⚠️  NOTA: Este script requiere que ejecutes el SQL manualmente en Supabase Dashboard')
  console.log('          porque no tenemos un RPC exec_sql configurado.\n')
  
  console.log('📋 Copia y pega este SQL en Supabase Dashboard → SQL Editor:\n')
  console.log('─'.repeat(80))
  console.log(sql)
  console.log('─'.repeat(80))
  
  console.log('\n✅ Después de ejecutar el SQL:')
  console.log('   1. Refresca la página de servicios (F5)')
  console.log('   2. Deberías ver Q 600.00 en lugar de QNaN')
}

applyRPCFix()
