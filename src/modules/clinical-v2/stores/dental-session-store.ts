// ============================================================================
// CLINICAL V2 - DENTAL SESSION STORE (ZUSTAND)
// ============================================================================

import { create } from 'zustand';
import { 
  DentalSessionStore, 
  ToothFinding, 
  ToothNumber, 
  ToothSurface,
  LabOrderItem,
  LabOrderWizardState
} from '../types';
import { FINDINGS_CATALOG } from '../constants/dental';

// Estado inicial del wizard
const initialWizardState: LabOrderWizardState = {
  step: 1,
  items: [],
  shippingType: 'pickup',
  isUrgent: false,
  priority: 'normal',
};

export const useDentalSessionStore = create<DentalSessionStore>((set, get) => ({
  // ============================================================================
  // STATE
  // ============================================================================
  patientId: null,
  patientName: null,
  findings: [],
  selectedTooth: null,
  selectedSurface: null,
  wizardOpen: false,
  wizardState: initialWizardState,

  // ============================================================================
  // ACTIONS - Sesión
  // ============================================================================
  initSession: (patientId: string, patientName: string) => {
    set({
      patientId,
      patientName,
      findings: [],
      selectedTooth: null,
      selectedSurface: null,
      wizardOpen: false,
      wizardState: initialWizardState,
    });
  },

  clearSession: () => {
    set({
      patientId: null,
      patientName: null,
      findings: [],
      selectedTooth: null,
      selectedSurface: null,
      wizardOpen: false,
      wizardState: initialWizardState,
    });
  },

  // ============================================================================
  // ACTIONS - Hallazgos
  // ============================================================================
  addFinding: (finding) => {
    const { patientId } = get();
    if (!patientId) return;

    const newFinding: ToothFinding = {
      ...finding,
      id: `finding-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      patientId,
      createdAt: new Date(),
    };

    set((state) => ({
      findings: [...state.findings, newFinding],
    }));
  },

  updateFinding: (id: string, updates: Partial<ToothFinding>) => {
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date() } : f
      ),
    }));
  },

  removeFinding: (id: string) => {
    set((state) => ({
      findings: state.findings.filter((f) => f.id !== id),
    }));
  },

  setFindings: (findings: ToothFinding[]) => {
    set({ findings });
  },

  // ============================================================================
  // ACTIONS - Selección
  // ============================================================================
  selectTooth: (tooth: ToothNumber | null, surface?: ToothSurface | null) => {
    set({
      selectedTooth: tooth,
      selectedSurface: surface ?? null,
    });
  },

  // ============================================================================
  // ACTIONS - Wizard
  // ============================================================================
  openWizard: (initialItems?: LabOrderItem[]) => {
    set({
      wizardOpen: true,
      wizardState: {
        ...initialWizardState,
        items: initialItems || [],
      },
    });
  },

  closeWizard: () => {
    set({
      wizardOpen: false,
      wizardState: initialWizardState,
    });
  },

  setWizardStep: (step: number) => {
    set((state) => ({
      wizardState: {
        ...state.wizardState,
        step,
      },
    }));
  },

  updateWizardState: (updates: Partial<LabOrderWizardState>) => {
    set((state) => ({
      wizardState: {
        ...state.wizardState,
        ...updates,
      },
    }));
  },

  resetWizardState: () => {
    set({
      wizardState: initialWizardState,
    });
  },

  // ============================================================================
  // GETTERS
  // ============================================================================
  getLabFindings: () => {
    const { findings } = get();
    return findings.filter((f) => {
      const definition = FINDINGS_CATALOG.find((def) => def.id === f.findingId);
      return definition?.requiresLabOrder;
    });
  },

  getPendingLabFindings: () => {
    const { findings } = get();
    return findings.filter((f) => {
      const definition = FINDINGS_CATALOG.find((def) => def.id === f.findingId);
      return definition?.requiresLabOrder && !f.labOrderId;
    });
  },

  getFindingsForTooth: (tooth: ToothNumber) => {
    const { findings } = get();
    return findings.filter((f) => f.toothNumber === tooth);
  },
}));
