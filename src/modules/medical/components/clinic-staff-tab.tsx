'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Key, Shield, CheckCircle2, Briefcase, Loader2 } from 'lucide-react'
import { updateStaffRole, resetStaffPassword } from '@/modules/medical/actions/clinics'
import { toast } from 'sonner'
import { AddStaffDialog } from './add-staff-dialog'

interface StaffMember {
  id: string
  user_id: string
  name: string
  email: string
  role: string
  is_primary: boolean
  odoo_contact_id: number
  title?: string
  job_position?: string
  phone?: string
  mobile?: string
}

interface ClinicStaffTabProps {
  staff: StaffMember[]
  clinicId: string
}

const ROLE_LABELS: Record<string, string> = {
  clinic_admin: 'Administrador',
  clinic_doctor: 'Doctor',
  clinic_staff: 'Staff',
  clinic_receptionist: 'Recepcionista'
}

const ROLE_COLORS: Record<string, string> = {
  clinic_admin: 'bg-red-600',
  clinic_doctor: 'bg-blue-600',
  clinic_staff: 'bg-green-600',
  clinic_receptionist: 'bg-purple-600'
}

export function ClinicStaffTab({ staff, clinicId }: ClinicStaffTabProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [updating, setUpdating] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const handleResetPassword = async () => {
    if (!selectedStaff || !newPassword) {
      toast.error('Ingresa una contraseña')
      return
    }

    setUpdating(true)
    try {
      const result = await resetStaffPassword(selectedStaff.user_id, newPassword)
      
      if (result.success) {
        toast.success(result.message)
        setShowPasswordDialog(false)
        setNewPassword('')
        setSelectedStaff(null)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error al restablecer contraseña')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Staff de la Clínica ({staff.length})
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Sincronizado desde los contactos de Odoo vinculados a esta clínica.
              </p>
            </div>
            <div className="flex items-center gap-3">
               <AddStaffDialog clinicId={clinicId} />
               <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Control de Acceso</span>
               </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {staff.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">No hay staff registrado</p>
              <p className="text-sm mt-1 max-w-xs mx-auto">Sincroniza la clínica desde el panel de Odoo para importar los contactos.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold text-gray-700 pl-6">Nombre del Contacto</TableHead>
                  <TableHead className="font-bold text-gray-700">Correo Electrónico</TableHead>
                  <TableHead className="font-bold text-gray-700">Puesto de Trabajo</TableHead>
                  <TableHead className="font-bold text-gray-700">Rol Sistema</TableHead>
                  <TableHead className="text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id} className="hover:bg-blue-50/30 transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{member.name}</span>
                        {member.is_primary && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] hover:bg-amber-100">
                            PRIME
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm">{member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm">{member.job_position || 'Sin especificar'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={`${ROLE_COLORS[member.role] || 'bg-gray-400'} text-white text-[10px] items-center gap-1`}>
                          {ROLE_LABELS[member.role] || member.role}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <Dialog 
                          open={showPasswordDialog && selectedStaff?.id === member.id} 
                          onOpenChange={(open) => {
                            if (!open) {
                               setShowPasswordDialog(false)
                               setNewPassword('')
                               setSelectedStaff(null)
                            }
                          }}
                        >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 gap-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 font-bold transition-all active:scale-95"
                            onClick={() => {
                               setSelectedStaff(member)
                               setShowPasswordDialog(true)
                            }}
                          >
                            <Key className="h-4 w-4" />
                            RESETEAR
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                               <Key className="h-5 w-5 text-indigo-600" />
                               Resetear Contraseña
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                              Ingresa la nueva contraseña para <b>{member.name}</b>. 
                              Este cambio afectará su inicio de sesión inmediato.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-6">
                            <div className="space-y-2">
                              <Label htmlFor="new-password">Nueva Contraseña</Label>
                              <Input
                                id="new-password"
                                type="password"
                                className="h-10 border-indigo-100 focus-visible:ring-indigo-500"
                                placeholder="Minimo 8 caracteres"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                              variant="ghost"
                              className="font-bold text-gray-500"
                              onClick={() => {
                                setShowPasswordDialog(false)
                                setNewPassword('')
                                setSelectedStaff(null)
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleResetPassword}
                              disabled={updating || !newPassword}
                              className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 shadow-md"
                            >
                              {updating ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Guardando...
                                </>
                              ) : 'Confirmar Cambio'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <div className="px-1 text-[10px] text-gray-400 font-medium flex items-center gap-2">
          <Shield className="h-3 w-3" />
          TODOS LOS CAMBIOS DE CONTRASEÑA SON AUDITADOS Y SE APLICAN A LA CUENTA DE USUARIO VINCULADA.
      </div>
    </div>
  )
}
