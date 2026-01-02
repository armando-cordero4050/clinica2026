'use client'

import { useState, useEffect } from 'react'
import { getSyncedClinics, syncClinicsFromOdoo } from '@/modules/medical/actions/clinics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Users,
  RefreshCw,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Clinic {
  id: string
  name: string
  address: string | null
  city: string | null
  country: string | null
  phone: string | null
  email: string | null
  nit: string | null
  website: string | null
  is_active: boolean
  odoo_partner_id: number | null
  last_synced_from_odoo: string | null
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const loadClinics = async () => {
    setLoading(true)
    const data = await getSyncedClinics()
    setClinics(data as Clinic[])
    setLoading(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    toast.info('Iniciando sincronización de clínicas desde Odoo...')
    
    const result = await syncClinicsFromOdoo()
    
    if (result.success) {
      toast.success(result.message)
      loadClinics()
    } else {
      toast.error(result.message)
    }
    
    setSyncing(false)
  }

  useEffect(() => {
    loadClinics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 container max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Clínicas</h1>
            <p className="text-muted-foreground italic">Clínicas sincronizadas desde Odoo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar desde Odoo'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Total Clínicas</p>
                <p className="text-3xl font-bold text-indigo-600">{clinics.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Activas</p>
                <p className="text-3xl font-bold text-green-600">
                  {clinics.filter(c => c.is_active).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Última Sincronización</p>
                <p className="text-sm font-bold text-purple-600">
                  {clinics.length > 0 && clinics[0].last_synced_from_odoo 
                    ? new Date(clinics[0].last_synced_from_odoo).toLocaleDateString('es-ES')
                    : 'N/A'
                  }
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clinics.length === 0 ? (
          <Card className="col-span-full border-none shadow-md">
            <CardContent className="py-12 text-center text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No hay clínicas sincronizadas</p>
              <p className="text-sm mt-1">Sincroniza clínicas desde Odoo para comenzar</p>
            </CardContent>
          </Card>
        ) : (
          clinics.map((clinic) => (
            <Link key={clinic.id} href={`/dashboard/medical/clinics/${clinic.id}`}>
              <Card className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {clinic.name}
                    </CardTitle>
                    <Badge className={clinic.is_active ? 'bg-green-600' : 'bg-gray-400'}>
                      {clinic.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {clinic.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-700">{clinic.address}</p>
                        <p className="text-gray-500 text-xs">
                          {clinic.city}, {clinic.country}
                        </p>
                      </div>
                    </div>
                  )}

                  {clinic.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {clinic.phone}
                    </div>
                  )}

                  {clinic.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {clinic.email}
                    </div>
                  )}

                  {clinic.website && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Globe className="h-4 w-4" />
                      {clinic.website}
                    </div>
                  )}

                  {clinic.nit && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500">NIT: <span className="font-mono font-bold text-gray-700">{clinic.nit}</span></p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Odoo ID: {clinic.odoo_partner_id}
                    </p>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Ver Detalles →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
