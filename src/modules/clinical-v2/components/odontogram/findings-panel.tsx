// ============================================================================
// CLINICAL V2 - FINDINGS PANEL
// ============================================================================

'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDentalSession } from '../../hooks/use-dental-session';
import { getFindingById } from '../../constants/dental';
import { Trash2, ShoppingCart, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface FindingsPanelProps {
  onCreateLabOrder?: (findingIds: string[]) => void;
}

export function FindingsPanel({ onCreateLabOrder }: FindingsPanelProps) {
  const { findings, removeFinding } = useDentalSession();

  const surfaceNames: Record<string, string> = {
    oclusal: 'Oclusal',
    mesial: 'Mesial',
    distal: 'Distal',
    vestibular: 'Vestibular',
    lingual: 'Lingual',
    whole: 'Todo',
  };

  const labStatusNames: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En Proceso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  const getLabStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Agrupar hallazgos por tipo
  const labFindings = findings.filter((f) => {
    const def = getFindingById(f.findingId);
    return def?.requiresLabOrder && !f.labOrderId;
  });

  const completedLabFindings = findings.filter((f) => {
    const def = getFindingById(f.findingId);
    return def?.requiresLabOrder && f.labOrderId;
  });

  const clinicalFindings = findings.filter((f) => {
    const def = getFindingById(f.findingId);
    return !def?.requiresLabOrder;
  });

  const handleCreateLabOrder = () => {
    if (labFindings.length > 0 && onCreateLabOrder) {
      onCreateLabOrder(labFindings.map(f => f.id));
    }
  };

  if (findings.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay hallazgos registrados</p>
          <p className="text-sm mt-1">Haz clic en las superficies del odontograma para agregar hallazgos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hallazgos de laboratorio pendientes */}
      {labFindings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">
              Hallazgos de Laboratorio Pendientes ({labFindings.length})
            </CardTitle>
            <Button onClick={handleCreateLabOrder} size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Crear Orden de Lab
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Diente</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Hallazgo</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labFindings.map((finding) => {
                  const definition = getFindingById(finding.findingId);
                  return (
                    <TableRow key={finding.id}>
                      <TableCell className="font-medium">{finding.toothNumber}</TableCell>
                      <TableCell>{surfaceNames[finding.surface]}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: definition?.color }}
                          />
                          <span>{definition?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-gray-600">
                        {finding.notes || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(finding.createdAt, 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFinding(finding.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Hallazgos de laboratorio con orden */}
      {completedLabFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Trabajos de Laboratorio ({completedLabFindings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Diente</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Hallazgo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedLabFindings.map((finding) => {
                  const definition = getFindingById(finding.findingId);
                  return (
                    <TableRow key={finding.id}>
                      <TableCell className="font-medium">{finding.toothNumber}</TableCell>
                      <TableCell>{surfaceNames[finding.surface]}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: definition?.color }}
                          />
                          <span>{definition?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLabStatusColor(finding.labOrderStatus)}>
                          {labStatusNames[finding.labOrderStatus || 'pending']}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-blue-600 hover:underline cursor-pointer">
                        #{finding.labOrderId?.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFinding(finding.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Hallazgos clínicos */}
      {clinicalFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Hallazgos Clínicos ({clinicalFindings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Diente</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Hallazgo</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicalFindings.map((finding) => {
                  const definition = getFindingById(finding.findingId);
                  return (
                    <TableRow key={finding.id}>
                      <TableCell className="font-medium">{finding.toothNumber}</TableCell>
                      <TableCell>{surfaceNames[finding.surface]}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: definition?.color }}
                          />
                          <span>{definition?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-gray-600">
                        {finding.notes || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(finding.createdAt, 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFinding(finding.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
