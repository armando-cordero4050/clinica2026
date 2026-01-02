const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Usamos schema_core explícitamente para V5
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'schema_core' }
});

async function setup() {
  console.log('--- ACTUALIZANDO MÓDULOS EN schema_core ---');
  const { data: moduleData, error: moduleError } = await supabase
    .from('modules')
    .update({ is_active: true })
    .in('code', ['lab_kanban', 'odoo_sync'])
    .select();
  
  if (moduleError) console.error('Error módulos:', moduleError);
  else console.log('Módulos activos:', moduleData.map(m => m.code));

  console.log('\n--- VERIFICANDO USUARIO LAB ADMIN ---');
  const email = 'labadmin@smartnetgt.com';
  const password = 'Admin123!';

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  let userId;
  if (authError && authError.message.includes('already registered')) {
    const { data: listData } = await supabase.auth.admin.listUsers();
    userId = listData.users.find(u => u.email === email)?.id;
    console.log('Usuario ya existía en Auth:', userId);
  } else if (authUser) {
    userId = authUser.user.id;
    console.log('Usuario Auth creado:', userId);
  }

  if (userId) {
    const { error: profileError } = await supabase
      .from('users')
      .upsert({ 
        id: userId, 
        email: email, 
        role: 'lab_admin',
        is_active: true 
      });

    if (profileError) console.error('Error Perfil:', profileError);
    else console.log('Perfil Lab Admin verificado en schema_core ✅');
  }
}

setup();
