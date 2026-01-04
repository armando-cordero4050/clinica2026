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

// Client with ANON key (to simulate frontend auth)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLabAdmin() {
    console.log('🧪 Starting Lab Admin Test...')
    const email = 'admin.lab@a.com'
    const password = 'Admin123!'

    // 1. LOGIN
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError) {
        console.error('❌ Login Failed:', loginError.message)
        return
    }
    console.log('✅ Login Successful')

    // 2. CHECK ROLE
    const { data: profile, error: profileError } = await supabase.rpc('get_my_profile')
    if (profileError) {
        console.error('❌ Get Profile Failed:', profileError.message)
    } else {
        console.log(`✅ Profile Role: ${profile.role}`)
        if (profile.role !== 'lab_admin') console.warn('⚠️ Unexpected role')
    }

    // 3. CHECK KANBAN RPC
    const { data: kanban, error: kanbanError } = await supabase.rpc('get_lab_kanban')
    if (kanbanError) {
        console.error('❌ Kanban RPC Failed:', kanbanError.message)
    } else {
        console.log(`✅ Kanban Results: ${kanban.length} cards found`)
    }

    // 4. CHECK CLINIC STAFF (RLS TEST)
    // Query direct table like frontend does in Detail View
    const { data: staff, error: staffError } = await supabase
        .from('clinic_staff', { schema: 'schema_medical' }) // Need to specify schema in client if not public? 
        // Supabase client usually targets public unless specified. 
        // But dashboard might be using ".from('clinic_staff')" if schema is valid or exposed via view.
        // Actually the code uses: supabase.schema('schema_medical').from('clinic_staff')
        .select('*')
        .limit(5)
    
    // Note: supabase-js client needs schema selection
    const { data: staffMedical, error: staffMedicalError } = await supabase
        .schema('schema_medical')
        .from('clinic_staff')
        .select('*')
        .limit(5)

    if (staffMedicalError) {
        console.error('❌ Clinic Staff Query Failed:', staffMedicalError.message, staffMedicalError.details)
    } else {
        console.log(`✅ Clinic Staff Query: ${staffMedical.length} rows (RLS passed)`)
    }

     // 5. CHECK ORDERS (RLS TEST)
     const { data: orders, error: ordersError } = await supabase
        .schema('schema_lab')
        .from('orders')
        .select('*')
        .limit(5)

    if (ordersError) {
        console.error('❌ Orders Query Failed:', ordersError.message)
    } else {
        console.log(`✅ Orders Query: ${orders.length} rows (RLS passed)`)
    }

    console.log('🏁 Test Complete')
}

testLabAdmin()
