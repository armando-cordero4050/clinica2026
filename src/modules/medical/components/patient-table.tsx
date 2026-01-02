'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Eye, 
  Plus,
  Calendar,
  FileText,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  User
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Patient } from '@/modules/medical/actions/patients'
import { PatientSheet } from '@/modules/medical/components/patient-sheet'

interface PatientTableProps {
  patients: Patient[]
  clinicId: string
}

export function PatientTable({ patients, clinicId }: PatientTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      patient.first_name?.toLowerCase().includes(query) ||
      patient.last_name?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      patient.patient_code?.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query)
    )
  })

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setSheetOpen(true)
  }

  const handleOpenHistory = (patientId: string) => {
    router.push(`/dashboard/medical/patients/${patientId}`)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return `${first}${last}`.toUpperCase()
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, teléfono o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Acciones
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Nuevo paciente
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="mr-2 h-4 w-4" />
              Agendar cita
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Crear presupuesto
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Crear campaña
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold">Última Cita</TableHead>
              <TableHead className="font-semibold">Próxima Cita</TableHead>
              <TableHead className="font-semibold text-center">Tareas</TableHead>
              <TableHead className="font-semibold">Presupuesto</TableHead>
              <TableHead className="font-semibold">Fuente</TableHead>
              <TableHead className="font-semibold">Comentario</TableHead>
              <TableHead className="font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => {
                const budgetPercentage = 0

                return (
                  <TableRow 
                    key={patient.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewPatient(patient)}
                  >
                    {/* Patient Column */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.id}`} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                            {getInitials(patient.first_name, patient.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {/* Tags would go here */}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Last Appointment */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">--</span>
                      </div>
                    </TableCell>

                    {/* Next Appointment */}
                    <TableCell>
                      <span className="text-sm text-gray-900">--</span>
                    </TableCell>

                    {/* Tasks */}
                    <TableCell className="text-center">
                       <span className="text-gray-400">--</span>
                    </TableCell>

                    {/* Budget */}
                    <TableCell>
                      <div className="space-y-1 min-w-[150px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Q 0</span>
                          <span className="text-gray-400">/ Q 0</span>
                        </div>
                        <Progress 
                          value={budgetPercentage} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>

                    {/* Source */}
                    <TableCell>
                      <Badge variant="outline" className="text-xs">--</Badge>
                    </TableCell>

                    {/* Comment */}
                    <TableCell>
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">--</p>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleViewPatient(patient)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleOpenHistory(patient.id)
                          }}>
                            <FileText className="mr-2 h-4 w-4" />
                            Abrir historia
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Agendar cita
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <FileText className="mr-2 h-4 w-4" />
                            Crear presupuesto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Patient Sheet */}
      {selectedPatient && (
        <PatientSheet
          patient={selectedPatient}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          clinicId={clinicId}
        />
      )}
    </div>
  )
}
