'use client'

import { ROLES, ACTION_PERMISSIONS } from '@/lib/roles-data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, XCircle } from 'lucide-react'

export function ActionsPermissionsMatrix() {
  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] sticky left-0 bg-white z-10">Acción</TableHead>
            {ROLES.map((role) => (
              <TableHead key={role.id} className="text-center min-w-[120px]">
                <div className="text-xs font-semibold">{role.name}</div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(ACTION_PERMISSIONS).map(([action, permissions]) => (
            <TableRow key={action}>
              <TableCell className="font-medium sticky left-0 bg-white z-10">
                {action}
              </TableCell>
              {ROLES.map((role) => (
                <TableCell key={role.id} className="text-center">
                  {permissions[role.id] ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
