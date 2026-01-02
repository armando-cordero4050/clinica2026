'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!email || !password || !role) {
      return { success: false, message: 'All fields are required' }
    }

    // Create admin client with service role key
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { 
        success: false, 
        message: 'Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your .env file.' 
      }
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { role }
    })

    if (authError) {
      throw authError
    }

    // Update user role in schema_core.users (will be created by trigger)
    // Wait a bit for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role, is_active: true })
      .eq('id', authData.user.id)

    if (updateError) {
      console.warn('Update role warning:', updateError)
      // Don't fail if update doesn't work, trigger might handle it
    }

    revalidatePath('/dashboard/admin/users')
    
    return {
      success: true,
      message: `User ${email} created successfully with role: ${role}`
    }
  } catch (error: unknown) {
    console.error('Create User Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user'
    return {
      success: false,
      message: errorMessage
    }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    // Use admin client to bypass RLS
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { 
        success: false, 
        message: 'Service role key not configured' 
      }
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Call RPC function to update role in schema_core.users
    const { error } = await supabaseAdmin
      .rpc('update_user_role_admin', {
        p_user_id: userId,
        p_new_role: newRole
      })

    if (error) {
      throw error
    }

    revalidatePath('/dashboard/admin/users')
    
    return {
      success: true,
      message: `User role updated to: ${newRole}`
    }
  } catch (error: unknown) {
    console.error('Update Role Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update role'
    return {
      success: false,
      message: errorMessage
    }
  }
}

export async function getAllUsers() {
  try {
    // Use admin client to bypass RLS
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { 
        success: false, 
        data: [],
        message: 'Service role key not configured' 
      }
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Use new RPC that includes session information
    const { data: users, error } = await supabaseAdmin
      .rpc('get_all_users_with_sessions')

    if (error) {
      throw error
    }

    // Map the data to include is_online based on has_active_session
    const usersWithOnlineStatus = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      is_online: user.has_active_session,
      session_count: user.session_count
    }))

    return {
      success: true,
      data: usersWithOnlineStatus
    }
  } catch (error: unknown) {
    console.error('Get Users Error:', error)
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to fetch users'
    }
  }
}

export async function changeUserPassword(userId: string, newPassword: string) {
  try {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { 
        success: false, 
        message: 'Service role key not configured' 
      }
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Update user password using Admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      throw error
    }
    
    return {
      success: true,
      message: 'Password updated successfully'
    }
  } catch (error: unknown) {
    console.error('Change Password Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
    return {
      success: false,
      message: errorMessage
    }
  }
}
