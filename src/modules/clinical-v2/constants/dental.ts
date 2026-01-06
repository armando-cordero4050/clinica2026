/**
 * Clinical V2 Module - Constants
 * FDI teeth numbering, surface definitions, and findings catalog
 */

import { ToothNumber, FindingDefinition } from '../types';

// ============= FDI TOOTH NUMBERING =============

/** Adult teeth by quadrant (FDI System) */
export const ADULT_TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11] as ToothNumber[], // Quadrant 1
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28] as ToothNumber[],  // Quadrant 2
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38] as ToothNumber[],  // Quadrant 3
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41] as ToothNumber[], // Quadrant 4
};

/** Child teeth by quadrant (FDI System - Deciduous) */
export const CHILD_TEETH = {
  upperRight: [55, 54, 53, 52, 51] as ToothNumber[], // Quadrant 5
  upperLeft: [61, 62, 63, 64, 65] as ToothNumber[],  // Quadrant 6
  lowerLeft: [71, 72, 73, 74, 75] as ToothNumber[],  // Quadrant 7
  lowerRight: [85, 84, 83, 82, 81] as ToothNumber[], // Quadrant 8
};

// ============= TOOTH SURFACES =============

/**
 * Surface definitions with SVG paths
 * ViewBox: 40x40 coordinate system
 */
export const SURFACES = [
  {
    id: 'vestibular' as const,
    name: 'Vestibular',
    abbr: 'V',
    path: 'M 0,0 L 40,0 L 28,12 L 12,12 Z',
    description: 'Cara externa (hacia mejilla/labio)',
  },
  {
    id: 'lingual' as const,
    name: 'Lingual',
    abbr: 'L',
    path: 'M 0,40 L 40,40 L 28,28 L 12,28 Z',
    description: 'Cara interna (hacia lengua/paladar)',
  },
  {
    id: 'mesial' as const,
    name: 'Mesial',
    abbr: 'M',
    path: 'M 0,0 L 12,12 L 12,28 L 0,40 Z',
    description: 'Cara hacia la línea media',
  },
  {
    id: 'distal' as const,
    name: 'Distal',
    abbr: 'D',
    path: 'M 40,0 L 40,40 L 28,28 L 28,12 Z',
    description: 'Cara alejada de la línea media',
  },
  {
    id: 'oclusal' as const,
    name: 'Oclusal',
    abbr: 'O',
    path: 'M 12,12 L 28,12 L 28,28 L 12,28 Z',
    description: 'Superficie de masticación/borde incisal',
  },
];

// ============= FINDINGS CATALOG =============

