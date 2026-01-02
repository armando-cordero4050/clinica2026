import { createClient } from '@/lib/supabase/server'
import ModuleInstallerClient from './client-page'

export default async function ModuleInstallerPage() {
  const supabase = await createClient()
  
  // Note: We use RPC to access schema_core data securely
  const { data: modules, error } = await supabase.rpc('get_all_modules')

  if (error) {
    return <div className="p-4 text-red-500">Error loading modules: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">App Modules</h1>
        <p className="text-muted-foreground">Manage active subsystems</p>
      </div>
      <ModuleInstallerClient modules={modules || []} />
    </div>
  )
}
