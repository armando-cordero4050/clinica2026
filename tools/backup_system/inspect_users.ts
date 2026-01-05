
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'd:\\DentalFlow\\.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectUsers() {
  console.log('Inspecting schema_core.users...')
  
  // Try to select one row to see structure
  const { data, error } = await supabase
    .from('users') // schema_core is often exposed as "users" if in search_path, or we query directly
    .select('*')
    .limit(1)

  if (error) {
     // If it fails, try explicity schema if possible (supabase-js defaults to public usually)
     // But schema_core tables might strictly be internal.
     // Let's try querying `clinic_staff` and expanding `users` relation if it exists
     console.log('Direct select failed, trying via clinic_staff relation...')
     
     const { data: staffData, error: staffError } = await supabase
        .from('clinic_staff')
        .select('*, user:user_id(*)')
        .limit(1)
        
     if (staffError) {
        console.error('Error fetching clinic_staff:', staffError)
     } else {
        console.log('Clinic Staff sample:', JSON.stringify(staffData, null, 2))
     }
  } else {
    console.log('Users sample:', data)
  }
}

inspectUsers()
