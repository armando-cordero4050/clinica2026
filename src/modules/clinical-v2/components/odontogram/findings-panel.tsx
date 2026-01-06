/**
 * Clinical V2 - Findings Panel Component
 * Table/list of registered findings
 */

'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Package } from 'lucide-react';
import { FindingsPanelProps } from '../../types';
import { cn } from '@/lib/utils';

export function FindingsPanel({
  findings,
  onEdit,
  onDelete,
  onCreateLabOrder,
}: FindingsPanelProps) {
  const labFindings = findings.filter(f => f.category === 'lab');
  const pendingLabFindings = labFindings.filter(f => f.status === 'pending');

  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hallazgos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay hallazgos registrados.</p>
            <p className="text-sm mt-2">
              Haz clic en una superficie del odontograma para agregar un hallazgo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Hallazgos Registrados ({findings.length})</CardTitle>
        {pendingLabFindings.length > 0 && (
          <Button
            onClick={onCreateLabOrder}
            size="sm"
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Crear Orden de Lab ({pendingLabFindings.length})
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Diente</TableHead>
                <TableHead className="w-[100px]">Superficie</TableHead>
                <TableHead>Hallazgo</TableHead>
                <TableHead>Tratamiento</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((finding) => (
                <TableRow key={finding.id}>
                  <TableCell className="font-mono font-semibold">
                    {finding.toothNumber}
                  </TableCell>
                  <TableCell className="capitalize">
                    {finding.surface}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: finding.color }}
                      />
                      <span className="font-medium">{finding.findingName}</span>
                      {finding.category === 'lab' && (
                        <Badge variant="secondary" className="ml-1">
                          Lab
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {FINDINGS_CATALOG.find(f => f.id === finding.findingId)?.treatment || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        finding.status === 'completed'
                          ? 'default'
                          : finding.status === 'in_progress'
                          ? 'secondary'
                          : 'outline'
                      }
                      className={cn(
                        finding.status === 'completed' && 'bg-green-500',
                        finding.status === 'in_progress' && 'bg-blue-500'
                      )}
                    >
                      {finding.status === 'pending' && 'Pendiente'}
                      {finding.status === 'in_progress' && 'En Proceso'}
                      {finding.status === 'completed' && 'Completado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(finding)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(finding.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Import findings catalog for reference
import { FINDINGS_CATALOG } from '../../constants/dental';
