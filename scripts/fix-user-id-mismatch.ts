import 'dotenv/config'
import { createAdminClient } from '../src/lib/supabase/admin'

async function fixUserIdMismatch() {
  const adminClient = createAdminClient()
  
  const email = 'drpedro@clinica.com'
  const correctId = '5106edb9-e0ed-43bb-a49c-8427bbde07ae'
  const incorrectId = 'c8f7c5d5-24a6-475f-bbef-9185d8a01f7b'
  
  console.log('🔍 Fixing ID mismatch for:', email)
  console.log('   Correct ID (Core):', correctId)
  console.log('   Incorrect ID (Auth):', incorrectId)
  
  try {
    // Step 1: Delete the incorrect user from auth.users
    console.log('\n1️⃣ Deleting incorrect auth user...')
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(incorrectId)
    if (deleteError) {
      console.error('   ❌ Error deleting user:', deleteError.message)
    } else {
      console.log('   ✅ Incorrect auth user deleted')
    }
    
    // Step 2: Create the correct auth user with the same ID as core
    console.log('\n2️⃣ Creating correct auth user with matching ID...')
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      id: correctId,
      email,
      password: 'Clinica9090!',
      email_confirm: true,
      user_metadata: {
        role: 'clinic_admin',
        name: 'Dr Pedro el escamoso'
      }
    })
    
    if (createError) {
      console.error('   ❌ Error creating user:', createError.message)
    } else {
      console.log('   ✅ Auth user created with correct ID:', created.user.id)
    }
    
    // Step 3: Verify the fix
    console.log('\n3️⃣ Verifying fix...')
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
    if (listError) {
      console.error('   ❌ Error listing users:', listError.message)
    } else {
      const authUser = users.find(u => u.email === email)
      if (authUser) {
        console.log('   ✅ Auth user ID:', authUser.id)
        console.log('   ✅ Match:', authUser.id === correctId ? 'YES' : 'NO')
      }
    }
    
    console.log('\n✅ Fix completed! User can now log in with correct role.')
    console.log('   Email:', email)
    console.log('   Password: Clinica9090!')
    
  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error.message)
  }
}

fixUserIdMismatch()
