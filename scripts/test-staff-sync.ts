
import { createClient } from './src/lib/supabase/client'
import * as dotenv from 'dotenv'
dotenv.config()

async function testSync() {
  const supabase = createClient()
  
  console.log('Testing RPC sync_staff_member_from_odoo for Dr Pedro (ID 83)...')
  
  const payload = {
    p_odoo_contact_id: 83,
    p_clinic_odoo_id: 83,
    p_name: 'Dr Pedro el escamoso (Test)',
    p_email: 'drpedro@clinica.com',
    p_job_position: 'Administrador Clínica',
    p_phone: '12345678',
    p_mobile: null,
    p_raw_data: { id: 83, name: 'Dr Pedro el escamoso' }
  }

  const { data, error } = await supabase.rpc('sync_staff_member_from_odoo', payload)

  if (error) {
    console.error('RPC Error:', error)
  } else {
    console.log('RPC Success! Result ID:', data)
    
    // Check if user was created
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'drpedro@clinica.com')
      .single()
    console.log('User Record:', user)

    // Check if staff was created
    const { data: staff } = await supabase
      .from('clinic_staff')
      .select('*')
      .eq('odoo_contact_id', 83)
      .single()
    console.log('Staff Record:', staff)
  }
}

testSync()
