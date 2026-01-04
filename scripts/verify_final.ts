import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyFinal() {
    console.log('🛡️  Verifying Final Permissions...')
    
    // 1. LOGIN
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin.lab@a.com',
        password: 'Admin123!'
    })

    if (loginError) {
        console.error('❌ Login error:', loginError.message)
        return
    }

    // 2. CHECK PROFILE
    const { data: profile } = await supabase.rpc('get_my_profile')
    console.log(`👤 Role: ${profile?.role}`)

    // 3. QUERY PUBLIC STAFF
    const { data: staff, error: staffError, count: staffCount } = await supabase
        .from('clinic_staff')
        .select('*', { count: 'exact' })
        .limit(2)
    
    if (staffError) {
        console.error('❌ Public Staff Error:', staffError.message)
    } else {
        console.log(`✅ Public Staff Found: ${staffCount} rows`)
        if (staff && staff.length > 0) console.log('   Sample:', staff[0].id)
    }

    // 4. QUERY PUBLIC ORDERS
    const { data: orders, error: ordersError, count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .limit(2)

    if (ordersError) {
        console.error('❌ Public Orders Error:', ordersError.message)
    } else {
        console.log(`✅ Public Orders Found: ${ordersCount} rows`)
    }
}

verifyFinal()
