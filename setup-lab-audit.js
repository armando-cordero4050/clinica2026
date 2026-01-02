const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log('--- ACTIVANDO MÓDULOS ---');
  const { data: moduleData, error: moduleError } = await supabase
    .from('modules')
    .update({ is_active: true })
    .in('code', ['lab_kanban', 'odoo_sync'])
    .select();
  
  if (moduleError) console.error('Error módulos:', moduleError);
  else console.log('Módulos activados:', moduleData.map(m => m.code));

  console.log('\n--- CREANDO USUARIO LAB ADMIN ---');
  const email = 'labadmin@smartnetgt.com';
  const password = 'Admin123!';

  // Crear usuario en Auth (si no existe)
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError && !authError.message.includes('already registered')) {
    console.error('Error Auth:', authError);
  } else {
    const userId = authUser?.user?.id || (await supabase.from('users').select('id').eq('email', email).single()).data?.id;
    
    if (userId) {
      console.log('Usuario Auth OK:', userId);
      
      // Asegurar perfil en schema_core.users (el trigger debería hacerlo, pero forzamos por si acaso)
      // Nota: El cliente Supabase por defecto va a 'public'.
      // Como estamos usando V5, necesitamos especificar el esquema o usar RPC.
      // Pero 'users' en V5 está en 'schema_core'.
      
      const { error: profileError } = await supabase
        .from('users')
        .upsert({ 
          id: userId, 
          email: email, 
          role: 'lab_admin',
          is_active: true 
        });

      if (profileError) console.error('Error Perfil (schema_core):', profileError);
      else console.log('Perfil Lab Admin verificado ✅');
    }
  }
}

setup();
