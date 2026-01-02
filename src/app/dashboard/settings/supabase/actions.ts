'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function testSupabaseConnection() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // Test: Call existing RPC function to verify connection
    const { data: modules, error: rpcError } = await supabase
      .rpc('get_all_modules')
    
    if (rpcError) {
      throw rpcError
    }
    
    // Get project ref from URL
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'Unknown'
    
    return {
      success: true,
      message: `Connected! Project: ${projectRef}. Found ${modules?.length || 0} modules in database.`,
      data: { modulesCount: modules?.length || 0, modules }
    }
  } catch (error: unknown) {
    console.error('Supabase Error:', error)
    const debugInfo = `URL=${process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30)}...`
    const errorMessage = error instanceof Error ? error.message : 'Connection failed'
    return {
      success: false,
      message: `${errorMessage} (${debugInfo})`
    }
  }
}
