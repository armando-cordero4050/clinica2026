const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client para operaciones de sistema
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('--- 1. ACTIVANDO MÓDULOS ---');
  // Obtener IDs de módulos
  const { data: modules, error: modErr } = await supabaseAdmin.rpc('get_all_modules');
  if (modErr) {
    console.error('Error al obtener módulos:', modErr);
  } else {
    for (const m of modules) {
      if (['lab_kanban', 'odoo_sync', 'medical_emr'].includes(m.code)) {
        const { error: updErr } = await supabaseAdmin.rpc('update_module_status', {
          p_module_id: m.id,
          p_is_active: true
        });
        if (updErr) console.error(`Error activando ${m.code}:`, updErr);
        else console.log(`Módulo ${m.code} ACTIVADO ✅`);
      }
    }
  }

  console.log('\n--- 2. CREANDO USUARIO LAB ADMIN ---');
  const email = 'labadmin@smartnetgt.com';
  const password = 'Admin123!';
  const role = 'lab_admin';

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role }
  });

  if (authError && !authError.message.includes('already registered')) {
    console.error('Error Auth:', authError);
    return;
  }

  let userId;
  if (authError && authError.message.includes('already registered')) {
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    userId = listData.users.find(u => u.email === email)?.id;
    console.log('Usuario ya existía:', userId);
  } else {
    userId = authData.user.id;
    console.log('Usuario creado exitosamente:', userId);
  }

  // Sincronizar rol en schema_core.users via RPC si existe o directo
  console.log('Actualizando rol a lab_admin...');
  const { error: roleError } = await supabaseAdmin.from('schema_core.users').update({ role }).eq('id', userId);
  
  if (roleError) {
    console.log('Error update directo (esperado si no expuesto), intentando RPC...');
    const { error: rpcError } = await supabaseAdmin.rpc('update_user_role_admin', {
      p_user_id: userId,
      p_new_role: role
    });
    if (rpcError) console.error('Error RPC rol:', rpcError);
    else console.log('Rol actualizado via RPC ✅');
  } else {
    console.log('Rol actualizado directo ✅');
  }

  console.log('\n--- LISTO ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main();
