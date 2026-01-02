-- ACTUALIZACIÓN CREDENCIALES ADMIN CORE
-- Fecha: 31/12/2025
-- Descripción: Establece al usuario admin@dentalflow.com como super_admin

DO $$
DECLARE
  v_user_id UUID;
  v_encrypted_pw TEXT;
BEGIN
  -- Password: Admin123!
  v_encrypted_pw := crypt('Admin123!', gen_salt('bf'));
  
  -- 1. Buscar o Crear en Auth
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@dentalflow.com';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'admin@dentalflow.com', 
      v_encrypted_pw, now(), 
      '{"provider":"email","providers":["email"]}', '{"name":"Core Admin"}', 
      'authenticated', 'authenticated', now(), now()
    );
    RAISE NOTICE 'Usuario auth creado: %', v_user_id;
  ELSE
    UPDATE auth.users 
    SET encrypted_password = v_encrypted_pw, updated_at = now()
    WHERE id = v_user_id;
    RAISE NOTICE 'Password actualizado para: %', v_user_id;
  END IF;

  -- 2. Asegurar en Schema Core con Rol Super Admin
  INSERT INTO schema_core.users (id, email, name, role, is_active)
  VALUES (v_user_id, 'admin@dentalflow.com', 'Core Admin', 'super_admin', true)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin', is_active = true, email = EXCLUDED.email;
  
  RAISE NOTICE 'Permisos de super_admin aplicados.';

END $$;
