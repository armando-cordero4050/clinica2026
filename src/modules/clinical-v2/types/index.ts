/**
 * Clinical V2 Module - Type Definitions
 * Complete type system for the new odontogram and lab wizard
 */

// ============= TOOTH TYPES =============

/** FDI Tooth Numbering System - Adults (11-48) and Children (51-85) */
export type ToothNumber = 
  // Adult teeth (permanent)
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18  // Quadrant 1 (upper right)
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28  // Quadrant 2 (upper left)
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38  // Quadrant 3 (lower left)
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48  // Quadrant 4 (lower right)
  // Child teeth (deciduous)
  | 51 | 52 | 53 | 54 | 55  // Quadrant 5 (upper right)
  | 61 | 62 | 63 | 64 | 65  // Quadrant 6 (upper left)
  | 71 | 72 | 73 | 74 | 75  // Quadrant 7 (lower left)
  | 81 | 82 | 83 | 84 | 85; // Quadrant 8 (lower right)

/** Tooth surfaces */
export type ToothSurface = 
  | 'oclusal'     // Oclusal/Incisal (chewing surface)
  | 'mesial'      // Mesial (toward midline)
  | 'distal'      // Distal (away from midline)
  | 'vestibular'  // Vestibular/Buccal (cheek side)
  | 'lingual';    // Lingual/Palatal (tongue side)

// ============= FINDING TYPES =============

/** Finding categories */
export type FindingCategory = 
  | 'clinical'  // Clinical findings (caries, fillings, etc.)
  | 'lab'       // Laboratory work required
  | 'existing'; // Existing restorations

/** Status of a finding */
export type FindingStatus = 
  | 'pending'      // Registered, not yet addressed
  | 'in_progress'  // Treatment/order in progress
  | 'completed';   // Completed

/** Clinical finding definition (from catalog) */
export interface FindingDefinition {
  id: string;
  name: string;
  category: FindingCategory;
  color: string;
  treatment: string;
  requiresLab: boolean;
  description?: string;
}

/** Actual tooth finding instance for a patient */
export interface ToothFinding {
  id: string;
  patientId: string;
  toothNumber: ToothNumber;
  surface: ToothSurface;
  findingId: string;
  findingName: string;
  category: FindingCategory;
  color: string;
  status: FindingStatus;
  notes?: string;
  serviceId?: string;
  cost?: number;
  price?: number;
  labOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= LAB ORDER TYPES =============

/** Lab order item for wizard */
export interface LabOrderItem {
  id: string;
  configurationId: string;
  configurationName: string;
  toothNumber: ToothNumber;
  toothSurface?: ToothSurface;
  color: string;
  unitPrice: number;
  clinicalFindingId?: string;
  sourceFindingId?: string; // Reference to ToothFinding
  notes?: string;
}

/** Shipping types */
export type ShippingType = 'pickup' | 'courier' | 'digital';

/** Lab order priority */
export type OrderPriority = 'urgent' | 'normal' | 'low';

/** Lab wizard state */
export interface LabOrderWizardState {
  // Step 1: Material selection
  selectedMaterialId?: string;
  selectedTypeId?: string;
  selectedConfigurationId?: string;
  configurationDetails?: {
    id: string;
    name: string;
    basePrice: number;
    slaDays: number;
  };

  // Step 2: Items configuration
  items: LabOrderItem[];

  // Step 3: Shipping
  shippingType: ShippingType;
  carrierName?: string;
  trackingNumber?: string;
  clinicLat?: number;
  clinicLng?: number;

  // General order data
  patientId: string;
  doctorId?: string;
  priority: OrderPriority;
  targetDeliveryDate?: string;
  notes?: string;
}

// ============= DENTAL SESSION STATE =============

/** Patient info in the session */
export interface SessionPatient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
}

/** Main dental session state */
export interface DentalSessionState {
  // Patient context
  patient: SessionPatient | null;
  isChildDentition: boolean;

  // Findings
  findings: ToothFinding[];
  
  // Wizard state
  wizardOpen: boolean;
  wizardStep: number;
  wizardState: LabOrderWizardState | null;

  // UI state
  selectedTooth: ToothNumber | null;
  selectedSurface: ToothSurface | null;
}

// ============= STORE ACTIONS =============

export interface DentalSessionActions {
  // Session management
  initSession: (patient: SessionPatient, isChild?: boolean) => void;
  clearSession: () => void;
  
  // Dentition type
  setIsChildDentition: (isChild: boolean) => void;
  
  // Findings
  addFinding: (finding: Omit<ToothFinding, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFinding: (id: string, updates: Partial<ToothFinding>) => void;
  removeFinding: (id: string) => void;
  loadFindings: (findings: ToothFinding[]) => void;
  
  // Tooth/Surface selection
  selectTooth: (tooth: ToothNumber | null, surface?: ToothSurface | null) => void;
  
  // Wizard
  openWizard: (sourceFindings?: ToothFinding[]) => void;
  closeWizard: () => void;
  setWizardStep: (step: number) => void;
  updateWizardState: (updates: Partial<LabOrderWizardState>) => void;
  
  // Getters
  getLabFindings: () => ToothFinding[];
  getPendingLabFindings: () => ToothFinding[];
  getFindingsForTooth: (tooth: ToothNumber) => ToothFinding[];
}

// ============= COMPONENT PROPS =============

export interface OdontogramV2Props {
  patientId: string;
  patientName: string;
  readonly?: boolean;
  initialDentition?: 'adult' | 'child';
}

export interface ToothChartProps {
  dentition: 'adult' | 'child';
  findings: ToothFinding[];
  selectedTooth: ToothNumber | null;
  selectedSurface: ToothSurface | null;
  onToothClick: (tooth: ToothNumber, surface: ToothSurface) => void;
  readonly?: boolean;
}

export interface FindingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tooth: ToothNumber | null;
  surface: ToothSurface | null;
  onSave: (finding: Omit<ToothFinding, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export interface FindingsPanelProps {
  findings: ToothFinding[];
  onEdit: (finding: ToothFinding) => void;
  onDelete: (id: string) => void;
  onCreateLabOrder: () => void;
}

export interface LabWizardV2Props {
  open: boolean;
  onClose: () => void;
  initialItems?: LabOrderItem[];
  patientId: string;
}
