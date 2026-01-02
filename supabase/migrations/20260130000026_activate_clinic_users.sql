-- Activate clinic staff users by setting their passwords
-- Password for all: ClinicTemp2024!

DO $$
DECLARE
  v_user RECORD;
  v_encrypted_password TEXT;
  v_auth_exists BOOLEAN;
BEGIN
  -- Generate encrypted password for: ClinicTemp2024!
  v_encrypted_password := crypt('ClinicTemp2024!', gen_salt('bf'));

  -- Process each pending clinic staff
  FOR v_user IN 
    SELECT id, email, name
    FROM schema_core.users
    WHERE role IN ('clinic_admin', 'clinic_staff', 'clinic_doctor', 'clinic_receptionist')
    AND is_pending_activation = TRUE
  LOOP
    -- Check if user exists in auth.users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = v_user.id) INTO v_auth_exists;

    IF v_auth_exists THEN
      -- Update existing auth user
      UPDATE auth.users
      SET 
        encrypted_password = v_encrypted_password,
        email_confirmed_at = NOW(),
        updated_at = NOW()
      WHERE id = v_user.id;
      
      RAISE NOTICE 'Updated password for existing user: % (%)', v_user.name, v_user.email;
    ELSE
      -- Create new auth user (trigger will fail but we handle it)
      BEGIN
        INSERT INTO auth.users (
          id,
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          raw_app_meta_data,
          raw_user_meta_data,
          is_super_admin,
          role,
          aud,
          confirmation_token
        )
        VALUES (
          v_user.id,
          '00000000-0000-0000-0000-000000000000',
          v_user.email,
          v_encrypted_password,
          NOW(),
          NOW(),
          NOW(),
          '{"provider":"email","providers":["email"]}',
          jsonb_build_object('name', v_user.name),
          FALSE,
          'authenticated',
          'authenticated',
          ''
        );
        
        RAISE NOTICE 'Created new auth user: % (%)', v_user.name, v_user.email;
      EXCEPTION
        WHEN unique_violation THEN
          -- Ignore if trigger already created it, just update password
          UPDATE auth.users
          SET encrypted_password = v_encrypted_password
          WHERE id = v_user.id;
          RAISE NOTICE 'Updated password after trigger: % (%)', v_user.name, v_user.email;
      END;
    END IF;

    -- Mark as activated
    UPDATE schema_core.users
    SET is_pending_activation = FALSE
    WHERE id = v_user.id;
  END LOOP;
END $$;
