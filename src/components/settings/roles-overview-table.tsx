'use client'

import { ROLES } from '@/lib/roles-data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'

export function RolesOverviewTable() {
  const getRoleColor = (color: string) => {
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300'
    }
    return colors[color] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Rol</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Nivel de Acceso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROLES.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  {role.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getRoleColor(role.color)}>
                  {role.type}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {role.description}
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm font-medium text-gray-700">
                  {role.level}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
