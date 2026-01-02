'use client'

import { useState } from 'react'
import { Patient, searchPatients } from '@/modules/medical/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, UserPlus, FileText } from 'lucide-react'
import NewPatientDialog from './new-patient-dialog'

export default function PatientList({ initialPatients }: { initialPatients: Patient[] }) {
  const [patients, setPatients] = useState(initialPatients)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (term: string) => {
    setQuery(term)
    setLoading(true)
    // Debounce could be added here, but for now direct call on blur/enter or enough delay
    // Let's just search on every few chars or valid input
    try {
      const results = await searchPatients(term)
      setPatients(results)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-8"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <NewPatientDialog />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Allergies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.full_name}`} />
                      <AvatarFallback>{patient.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{patient.full_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span>{patient.email || '-'}</span>
                      <span>{patient.phone || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '-'}
                  </TableCell>
                   <TableCell>
                    {patient.allergies && patient.allergies.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                            {patient.allergies.map((a: any, i: number) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full truncate max-w-[100px]">{a}</span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                       <FileText className="h-4 w-4" />
                       <span className="sr-only">Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
