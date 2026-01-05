'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package } from 'lucide-react'

import { Save, Plus, Trash2, Printer, Edit, Settings } from 'lucide-react'
import { getToothSVG } from './tooth-svg'
import { OrderWizard } from '@/components/lab/wizard/order-wizard'
import { createBudget } from '../actions/budgets'

import { toast } from 'sonner' // Assuming sonner or useToast from shadcn

// MOCK SERVICES CATALOG (Simulating Core Module)
const SERVICES_CATALOG_MOCK = [
  { id: 'srv_resin_1', name: 'Resina Simple (1 superficie)', cost: 50, category: 'clinic', sla_days: 0 },
  { id: 'srv_resin_2', name: 'Resina Compuesta', cost: 80, category: 'clinic', sla_days: 0 },
  { id: 'srv_crown_zirc', name: 'Corona Zirconio', cost: 600, category: 'lab', sla_days: 5 },
]

// Default Clinic Settings
const DEFAULT_MARGIN_PERCENT = 30

// FDI Tooth Numbering System (ISO 3950)
const ADULT_TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11], // Quadrant 1
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],  // Quadrant 2
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],  // Quadrant 3
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41], // Quadrant 4
}

const CHILD_TEETH = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft: [61, 62, 63, 64, 65],
  lowerLeft: [71, 72, 73, 74, 75],
  lowerRight: [85, 84, 83, 82, 81],
}

// Tooth surfaces with exact SVG paths (40x40 coordinate system)
const SURFACES = [
  { 
    id: 'vestibular', 
    name: 'Vestibular', 
    abbr: 'V',
    path: 'M 0,0 L 40,0 L 28,12 L 12,12 Z',
  },
  { 
    id: 'lingual', 
    name: 'Lingual/Palatino', 
    abbr: 'L',
    path: 'M 0,40 L 40,40 L 28,28 L 12,28 Z',
  },
  { 
    id: 'mesial', 
    name: 'Mesial', 
    abbr: 'M',
    path: 'M 0,0 L 12,12 L 12,28 L 0,40 Z',
  },
  { 
    id: 'distal', 
    name: 'Distal', 
    abbr: 'D',
    path: 'M 40,0 L 40,40 L 28,28 L 28,12 Z',
  },
  { 
    id: 'oclusal', 
    name: 'Oclusal/Incisal', 
    abbr: 'O',
    path: 'M 12,12 L 28,12 L 28,28 L 12,28 Z',
  },
]

// Clinical findings with professional colors
const FINDINGS = [
  { id: 'healthy', name: 'Sano', color: '#ffffff', treatment: 'N/A', category: 'general' },
  { id: 'caries', name: 'Caries', color: '#ff4d4d', treatment: 'Resina/Amalgama', category: 'general' },
  { id: 'amalgam', name: 'Amalgama', color: '#6699cc', treatment: 'Existente', category: 'general' },
  { id: 'composite', name: 'Resina', color: '#b3d9ff', treatment: 'Existente', category: 'general' },
  { id: 'endodoncia', name: 'Endodoncia', color: '#f97316', treatment: 'Tratamiento de conducto', category: 'general' },
  { id: 'extraccion', name: 'Extracción', color: '#dc2626', treatment: 'Extracción', category: 'general' },
  { id: 'sealant', name: 'Sellante', color: '#ccffcc', treatment: 'Sellante', category: 'general' },
  { id: 'fracture', name: 'Fractura', color: '#dc2626', treatment: 'Reparación', category: 'general' },
  { id: 'ausente', name: 'Ausente', color: '#9ca3af', treatment: 'N/A', category: 'general' },
  
  // Lab items (Prótesis Fija)
  { id: 'corona', name: 'Corona', color: '#eab308', treatment: 'Corona', category: 'lab' },
  { id: 'carilla', name: 'Carilla', color: '#facc15', treatment: 'Carilla Estética', category: 'lab' },
  { id: 'puente', name: 'Puente', color: '#ca8a04', treatment: 'Pilar de Puente', category: 'lab' },
  { id: 'incrustacion', name: 'Incrustación', color: '#d97706', treatment: 'Inlay/Onlay', category: 'lab' },
  { id: 'perno', name: 'Perno Colado', color: '#78350f', treatment: 'Perno Muñón', category: 'lab' },

  // Lab items (Removible & Otros)
  { id: 'protesis_total', name: 'Prótesis Total', color: '#8b5cf6', treatment: 'Prótesis Total', category: 'lab' },
  { id: 'protesis_removible', name: 'P. Removible', color: '#a78bfa', treatment: 'Esquelético', category: 'lab' },
  { id: 'guarda', name: 'Guarda', color: '#10b981', treatment: 'Guarda Oclusal', category: 'lab' },
  { id: 'alineador', name: 'Alineador', color: '#06b6d4', treatment: 'Ortodoncia Invisible', category: 'lab' },
  { id: 'retenedor', name: 'Retenedor', color: '#0ea5e9', treatment: 'Retenedor', category: 'lab' },
  
  // Implants (Clinical + Lab parts)
  { id: 'implante', name: 'Implante', color: '#3b82f6', treatment: 'Implante dental', category: 'lab' },
]

