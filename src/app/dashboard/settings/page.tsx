import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Server } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Supabase Connection Card */}
        <Link href="/dashboard/settings/supabase">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-500" />
                    Database Connection
                </CardTitle>
                <CardDescription>Verify Supabase connectivity and schema access.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    PostgreSQL + RLS
                </div>
            </CardContent>
            </Card>
        </Link>

        {/* Odoo Integration Card */}
        <Link href="/dashboard/settings/odoo">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-500" />
                    ERP Integration
                </CardTitle>
                <CardDescription>Configure Odoo connection and sync parameters.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    v14/v17 Support
                </div>
            </CardContent>
            </Card>
        </Link>

        {/* User Management Card */}
        <Link href="/dashboard/admin/users">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-red-500" />
                    User Management
                </CardTitle>
                <CardDescription>Create and manage system users and roles.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    Admin Only
                </div>
            </CardContent>
            </Card>
        </Link>
      </div>
    </div>
  )
}
