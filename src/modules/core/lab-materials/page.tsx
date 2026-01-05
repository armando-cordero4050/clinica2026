'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Package, Settings, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { 
  getLabMaterials, 
  getLabConfigurations, 
  deleteLabMaterial,
  deleteLabConfiguration,
  type LabMaterial,
  type LabConfiguration 
} from './actions'
import { MaterialForm } from './components/material-form'
import { ConfigurationForm } from './components/configuration-form'

export default function LabMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [configurations, setConfigurations] = useState<LabConfiguration[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [materialFormOpen, setMaterialFormOpen] = useState(false)
  const [configFormOpen, setConfigFormOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<LabMaterial | null>(null)
  const [editingConfig, setEditingConfig] = useState<LabConfiguration | null>(null)

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'material' | 'config', id: string, name: string } | null>(null)

  useEffect(() => {
    loadMaterials()
  }, [])

  useEffect(() => {
    if (selectedMaterial) {
      loadConfigurations(selectedMaterial)
    } else {
      setConfigurations([])
    }
  }, [selectedMaterial])

  const loadMaterials = async () => {
    setLoading(true)
    const result = await getLabMaterials()
    if (result.success && result.data) {
      setMaterials(result.data)
    }
    setLoading(false)
  }

  const loadConfigurations = async (materialId: string) => {
    const result = await getLabConfigurations(materialId)
    if (result.success && result.data) {
      setConfigurations(result.data)
    }
  }

  const handleMaterialClick = (materialId: string) => {
    if (selectedMaterial === materialId) {
      setSelectedMaterial(null)
    } else {
      setSelectedMaterial(materialId)
    }
  }

  const handleEditMaterial = (material: LabMaterial) => {
    setEditingMaterial(material)
    setMaterialFormOpen(true)
  }

  const handleEditConfig = (config: LabConfiguration) => {
    setEditingConfig(config)
    setConfigFormOpen(true)
  }

  const handleDeleteClick = (type: 'material' | 'config', id: string, name: string) => {
    setItemToDelete({ type, id, name })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    try {
      let result
      if (itemToDelete.type === 'material') {
        result = await deleteLabMaterial(itemToDelete.id)
      } else {
        result = await deleteLabConfiguration(itemToDelete.id)
      }

      if (result.success) {
        toast.success(`${itemToDelete.type === 'material' ? 'Material' : 'Configuración'} eliminado`)
        if (itemToDelete.type === 'material') {
          loadMaterials()
          setSelectedMaterial(null)
        } else {
          loadConfigurations(selectedMaterial!)
        }
      } else {
        toast.error(result.error || 'Error al eliminar')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const selectedMaterialData = materials.find(m => m.id === selectedMaterial)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Materiales</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los materiales y configuraciones de laboratorio
          </p>
        </div>
        <Button onClick={() => {
          setEditingMaterial(null)
          setMaterialFormOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materiales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Configuraciones</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materials.reduce((sum, m) => sum + (m.config_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <span className="text-lg">Q</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {configurations.length > 0 
                ? (configurations.reduce((sum, c) => sum + c.base_price, 0) / configurations.length).toFixed(2)
                : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materiales</CardTitle>
          <CardDescription>
            Haz clic en un material para ver sus configuraciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay materiales registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-center">Configuraciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <React.Fragment key={material.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleMaterialClick(material.id)}
                    >
                      <TableCell>
                        {selectedMaterial === material.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {material.description || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{material.config_count || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditMaterial(material)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick('material', material.id, material.name)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Configurations Sub-table */}
                    {selectedMaterial === material.id && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/30 p-0">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold">
                                Configuraciones de {material.name}
                              </h3>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingConfig(null)
                                  setConfigFormOpen(true)
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Nueva Configuración
                              </Button>
                            </div>

                            {configurations.length === 0 ? (
                              <div className="text-center py-4 text-sm text-muted-foreground">
                                No hay configuraciones para este material
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead className="text-right">Precio Base</TableHead>
                                    <TableHead className="text-center">SLA (días)</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {configurations.map((config) => (
                                    <TableRow key={config.id}>
                                      <TableCell className="font-medium">{config.name}</TableCell>
                                      <TableCell>
                                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                          {config.code || '-'}
                                        </code>
                                      </TableCell>
                                      <TableCell className="text-right font-mono">
                                        Q{config.base_price.toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline">{config.sla_days}d</Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditConfig(config)}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick('config', config.id!, config.name)}
                                          >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Forms */}
      <MaterialForm
        open={materialFormOpen}
        onOpenChange={setMaterialFormOpen}
        material={editingMaterial}
        onSuccess={loadMaterials}
      />

      {selectedMaterialData && (
        <ConfigurationForm
          open={configFormOpen}
          onOpenChange={setConfigFormOpen}
          materialId={selectedMaterial!}
          materialName={selectedMaterialData.name}
          configuration={editingConfig}
          onSuccess={() => loadConfigurations(selectedMaterial!)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará {itemToDelete?.type === 'material' ? 'el material' : 'la configuración'}{' '}
              <strong>{itemToDelete?.name}</strong>.
              {itemToDelete?.type === 'material' && ' Todas sus configuraciones también serán eliminadas.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
