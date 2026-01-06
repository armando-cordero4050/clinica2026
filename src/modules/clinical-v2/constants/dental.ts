// ============================================================================
// CLINICAL V2 - DENTAL CONSTANTS
// ============================================================================

import { AdultToothNumber, ChildToothNumber, FindingDefinition } from '../types';

// Sistema FDI - Dientes adultos (32 piezas)
export const ADULT_TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11] as AdultToothNumber[],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28] as AdultToothNumber[],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38] as AdultToothNumber[],
  lowerRight: [41, 42, 43, 44, 45, 46, 47, 48] as AdultToothNumber[],
};

// Sistema FDI - Dientes temporales (20 piezas)
export const CHILD_TEETH = {
  upperRight: [55, 54, 53, 52, 51] as ChildToothNumber[],
  upperLeft: [61, 62, 63, 64, 65] as ChildToothNumber[],
  lowerLeft: [71, 72, 73, 74, 75] as ChildToothNumber[],
  lowerRight: [81, 82, 83, 84, 85] as ChildToothNumber[],
};

// Paths SVG para las superficies dentales (viewBox 40x40)
export const SURFACES = {
  oclusal: {
    path: 'M10,10 L30,10 L30,30 L10,30 Z',
    label: 'O',
    position: { x: 20, y: 20 }
  },
  mesial: {
    path: 'M5,5 L10,10 L10,30 L5,35 Z',
    label: 'M',
    position: { x: 7.5, y: 20 }
  },
  distal: {
    path: 'M30,10 L35,5 L35,35 L30,30 Z',
    label: 'D',
    position: { x: 32.5, y: 20 }
  },
  vestibular: {
    path: 'M5,5 L35,5 L30,10 L10,10 Z',
    label: 'V',
    position: { x: 20, y: 7.5 }
  },
  lingual: {
    path: 'M10,30 L30,30 L35,35 L5,35 Z',
    label: 'L',
    position: { x: 20, y: 32.5 }
  },
  whole: {
    path: 'M5,5 L35,5 L35,35 L5,35 Z',
    label: '',
    position: { x: 20, y: 20 }
  }
};

