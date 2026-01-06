// ============================================================================
// CLINICAL V2 - TYPES
// ============================================================================

// Números de dientes según sistema FDI
export type AdultToothNumber = 
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18  // Cuadrante superior derecho
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28  // Cuadrante superior izquierdo
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38  // Cuadrante inferior izquierdo
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48; // Cuadrante inferior derecho

export type ChildToothNumber =
  | 51 | 52 | 53 | 54 | 55  // Cuadrante superior derecho
  | 61 | 62 | 63 | 64 | 65  // Cuadrante superior izquierdo
  | 71 | 72 | 73 | 74 | 75  // Cuadrante inferior izquierdo
  | 81 | 82 | 83 | 84 | 85; // Cuadrante inferior derecho

export type ToothNumber = AdultToothNumber | ChildToothNumber;

// Superficies dentales
export type ToothSurface = 'oclusal' | 'mesial' | 'distal' | 'vestibular' | 'lingual' | 'whole';

// Categorías de hallazgos
export type FindingCategory = 'clinical' | 'lab' | 'existing';

// Definición de un hallazgo (catálogo estático)
export interface FindingDefinition {
  id: string;
  name: string;
  shortName?: string;
  color: string; // Color hex para el SVG
  category: FindingCategory;
  requiresLabOrder: boolean; // Si requiere trabajo de laboratorio
  description?: string;
}

// Hallazgo registrado en un paciente
export interface ToothFinding {
  id: string;
  patientId: string;
  toothNumber: ToothNumber;
  surface: ToothSurface;
  findingId: string; // Referencias a FindingDefinition
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Relación con orden de laboratorio (si aplica)
  labOrderId?: string;
  labOrderStatus?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// Item para el wizard de laboratorio
export interface LabOrderItem {
  id?: string;
  configurationId: string;
  configurationName?: string;
  toothNumber: ToothNumber;
  color: string; // Shade/color del material
  unitPrice: number;
  clinicalFindingId?: string; // Link al hallazgo clínico que originó este item
}

// Tipo de envío para logística
export type ShippingType = 'pickup' | 'courier' | 'digital';

// Estado del wizard de laboratorio
export interface LabOrderWizardState {
  step: number; // 1-4
  // Paso 1: Material
  materialId?: string;
  materialName?: string;
  configurationId?: string;
  configurationName?: string;
  // Paso 2: Items
  items: LabOrderItem[];
  // Paso 3: Envío
  shippingType: ShippingType;
  carrierName?: string;
  trackingNumber?: string;
  clinicLat?: number;
  clinicLng?: number;
  isUrgent: boolean;
  // Paso 4: Revisión
  priority: 'normal' | 'urgent' | 'critical';
  targetDeliveryDate?: string;
  notes?: string;
}

// Estado completo de la sesión clínica
export interface DentalSessionState {
  // Información del paciente
  patientId: string | null;
  patientName: string | null;
  
  // Hallazgos
  findings: ToothFinding[];
  
  // Selección actual en el odontograma
  selectedTooth: ToothNumber | null;
  selectedSurface: ToothSurface | null;
  
  // Estado del wizard de laboratorio
  wizardOpen: boolean;
  wizardState: LabOrderWizardState;
}

// Acciones del store
export interface DentalSessionActions {
  // Inicialización
  initSession: (patientId: string, patientName: string) => void;
  clearSession: () => void;
  
  // Gestión de hallazgos
  addFinding: (finding: Omit<ToothFinding, 'id' | 'createdAt' | 'patientId'>) => void;
  updateFinding: (id: string, updates: Partial<ToothFinding>) => void;
  removeFinding: (id: string) => void;
  setFindings: (findings: ToothFinding[]) => void;
  
  // Selección de diente/superficie
  selectTooth: (tooth: ToothNumber | null, surface?: ToothSurface | null) => void;
  
  // Wizard de laboratorio
  openWizard: (initialItems?: LabOrderItem[]) => void;
  closeWizard: () => void;
  setWizardStep: (step: number) => void;
  updateWizardState: (updates: Partial<LabOrderWizardState>) => void;
  resetWizardState: () => void;
}

// Getters útiles
export interface DentalSessionGetters {
  getLabFindings: () => ToothFinding[];
  getPendingLabFindings: () => ToothFinding[];
  getFindingsForTooth: (tooth: ToothNumber) => ToothFinding[];
}

// Store completo
export type DentalSessionStore = DentalSessionState & DentalSessionActions & DentalSessionGetters;
