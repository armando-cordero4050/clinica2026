import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Phone, Mail, Globe, FileText, Building2 } from 'lucide-react'

interface ClinicInfoTabProps {
  clinic: any
}

export function ClinicInfoTab({ clinic }: ClinicInfoTabProps) {
  const odooData = clinic.odoo_raw_data || {}

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Nombre</p>
            <p className="text-gray-900 font-medium">{clinic.name}</p>
          </div>

          {clinic.nit && (
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">NIT</p>
              <p className="text-gray-900 font-mono">{clinic.nit}</p>
            </div>
          )}

          {clinic.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Email</p>
                <p className="text-gray-900">{clinic.email}</p>
              </div>
            </div>
          )}

          {clinic.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Teléfono</p>
                <p className="text-gray-900">{clinic.phone}</p>
              </div>
            </div>
          )}

          {clinic.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Sitio Web</p>
                <a 
                  href={clinic.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {clinic.website}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Dirección
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {clinic.address && (
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Calle</p>
              <p className="text-gray-900">{clinic.address}</p>
            </div>
          )}

          {clinic.city && (
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Ciudad</p>
              <p className="text-gray-900">{clinic.city}</p>
            </div>
          )}

          {clinic.country && (
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">País</p>
              <p className="text-gray-900">{clinic.country}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Odoo Sync Information */}
      <Card className="border-none shadow-md col-span-full">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Información de Sincronización
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Odoo Partner ID</p>
              <p className="text-gray-900 font-mono">{clinic.odoo_partner_id}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Última Sincronización</p>
              <p className="text-gray-900">
                {clinic.last_synced_from_odoo 
                  ? new Date(clinic.last_synced_from_odoo).toLocaleString('es-ES')
                  : 'Nunca'
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Estado</p>
              <p className={`font-bold ${clinic.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                {clinic.is_active ? 'Activa' : 'Inactiva'}
              </p>
            </div>
          </div>

          {odooData && Object.keys(odooData).length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-bold uppercase mb-2">Datos Completos de Odoo</p>
              <pre className="text-xs text-gray-700 overflow-auto max-h-64">
                {JSON.stringify(odooData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