/** Complete findings catalog */
export const FINDINGS_CATALOG: FindingDefinition[] = [
  // ===== CLINICAL FINDINGS =====
  {
    id: 'healthy',
    name: 'Sano',
    category: 'clinical',
    color: '#ffffff',
    treatment: 'N/A',
    requiresLab: false,
    description: 'Tejido dental sano sin patología',
  },
  {
    id: 'caries',
    name: 'Caries',
    category: 'clinical',
    color: '#ef4444',
    treatment: 'Resina/Amalgama',
    requiresLab: false,
    description: 'Lesión cariosa que requiere restauración',
  },
  {
    id: 'amalgam',
    name: 'Amalgama',
    category: 'existing',
    color: '#6b7280',
    treatment: 'Existente',
    requiresLab: false,
    description: 'Restauración de amalgama existente',
  },
  {
    id: 'composite',
    name: 'Resina',
    category: 'existing',
    color: '#93c5fd',
    treatment: 'Existente',
    requiresLab: false,
    description: 'Restauración de resina compuesta existente',
  },
  {
    id: 'endodoncia',
    name: 'Endodoncia',
    category: 'clinical',
    color: '#f97316',
    treatment: 'Tratamiento de conducto',
    requiresLab: false,
    description: 'Tratamiento endodóntico realizado o requerido',
  },
  {
    id: 'extraccion',
    name: 'Extracción',
    category: 'clinical',
    color: '#dc2626',
    treatment: 'Extracción dental',
    requiresLab: false,
    description: 'Diente indicado para extracción',
  },
  {
    id: 'ausente',
    name: 'Ausente',
    category: 'clinical',
    color: '#9ca3af',
    treatment: 'N/A',
    requiresLab: false,
    description: 'Diente ausente (no erupcionado o perdido)',
  },

  // ===== LABORATORY FINDINGS - PRÓTESIS FIJA =====
  {
    id: 'corona',
    name: 'Corona',
    category: 'lab',
    color: '#eab308',
    treatment: 'Corona protésica',
    requiresLab: true,
    description: 'Corona completa (metal-cerámica, zirconio, etc.)',
  },
  {
    id: 'carilla',
    name: 'Carilla',
    category: 'lab',
    color: '#facc15',
    treatment: 'Carilla estética',
    requiresLab: true,
    description: 'Carilla de porcelana o composite',
  },
  {
    id: 'puente',
    name: 'Puente',
    category: 'lab',
    color: '#ca8a04',
    treatment: 'Pilar de puente',
    requiresLab: true,
    description: 'Diente pilar de puente fijo',
  },
  {
    id: 'incrustacion',
    name: 'Incrustación',
    category: 'lab',
    color: '#d97706',
    treatment: 'Inlay/Onlay',
    requiresLab: true,
    description: 'Incrustación de cerámica o metal',
  },
  {
    id: 'perno',
    name: 'Perno',
    category: 'lab',
    color: '#78350f',
    treatment: 'Perno muñón',
    requiresLab: true,
    description: 'Perno colado o prefabricado',
  },

  // ===== LABORATORY FINDINGS - PRÓTESIS REMOVIBLE =====
  {
    id: 'protesis_total',
    name: 'Prótesis Total',
    category: 'lab',
    color: '#8b5cf6',
    treatment: 'Prótesis completa',
    requiresLab: true,
    description: 'Prótesis total superior o inferior',
  },
  {
    id: 'protesis_removible',
    name: 'Prótesis Removible',
    category: 'lab',
    color: '#a78bfa',
    treatment: 'Prótesis parcial removible',
    requiresLab: true,
    description: 'Prótesis removible con ganchos o esquelético',
  },

  // ===== LABORATORY FINDINGS - APARATOS =====
  {
    id: 'guarda',
    name: 'Guarda',
    category: 'lab',
    color: '#10b981',
    treatment: 'Guarda oclusal',
    requiresLab: true,
    description: 'Guarda oclusal/placa de relajación',
  },
  {
    id: 'retenedor',
    name: 'Retenedor',
    category: 'lab',
    color: '#0ea5e9',
    treatment: 'Retenedor ortodóntico',
    requiresLab: true,
    description: 'Retenedor fijo o removible post-ortodoncia',
  },

  // ===== LABORATORY FINDINGS - IMPLANTES =====
  {
    id: 'implante',
    name: 'Implante',
    category: 'lab',
    color: '#3b82f6',
    treatment: 'Implante dental',
    requiresLab: true,
    description: 'Implante dental con corona sobre implante',
  },
];

// ============= HELPER FUNCTIONS =============

/**
 * Get finding definition by ID
 */
export function getFindingById(id: string): FindingDefinition | undefined {
  return FINDINGS_CATALOG.find(f => f.id === id);
}

/**
 * Get all lab findings
 */
export function getLabFindings(): FindingDefinition[] {
  return FINDINGS_CATALOG.filter(f => f.requiresLab);
}

/**
 * Get all clinical findings
 */
export function getClinicalFindings(): FindingDefinition[] {
  return FINDINGS_CATALOG.filter(f => !f.requiresLab && f.category === 'clinical');
}

/**
 * Check if tooth number is valid
 */
export function isValidToothNumber(num: number): num is ToothNumber {
  // Adult teeth: 11-18, 21-28, 31-38, 41-48
  if ((num >= 11 && num <= 18) || (num >= 21 && num <= 28) ||
      (num >= 31 && num <= 38) || (num >= 41 && num <= 48)) {
    return true;
  }
  // Child teeth: 51-55, 61-65, 71-75, 81-85
  if ((num >= 51 && num <= 55) || (num >= 61 && num <= 65) ||
      (num >= 71 && num <= 75) || (num >= 81 && num <= 85)) {
    return true;
  }
  return false;
}

/**
 * Check if tooth is child tooth
 */
export function isChildTooth(num: ToothNumber): boolean {
  return num >= 51 && num <= 85;
}

/**
 * Get all teeth for a dentition type
 */
export function getAllTeeth(type: 'adult' | 'child'): ToothNumber[] {
  const teeth = type === 'adult' ? ADULT_TEETH : CHILD_TEETH;
  return [
    ...teeth.upperRight,
    ...teeth.upperLeft,
    ...teeth.lowerLeft,
    ...teeth.lowerRight,
  ];
}
