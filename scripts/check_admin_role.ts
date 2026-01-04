import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminRole() {
    const email = 'admin@dentalflow.com'
    console.log(`Checking role for ${email}...`)

    // 1. Get User ID from Auth
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
        console.error('Error fetching users:', userError)
        return
    }

    const user = users.find(u => u.email === email)
    if (!user) {
        console.error('User not found in Auth!')
        return
    }

    console.log('User ID:', user.id)

    // 2. Get Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('Error fetching profile:', profileError)
    } else {
        console.log('Profile Role:', profile.role)
        if (profile.role !== 'super_admin') {
            console.warn('⚠️ WARNING: Role is NOT super_admin')
        } else {
            console.log('✅ Role is correct: super_admin')
        }
    }
}

checkAdminRole()
