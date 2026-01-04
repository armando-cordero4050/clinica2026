// Script to create Supabase Storage bucket via API
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createBucket() {
  console.log('🔵 Creating lab-files bucket...')
  
  // Create bucket
  const { data, error } = await supabase.storage.createBucket('lab-files', {
    public: true,
    fileSizeLimit: 52428800, // 50MB in bytes
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Bucket already exists!')
      return
    }
    console.error('🔴 Error creating bucket:', error)
    throw error
  }

  console.log('✅ Bucket created successfully:', data)
}

createBucket()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('🔴 Failed:', error)
    process.exit(1)
  })
