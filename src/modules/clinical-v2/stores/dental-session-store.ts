/**
 * Clinical V2 Module - Zustand Store
 * Central state management for dental session
 */

import { create } from 'zustand';
import { 
  DentalSessionState, 
  DentalSessionActions, 
  SessionPatient, 
  ToothFinding,
  ToothNumber,
  ToothSurface,
  LabOrderWizardState,
} from '../types';

type DentalSessionStore = DentalSessionState & DentalSessionActions;

/**
 * Dental Session Store
 * Manages patient context, findings, and wizard state
 */
export const useDentalSessionStore = create<DentalSessionStore>((set, get) => ({
  // ============= INITIAL STATE =============
  patient: null,
  isChildDentition: false,
  findings: [],
  wizardOpen: false,
  wizardStep: 1,
  wizardState: null,
  selectedTooth: null,
  selectedSurface: null,

  // ============= SESSION MANAGEMENT =============
  
  initSession: (patient: SessionPatient, isChild = false) => {
    set({
      patient,
      isChildDentition: isChild,
      findings: [],
      wizardOpen: false,
      wizardStep: 1,
      wizardState: null,
      selectedTooth: null,
      selectedSurface: null,
    });
  },

  clearSession: () => {
    set({
      patient: null,
      isChildDentition: false,
      findings: [],
      wizardOpen: false,
      wizardStep: 1,
      wizardState: null,
      selectedTooth: null,
      selectedSurface: null,
    });
  },

  // ============= DENTITION TYPE =============
  
  setIsChildDentition: (isChild: boolean) => {
    set({ isChildDentition: isChild });
  },

  // ============= FINDINGS MANAGEMENT =============
  
  addFinding: (finding) => {
    const newFinding: ToothFinding = {
      ...finding,
      id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      findings: [...state.findings, newFinding],
    }));
  },

  updateFinding: (id: string, updates: Partial<ToothFinding>) => {
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === id
          ? { ...f, ...updates, updatedAt: new Date().toISOString() }
          : f
      ),
    }));
  },

  removeFinding: (id: string) => {
    set((state) => ({
      findings: state.findings.filter((f) => f.id !== id),
    }));
  },

  loadFindings: (findings: ToothFinding[]) => {
    set({ findings });
  },

  // ============= TOOTH/SURFACE SELECTION =============
  
  selectTooth: (tooth: ToothNumber | null, surface: ToothSurface | null = null) => {
    set({
      selectedTooth: tooth,
      selectedSurface: surface,
    });
  },

  // ============= WIZARD MANAGEMENT =============
  
  openWizard: (sourceFindings?: ToothFinding[]) => {
    const state = get();
    const patient = state.patient;
    
    if (!patient) {
      console.error('Cannot open wizard: No patient in session');
      return;
    }

    // Get lab findings to pre-fill items
    const labFindings = sourceFindings || state.getLabFindings();
    
    // Create initial items from lab findings
    const items = labFindings
      .filter(f => f.status === 'pending')
      .map((f, index) => ({
        id: `item_${Date.now()}_${index}`,
        configurationId: f.serviceId || '',
        configurationName: f.findingName,
        toothNumber: f.toothNumber,
        toothSurface: f.surface,
        color: '',
        unitPrice: f.price || 0,
        clinicalFindingId: f.id,
        sourceFindingId: f.id,
        notes: f.notes,
      }));

    const wizardState: LabOrderWizardState = {
      patientId: patient.id,
      priority: 'normal',
      items,
      shippingType: 'pickup',
    };

    set({
      wizardOpen: true,
      wizardStep: 1,
      wizardState,
    });
  },

  closeWizard: () => {
    set({
      wizardOpen: false,
      wizardStep: 1,
      wizardState: null,
    });
  },

  setWizardStep: (step: number) => {
    set({ wizardStep: step });
  },

  updateWizardState: (updates: Partial<LabOrderWizardState>) => {
    set((state) => ({
      wizardState: state.wizardState
        ? { ...state.wizardState, ...updates }
        : null,
    }));
  },

  // ============= GETTERS =============
  
  getLabFindings: () => {
    const state = get();
    return state.findings.filter(f => f.category === 'lab');
  },

  getPendingLabFindings: () => {
    const state = get();
    return state.findings.filter(
      f => f.category === 'lab' && f.status === 'pending'
    );
  },

  getFindingsForTooth: (tooth: ToothNumber) => {
    const state = get();
    return state.findings.filter(f => f.toothNumber === tooth);
  },
}));
