import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Shield, Menu, Zap } from 'lucide-react'
import { RolesOverviewTable } from '@/components/settings/roles-overview-table'
import { MenuPermissionsMatrix } from '@/components/settings/menu-permissions-matrix'
import { ActionsPermissionsMatrix } from '@/components/settings/actions-permissions-matrix'
import { ROLES } from '@/lib/roles-data'

export const dynamic = 'force-dynamic'

export default function RolesPermissionsPage() {
  const clinicRoles = ROLES.filter(r => r.type === 'Clínica').length
  const labRoles = ROLES.filter(r => r.type === 'Laboratorio').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Roles y Permisos</h1>
        <p className="text-gray-500 mt-2">
          Matriz de permisos por rol en DentalFlow
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Total de Roles</p>
                <p className="text-2xl font-bold text-indigo-600">{ROLES.length}</p>
              </div>
              <Shield className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Roles de Laboratorio</p>
                <p className="text-2xl font-bold text-purple-600">{labRoles}</p>
              </div>
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Roles de Clínica</p>
                <p className="text-2xl font-bold text-cyan-600">{clinicRoles}</p>
              </div>
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permisos</CardTitle>
          <CardDescription>
            Visualiza qué puede hacer cada rol en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Resumen de Roles</span>
                <span className="md:hidden">Roles</span>
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                <span className="hidden md:inline">Permisos de Menú</span>
                <span className="md:hidden">Menú</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline">Permisos de Acciones</span>
                <span className="md:hidden">Acciones</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <RolesOverviewTable />
            </TabsContent>

            <TabsContent value="menu" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    ✓ Permitido
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                    ✗ Denegado
                  </Badge>
                </div>
                <MenuPermissionsMatrix />
              </div>
            </TabsContent>

            <TabsContent value="actions" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    ✓ Permitido
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                    ✗ Denegado
                  </Badge>
                </div>
                <ActionsPermissionsMatrix />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Info Note */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Nota Importante</p>
              <p>
                Esta matriz de permisos es solo de lectura y sirve como documentación. 
                Los permisos están definidos en el código de la aplicación. 
                Para modificar permisos, contacta al equipo de desarrollo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