interface ToothState {
  toothNumber: number
  surfaces: {
    oclusal: string
    mesial: string
    distal: string
    vestibular: string
    lingual: string
  }
  hasEndodontics?: boolean
  notes?: string
}

interface ToothFinding {
  id: string
  toothNumber: number
  surface: string
  finding: string
  findingName: string
  color: string
  treatment: string
  status: 'pending' | 'in_progress' | 'completed'
  
  // Financial Data
  serviceId?: string
  cost: number
  price: number
  marginType: 'percent' | 'fixed'
  marginValue: number
  isLabService: boolean
  orderId?: string
  notes?: string
}

interface OdontogramProps {
  patientId: string
  patientName?: string
  readonly?: boolean
}

// Import new service functions
import { getLabServices, Service } from '../actions/services'
import { getPatientDentalChart, saveToothCondition } from '../actions/clinical'

export function Odontogram({ patientId, patientName, readonly = false }: OdontogramProps) {
  /* 1. State Declarations */
  const [servicesCatalog, setServicesCatalog] = useState<any[]>(SERVICES_CATALOG_MOCK)
  const [isSaving, setIsSaving] = useState(false)
  const [toothType, setToothType] = useState<'adult' | 'child'>('adult')
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [selectedSurface, setSelectedSurface] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFinding, setSelectedFinding] = useState<string>('')
  const [findingNotes, setFindingNotes] = useState<string>('')
  const [teethStates, setTeethStates] = useState<Map<number, ToothState>>(new Map())
  const [findings, setFindings] = useState<ToothFinding[]>([])
  const [hoveredSurface, setHoveredSurface] = useState<{ tooth: number; surface: string } | null>(null)

  // Financial State in Dialog
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [priceConfig, setPriceConfig] = useState({ cost: 0, price: 0, marginType: 'percent' as 'percent' | 'fixed', marginValue: DEFAULT_MARGIN_PERCENT })

  // Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [itemsToOrder, setItemsToOrder] = useState<any[]>([])

  /* 2. Effects */
  
  // Load Services
  useEffect(() => {
     getLabServices().then((result) => {
         if(result.success && result.data && result.data.length > 0) {
             const mapped = result.data.map((s: Service) => ({
                 id: s.id,
                 name: s.name,
                 cost: s.cost_price_gtq, // Use GTQ cost
                 // Any service from getLabServices IS a lab service
                 category: 'lab', 
                 sla_days: s.turnaround_days || 0
             }))
             setServicesCatalog(mapped)
         }
     })
  }, [])

  // Load Patient Dental Chart
  useEffect(() => {
     if (!patientId) return

     getPatientDentalChart(patientId).then(result => {
         if (result.success && result.data) {
             // Map DB records to local state
            const newTeethStates = new Map<number, ToothState>()
            const newFindings: ToothFinding[] = []

            result.data.forEach((record) => {
                const toothNum = record.tooth_number
                
                // Update Teeth State Map
                const currentState = newTeethStates.get(toothNum) || {
                    toothNumber: toothNum,
                    surfaces: {
                        oclusal: 'healthy',
                        mesial: 'healthy',
                        distal: 'healthy',
                        vestibular: 'healthy',
                        lingual: 'healthy'
                    }
                }
                // Update specific surface
                if (record.surface in currentState.surfaces) {
                     currentState.surfaces[record.surface as keyof typeof currentState.surfaces] = record.condition
                }
                newTeethStates.set(toothNum, currentState)

                // Add to Findings List if not healthy
                if (record.condition !== 'healthy') {
                    const findingDef = FINDINGS.find(f => f.id === record.condition)
                    if (findingDef) {
                        newFindings.push({
                            id: `db_${toothNum}_${record.surface}`, // Synthetic ID
                            toothNumber: toothNum,
                            surface: record.surface,
                            finding: record.condition,
                            findingName: findingDef.name,
                            color: findingDef.color,
                            treatment: findingDef.treatment,
                            status: 'pending', // TODO: Store status in DB?
                            cost: 0, 
                            price: 0,
                            marginType: 'percent',
                            marginValue: 0,
                            isLabService: false,
                            orderId: record.lab_order_id
                         })
                    }
                }
            })
            
            setTeethStates(newTeethStates)
            setFindings(newFindings)
         }
     })
  }, [patientId])

  const handleOrderClick = (finding: ToothFinding) => {
      const catalogService = servicesCatalog.find((s: any) => s.id === finding.serviceId)
      setItemsToOrder([{
          id: finding.id,
          toothNumber: finding.toothNumber,
          treatment: finding.findingName + ' - ' + (catalogService?.name || finding.treatment),
          sla_days: catalogService?.sla_days || 3
      }])
      setOrderModalOpen(true)
  }

  const handleUpdateOrder = (finding: ToothFinding) => {
    // Re-open wizard with existing data
    // NOTE: Currently backend creates a NEW order. Future refactor needed for true "Update".
    handleOrderClick(finding) 
  }



  const handleSaveBudget = async () => {
      if (findings.length === 0) return
      
      setIsSaving(true)
      const total = findings.reduce((sum, f) => sum + (f.price || 0), 0)
      
      const result = await createBudget({
          patient_id: patientId,
          total: total,
          status: 'draft',
          items: findings
      })
      
      setIsSaving(false)
      
      if (result.success) {
          alert('Presupuesto guardado correctamente')
      } else {
          alert('Error al guardar presupuesto: ' + result.message)
      }
  }

  // Calculator Logic
  const handleServiceSelect = (serviceId: string) => {
    const service = servicesCatalog.find(s => s.id === serviceId)
    if (!service) return

    setSelectedServiceId(serviceId)
    const cost = service.cost
    // Calculate default price based on margin
    const price = cost + (cost * (DEFAULT_MARGIN_PERCENT / 100))
    
    setPriceConfig({
        cost,
        price,
        marginType: 'percent',
        marginValue: DEFAULT_MARGIN_PERCENT
    })
  }

  const updatePrice = (field: 'price' | 'margin' | 'cost', value: number) => {
      setPriceConfig(prev => {
          const newConfig = { ...prev }
          
          if (field === 'price') {
              newConfig.price = value
              // Recalculate margin
              if (prev.cost > 0) {
                  const margin = value - prev.cost
                  if (prev.marginType === 'percent') {
                      newConfig.marginValue = (margin / prev.cost) * 100
                  } else {
                      newConfig.marginValue = margin
                  }
              }
          } else if (field === 'margin') {
              newConfig.marginValue = value
              // Recalculate price
              if (prev.marginType === 'percent') {
                 newConfig.price = prev.cost * (1 + (value / 100))
              } else {
                 newConfig.price = prev.cost + value
              }
          }

          return newConfig
      })
  }

  const teeth = toothType === 'adult' ? ADULT_TEETH : CHILD_TEETH

  const isRightSide = (toothNumber: number) => {
    const firstDigit = Math.floor(toothNumber / 10)
    return firstDigit === 1 || firstDigit === 4 || firstDigit === 5 || firstDigit === 8
  }

  // Reset dialog state on open
  const openDialog = (toothNumber: number, surfaceId: string) => {
      setSelectedTooth(toothNumber)
      setSelectedSurface(surfaceId)
      setDialogOpen(true)
      setSelectedFinding('')
      setFindingNotes('')
      setSelectedServiceId('')
      setPriceConfig({ cost: 0, price: 0, marginType: 'percent', marginValue: 30 })
  }

  const getSurfaceMapping = (toothNumber: number) => {
    const isRight = isRightSide(toothNumber)
    return {
      left: isRight ? 'distal' : 'mesial',
      right: isRight ? 'mesial' : 'distal',
      top: 'vestibular',
      bottom: 'lingual',
      center: 'oclusal',
    }
  }

  const handleSurfaceClick = (toothNumber: number, surfaceId: string) => {
    if (readonly) return
    openDialog(toothNumber, surfaceId)
  }

  const handleAddFinding = async () => {
    if (!selectedTooth || !selectedSurface || !selectedFinding) return

    const finding = FINDINGS.find((f) => f.id === selectedFinding)
    if (!finding) return

    // Save to DB
    const result = await saveToothCondition({
        patient_id: patientId,
        tooth_number: selectedTooth,
        surface: selectedSurface,
        condition: selectedFinding,
        notes: findingNotes
    })

    if (!result.success) {
        alert('Error al guardar: ' + result.message)
        return
    }

    const currentState = teethStates.get(selectedTooth) || {
      toothNumber: selectedTooth,
      surfaces: {
        oclusal: 'healthy',
        mesial: 'healthy',
        distal: 'healthy',
        vestibular: 'healthy',
        lingual: 'healthy',
      },
    }

    const newState: ToothState = {
      ...currentState,
      surfaces: {
        ...currentState.surfaces,
        [selectedSurface]: selectedFinding,
      },
    }

    setTeethStates(new Map(teethStates.set(selectedTooth, newState)))

    const newFinding: ToothFinding = {
      id: result.id || `${Date.now()}`,
      toothNumber: selectedTooth,
      surface: selectedSurface,
      finding: selectedFinding,
      findingName: finding.name,
      color: finding.color,
      treatment: finding.treatment,
      status: 'pending',
      
      // Save Financials
      serviceId: selectedServiceId,
      cost: priceConfig.cost,
      price: priceConfig.price,
      marginType: priceConfig.marginType,
      marginValue: priceConfig.marginValue,
      marginType: priceConfig.marginType,
      marginValue: priceConfig.marginValue,
      isLabService: servicesCatalog.find((s: any) => s.id === selectedServiceId)?.category === 'lab' || false,
      notes: findingNotes
    }


    setFindings((prev) => [...prev, newFinding])
    setDialogOpen(false)
    setSelectedTooth(null)
    setSelectedSurface(null)
    setSelectedFinding('')
    setFindingNotes('')

    // Trigger Lab Order Wizard automatically if it's a lab service
    if (newFinding.isLabService) {
        if (confirm(`El tratamiento "${newFinding.findingName}" requiere trabajo de laboratorio. ¿Deseas crear la orden ahora?`)) {
            const catalogService = servicesCatalog.find((s: any) => s.id === selectedServiceId)
            setItemsToOrder([{
                id: newFinding.id, // we might not need this ID in wizard, but okay
                toothNumber: newFinding.toothNumber,
                treatment: newFinding.findingName + ' - ' + (catalogService?.name || newFinding.treatment),
                sla_days: catalogService?.sla_days || 3
            }])
            setOrderModalOpen(true)
        }
    }
  }

  const handleDeleteFinding = (id: string) => {
    const finding = findings.find((f) => f.id === id)
    if (!finding) return

    const currentState = teethStates.get(finding.toothNumber)
    if (currentState) {
      const newState: ToothState = {
        ...currentState,
        surfaces: {
          ...currentState.surfaces,
          [finding.surface]: 'healthy',
        },
      }
      setTeethStates(new Map(teethStates.set(finding.toothNumber, newState)))
    }

    setFindings((prev) => prev.filter((f) => f.id !== id))
  }

  const getSurfaceColor = (toothNumber: number, surfaceId: string) => {
    const toothState = teethStates.get(toothNumber)
    if (!toothState) return '#ffffff'
    
    const findingId = toothState.surfaces[surfaceId as keyof typeof toothState.surfaces]
    const finding = FINDINGS.find((f) => f.id === findingId)
    return finding?.color || '#ffffff'
  }

  const isHovered = (toothNumber: number, surfaceId: string) => {
    return hoveredSurface?.tooth === toothNumber && hoveredSurface?.surface === surfaceId
  }



  // Render a single tooth with geometric chart + realistic visual
  const renderTooth = (toothNumber: number, x: number, y: number, isUpper: boolean) => {
    const surfaceMapping = getSurfaceMapping(toothNumber)

    return (
      <g key={toothNumber} transform={`translate(${x}, ${y})`}>
        {/* Tooth number label */}
        <text
          x="20"
          y="-8"
          textAnchor="middle"
          className="text-[12px] font-bold fill-gray-700 select-none pointer-events-none"
        >
          {toothNumber}
        </text>

        {/* Geometric chart (for marking findings) */}
        <g className="geometric-chart">
          {SURFACES.map((surface) => {
            let clinicalSurface = surface.id
            if (surface.id === 'mesial') {
              clinicalSurface = surfaceMapping.left
            } else if (surface.id === 'distal') {
              clinicalSurface = surfaceMapping.right
            }

            const color = getSurfaceColor(toothNumber, clinicalSurface)
            const hovered = isHovered(toothNumber, clinicalSurface)

            return (
              <path
                key={surface.id}
                d={surface.path}
                fill={color}
                stroke="#333333"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-150"
                style={{
                  filter: hovered ? 'brightness(0.85) drop-shadow(0 0 4px rgba(59, 130, 246, 0.8))' : 'none',
                  strokeWidth: hovered ? '2.5' : '1.5',
                }}
                onClick={() => handleSurfaceClick(toothNumber, clinicalSurface)}
                onMouseEnter={() => setHoveredSurface({ tooth: toothNumber, surface: clinicalSurface })}
                onMouseLeave={() => setHoveredSurface(null)}
              />
            )
          })}
        </g>

        {/* Hover tooltip */}
        {hoveredSurface?.tooth === toothNumber && (
          <g className="pointer-events-none">
            <rect x="-5" y="45" width="50" height="20" fill="rgba(0,0,0,0.8)" rx="4" />
            <text x="20" y="58" textAnchor="middle" className="text-[10px] font-semibold fill-white">
              {SURFACES.find(s => {
                const mapping = getSurfaceMapping(toothNumber)
                if (hoveredSurface.surface === mapping.left) return s.id === 'mesial'
                if (hoveredSurface.surface === mapping.right) return s.id === 'distal'
                return s.id === hoveredSurface.surface
              })?.name}
            </text>
          </g>
        )}
      </g>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Odontograma Geométrico (Sistema FDI)</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={toothType} onValueChange={(v) => setToothType(v as 'adult' | 'child')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adultos (32)</SelectItem>
                  <SelectItem value="child">Niños (20)</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Leyenda:</span>
            {FINDINGS.slice(0, 8).map((finding) => (
              <div key={finding.id} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: finding.color }}
                />
                <span className="text-xs text-gray-600">{finding.name}</span>
              </div>
            ))}
          </div>

          {/* Instruction */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Instrucción:</strong> Pasa el mouse sobre el cuadrito geométrico para resaltar. 
              Click para registrar hallazgo. Debajo verás la representación visual del diente.
            </p>
          </div>

          {/* Odontogram SVG */}
          <div className="bg-gradient-to-b from-gray-50 to-white p-8 rounded-lg border-2 border-gray-200">
            <svg viewBox="0 0 750 400" className="w-full" style={{ maxHeight: '450px' }}>
              {/* Upper Arch */}
              <g id="upper-arch">
                {teeth.upperRight.map((tooth, index) => 
                  renderTooth(tooth, 30 + index * 45, 80, true)
                )}
                {teeth.upperLeft.map((tooth, index) => 
                  renderTooth(tooth, 395 + index * 45, 80, true)
                )}
              </g>

              {/* Lower Arch */}
              <g id="lower-arch">
                {teeth.lowerLeft.map((tooth, index) => 
                  renderTooth(tooth, 395 + index * 45, 280, false)
                )}
                {teeth.lowerRight.map((tooth, index) => 
                  renderTooth(tooth, 30 + index * 45, 280, false)
                )}
              </g>

              {/* Quadrant labels */}
              <text x="185" y="60" textAnchor="middle" className="text-xs fill-gray-400 font-medium">
                Cuadrante 1
              </text>
              <text x="565" y="60" textAnchor="middle" className="text-xs fill-gray-400 font-medium">
                Cuadrante 2
              </text>
              <text x="565" y="390" textAnchor="middle" className="text-xs fill-gray-400 font-medium">
                Cuadrante 3
              </text>
              <text x="185" y="390" textAnchor="middle" className="text-xs fill-gray-400 font-medium">
                Cuadrante 4
              </text>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Findings Table */}
      {findings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hallazgos Clínicos Registrados</CardTitle>
              <Button 
                onClick={() => setOrderModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                size="lg"
              >
                <Package className="h-5 w-5 mr-2" />
                CREAR ORDEN DE LAB
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Diente</TableHead>
                  <TableHead className="font-semibold">Diagnóstico</TableHead>
                  <TableHead className="font-semibold">Tratamiento</TableHead>
                  <TableHead className="font-semibold text-right">Precio</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding) => (
                  <TableRow 
                    key={finding.id} 
                    className={`hover:bg-gray-50 ${finding.isLabService ? 'bg-amber-50 border-l-4 border-l-amber-400' : ''}`}
                  >
                    <TableCell className="font-mono text-lg font-bold">{finding.toothNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: finding.color }}
                        />
                        <span className="font-medium text-sm">{finding.findingName}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                         {SURFACES.find(s => s.id === finding.surface)?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm font-medium">
                            {servicesCatalog.find((s: any) => s.id === finding.serviceId)?.name || finding.treatment}
                        </div>
                        {finding.isLabService && (
                            <Badge variant="outline" className="mt-1 text-[10px] border-blue-200 text-blue-600 bg-blue-50">
                                Laboratorio
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                         {finding.price > 0 ? `$${finding.price.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={finding.status === 'completed' ? 'default' : finding.status === 'in_progress' ? 'secondary' : 'outline'}
                        className={finding.status === 'completed' ? 'bg-green-500' : finding.status === 'in_progress' ? 'bg-blue-500' : ''}
                      >
                        {finding.status === 'pending' ? 'Pendiente' : finding.status === 'in_progress' ? 'En progreso' : 'Completado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                         {finding.isLabService && (
                             <Button 
                                size="sm" 
                                variant={finding.orderId ? "outline" : "default"}
                                className={`h-7 text-xs ${finding.orderId ? 'border-amber-500 text-amber-600 hover:bg-amber-50' : 'bg-cyan-600 hover:bg-cyan-700'}`} 
                                onClick={() => finding.orderId ? handleUpdateOrder(finding) : handleOrderClick(finding)}
                             >
                                {finding.orderId ? <><Edit className="w-3 h-3 mr-1"/>Actualizar</> : 'Pedir'}
                             </Button>
                         )}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteFinding(finding.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Finding Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Diente {selectedTooth} - Superficie {SURFACES.find(s => s.id === selectedSurface)?.name}
            </DialogTitle>
            <DialogDescription>Selecciona el hallazgo clínico para esta superficie</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            
            {/* 1. SELECCIÓN DE HALLAZGO */}
            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase mb-3 block">1. Diagnóstico / Hallazgo</Label>
              
              {/* General / Clinical Section */}
              <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 border-b pb-1">Procedimientos Clínicos</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {FINDINGS.filter(f => f.category === 'general').map((finding) => (
                      <Button
                        key={finding.id}
                        variant={selectedFinding === finding.id ? 'default' : 'outline'}
                        className={`justify-start gap-2 h-auto py-2 px-2 text-xs ${selectedFinding === finding.id ? 'bg-gray-800 text-white' : ''}`}
                        onClick={() => setSelectedFinding(finding.id)}
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: finding.color }} />
                        <span className="truncate">{finding.name}</span>
                      </Button>
                    ))}
                  </div>
              </div>

              {/* Lab Section */}
              <div>
                  <h4 className="text-xs font-semibold text-amber-500 mb-2 border-b border-amber-100 pb-1 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                     Laboratorio & Prótesis
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {FINDINGS.filter(f => f.category === 'lab').map((finding) => (
                      <Button
                        key={finding.id}
                        variant={selectedFinding === finding.id ? 'default' : 'outline'}
                        className={`justify-start gap-2 h-auto py-2 px-2 text-xs border-amber-200 ${selectedFinding === finding.id ? 'bg-amber-100 text-amber-900 border-amber-500 ring-1 ring-amber-500' : 'hover:bg-amber-50'}`}
                        onClick={() => setSelectedFinding(finding.id)}
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: finding.color }} />
                        <span className="truncate">{finding.name}</span>
                      </Button>
                    ))}
                  </div>
              </div>
            </div>

            {/* 1.1 NOTAS DE DIAGNÓSTICO */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Notas Clínicas / Diagnóstico</Label>
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Escribe observaciones clínicas aquí..."
                    value={findingNotes}
                    onChange={(e) => setFindingNotes(e.target.value)}
                />
            </div>

            {/* 2. TRATAMIENTO Y PRECIO (Dinámico por Categoría) */}
            {selectedFinding && (
               <div className="animate-in fade-in-50 pt-4 border-t border-gray-100">
                   {/* OPCIÓN A: CLÍNICA (Calculadora Visible) */}
                   {FINDINGS.find(f => f.id === selectedFinding)?.category === 'general' ? (
                       <div className="space-y-4">
                           <Label className="text-xs font-bold text-gray-500 uppercase block">2. Tratamiento y Precio</Label>
                           
                           <div className="grid grid-cols-2 gap-6">
                               {/* Selector de Servicio */}
                               <div className="space-y-2">
                                   <Label className="text-sm">Servicio / Procedimiento</Label>
                                   <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
                                       <SelectTrigger>
                                           <SelectValue placeholder="Seleccionar variante..." />
                                       </SelectTrigger>
                                       <SelectContent>
                                {servicesCatalog.map((svc: any) => (
                                  <SelectItem key={svc.id} value={svc.id}>
                                    {svc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                                   </Select>
                               </div>

                               {/* Calculadora de Precio */}
                               <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                   <div className="flex justify-between items-center">
                                       <span className="text-xs text-gray-500 font-medium">Costo Base (Oculto)</span>
                                       <span className="text-xs font-mono text-gray-400">${priceConfig.cost.toFixed(2)}</span>
                                   </div>

                                   <div className="flex gap-2 items-end">
                                       <div className="flex-1 space-y-1">
                                           <Label className="text-xs">Margen</Label>
                                           <div className="flex items-center">
                                               <Input 
                                                    type="number" 
                                                    className="h-8 text-right pr-1 rounded-r-none border-r-0" 
                                                    value={priceConfig.marginValue}
                                                    onChange={(e) => updatePrice('margin', parseFloat(e.target.value))}
                                                />
                                               <div className="h-8 bg-white border border-l-0 border-gray-200 rounded-r-md px-2 flex items-center text-xs text-gray-500 font-medium cursor-pointer"
                                                    onClick={() => setPriceConfig(p => ({ ...p, marginType: p.marginType === 'percent' ? 'fixed' : 'percent' }))}
                                               >
                                                   {priceConfig.marginType === 'percent' ? '%' : '$'}
                                               </div>
                                           </div>
                                       </div>
                                       
                                       <div className="flex-1 space-y-1">
                                           <Label className="text-xs text-teal-600 font-bold">Precio Final</Label>
                                           <div className="relative">
                                               <span className="absolute left-2 top-1.5 text-teal-600 font-bold">$</span>
                                               <Input 
                                                    className="h-8 pl-6 font-bold text-teal-700 border-teal-200 bg-white" 
                                                    value={priceConfig.price.toFixed(2)}
                                                    onChange={(e) => updatePrice('price', parseFloat(e.target.value))}
                                                />
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   ) : (
                       /* OPCIÓN B: LABORATORIO (Mensaje Informativo) */
                       <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex flex-col gap-2">
                           <div className="flex items-center gap-2 text-amber-800 font-semibold">
                               <Settings className="w-5 h-5" />
                               <span>Configuración Requerida en Wizard</span>
                           </div>
                           <p className="text-sm text-amber-700">
                               El precio final y los detalles del material (Zirconio, E-MAX, etc.) se definirán 
                               en el <strong>siguiente paso</strong> (Asistente de Laboratorio).
                           </p>
                           <div className="text-xs text-amber-600 mt-1">
                               * Se creará un hallazgo preliminar sin precio hasta confirmar la orden.
                           </div>
                       </div>
                   )}
               </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddFinding} disabled={!selectedFinding} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Guardar Tratamiento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="flex justify-end mt-6 gap-3">
             <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                Limpiar Todo
             </Button>
            <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={handleSaveBudget}
                disabled={isSaving || findings.length === 0}
            >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar Presupuesto'}
            </Button>
        </div>


      {orderModalOpen && (
        <OrderWizard 
            patientId={patientId}
            onClose={() => setOrderModalOpen(false)}
            initialItems={itemsToOrder}
        />
      )}
    </div>
  )
}
