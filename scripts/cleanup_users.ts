
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env relative to this script
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USERS_TO_KEEP = ['admin@dentalflow.com', 'dr.julio@clinica1.com'];

async function main() {
  console.log('--- Cleaning Up Users ---');
  
  // 1. List Users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  // 2. Delete Users not in whitelist
  for (const user of users) {
    if (!USERS_TO_KEEP.includes(user.email || '')) {
      console.log(`Deleting user: ${user.email} (${user.id})`);
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) console.error(`Failed to delete ${user.email}:`, delError);
    } else {
      console.log(`Keeping user: ${user.email}`);
    }
  }

  // 3. Ensure Dr. Julio Exists
  const julioEmail = 'dr.julio@clinica1.com';
  const julioPass = 'Clinica9090!';
  
  const julioUser = users.find(u => u.email === julioEmail);
  
  if (!julioUser) {
    console.log(`Creating user: ${julioEmail}`);
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: julioEmail,
      password: julioPass,
      email_confirm: true,
      user_metadata: {
         full_name: 'Dr. Julio',
         role: 'clinic_admin' // Assuming Admin role for Clinic Flow test
      }
    });
    
    if (createError) {
        console.error('Error creating Dr. Julio:', createError);
    } else {
        console.log('Dr. Julio created successfully:', data.user.id);
        // Note: Creating the Auth User should trigger the public.users creation via triggers if they exist.
        // If the 'sync_staff_member' RPC logic was strictly for Odoo, we might need to rely on the basic triggers here.
    }
  } else {
      console.log('Dr. Julio already exists. Updating password just in case...');
      await supabase.auth.admin.updateUserById(julioUser.id, { password: julioPass });
  }

  console.log('--- Cleanup Complete ---');
}

main();