// Catálogo de hallazgos clínicos y de laboratorio
export const FINDINGS_CATALOG: FindingDefinition[] = [
  // HALLAZGOS CLÍNICOS (no requieren laboratorio)
  {
    id: 'healthy',
    name: 'Sano',
    shortName: 'S',
    color: '#22c55e', // green-500
    category: 'clinical',
    requiresLabOrder: false,
    description: 'Diente/superficie sana sin patologías'
  },
  {
    id: 'caries',
    name: 'Caries',
    shortName: 'C',
    color: '#ef4444', // red-500
    category: 'clinical',
    requiresLabOrder: false,
    description: 'Lesión cariosa activa'
  },
  {
    id: 'caries_inactive',
    name: 'Caries Inactiva',
    shortName: 'CI',
    color: '#f97316', // orange-500
    category: 'clinical',
    requiresLabOrder: false,
    description: 'Lesión cariosa detenida'
  },
  {
    id: 'fracture',
    name: 'Fractura',
    shortName: 'F',
    color: '#dc2626', // red-600
    category: 'clinical',
    requiresLabOrder: false,
    description: 'Fractura dental'
  },
  {
    id: 'missing',
    name: 'Ausente',
    shortName: 'A',
    color: '#64748b', // slate-500
    category: 'clinical',
    requiresLabOrder: false,
    description: 'Diente ausente'
  },
  {
    id: 'mobility',
    name: 'Movilidad',
    shortName: 'Mv',
    color: '#f59e0b', // amber-500
    category: 'clinical',
    requiresLabOrder: false,
    description: 'Movilidad dental anormal'
  },
  {
    id: 'recession',
    name: 'Retracción Gingival',
    shortName: 'RG',
    color: '#ec4899', // pink-500
    category: 'clinical',
    requiresLabOrder: false,
    description: 'Recesión de encía'
  },
  
  // HALLAZGOS EXISTENTES (trabajos previos)
  {
    id: 'amalgam',
    name: 'Amalgama',
    shortName: 'Am',
    color: '#71717a', // zinc-500
    category: 'existing',
    requiresLabOrder: false,
    description: 'Restauración de amalgama existente'
  },
  {
    id: 'composite',
    name: 'Resina Composite',
    shortName: 'Re',
    color: '#3b82f6', // blue-500
    category: 'existing',
    requiresLabOrder: false,
    description: 'Restauración de composite existente'
  },
  {
    id: 'sealant',
    name: 'Sellante',
    shortName: 'Se',
    color: '#06b6d4', // cyan-500
    category: 'existing',
    requiresLabOrder: false,
    description: 'Sellante de fosas y fisuras'
  },
  {
    id: 'crown_existing',
    name: 'Corona Existente',
    shortName: 'Co',
    color: '#8b5cf6', // violet-500
    category: 'existing',
    requiresLabOrder: false,
    description: 'Corona protésica existente'
  },
  {
    id: 'bridge_existing',
    name: 'Puente Existente',
    shortName: 'Pu',
    color: '#6366f1', // indigo-500
    category: 'existing',
    requiresLabOrder: false,
    description: 'Puente fijo existente'
  },
  {
    id: 'implant_existing',
    name: 'Implante Existente',
    shortName: 'Im',
    color: '#0ea5e9', // sky-500
    category: 'existing',
    requiresLabOrder: false,
    description: 'Implante dental existente'
  },
  {
    id: 'endodontic',
    name: 'Endodoncia',
    shortName: 'En',
    color: '#14b8a6', // teal-500
    category: 'existing',
    requiresLabOrder: false,
    description: 'Tratamiento endodóntico realizado'
  },
  
  // HALLAZGOS DE LABORATORIO (requieren orden)
  {
    id: 'crown_lab',
    name: 'Corona (Lab)',
    shortName: 'CL',
    color: '#a855f7', // purple-500
    category: 'lab',
    requiresLabOrder: true,
    description: 'Corona protésica a fabricar'
  },
  {
    id: 'bridge_lab',
    name: 'Puente (Lab)',
    shortName: 'PL',
    color: '#7c3aed', // violet-600
    category: 'lab',
    requiresLabOrder: true,
    description: 'Puente fijo a fabricar'
  },
  {
    id: 'veneer_lab',
    name: 'Carilla (Lab)',
    shortName: 'Ca',
    color: '#ec4899', // pink-500
    category: 'lab',
    requiresLabOrder: true,
    description: 'Carilla estética a fabricar'
  },
  {
    id: 'inlay_lab',
    name: 'Incrustación (Lab)',
    shortName: 'In',
    color: '#8b5cf6', // violet-500
    category: 'lab',
    requiresLabOrder: true,
    description: 'Incrustación inlay/onlay a fabricar'
  },
  {
    id: 'denture_partial',
    name: 'Prótesis Parcial Removible',
    shortName: 'PPR',
    color: '#06b6d4', // cyan-500
    category: 'lab',
    requiresLabOrder: true,
    description: 'Prótesis parcial removible'
  },
  {
    id: 'denture_total',
    name: 'Prótesis Total',
    shortName: 'PT',
    color: '#0284c7', // sky-600
    category: 'lab',
    requiresLabOrder: true,
    description: 'Prótesis total removible'
  },
  {
    id: 'implant_crown',
    name: 'Corona sobre Implante',
    shortName: 'CI',
    color: '#0891b2', // cyan-600
    category: 'lab',
    requiresLabOrder: true,
    description: 'Corona sobre implante'
  },
  {
    id: 'orthodontic_appliance',
    name: 'Aparato Ortodóntico',
    shortName: 'AO',
    color: '#f59e0b', // amber-500
    category: 'lab',
    requiresLabOrder: true,
    description: 'Aparato de ortodoncia'
  },
  {
    id: 'provisional',
    name: 'Provisional (Lab)',
    shortName: 'Pr',
    color: '#84cc16', // lime-500
    category: 'lab',
    requiresLabOrder: true,
    description: 'Corona o puente provisional'
  },
];

// Helper para obtener hallazgo por ID
export function getFindingById(id: string): FindingDefinition | undefined {
  return FINDINGS_CATALOG.find(f => f.id === id);
}

// Helper para obtener hallazgos por categoría
export function getFindingsByCategory(category: string): FindingDefinition[] {
  return FINDINGS_CATALOG.filter(f => f.category === category);
}

// Helper para obtener hallazgos que requieren laboratorio
export function getLabRequiredFindings(): FindingDefinition[] {
  return FINDINGS_CATALOG.filter(f => f.requiresLabOrder);
}
