// ============================================================================
// CLINICAL V2 - DENTAL SESSION HOOK
// ============================================================================

import { useDentalSessionStore } from '../stores/dental-session-store';

/**
 * Hook para acceder al estado y acciones de la sesión dental
 * Wrapper sobre el store de Zustand para mayor conveniencia
 */
export function useDentalSession() {
  return useDentalSessionStore();
}

/**
 * Hook para acceder solo a las acciones (sin causar re-renders por cambios de estado)
 */
export function useDentalSessionActions() {
  return useDentalSessionStore((state) => ({
    initSession: state.initSession,
    clearSession: state.clearSession,
    addFinding: state.addFinding,
    updateFinding: state.updateFinding,
    removeFinding: state.removeFinding,
    setFindings: state.setFindings,
    selectTooth: state.selectTooth,
    openWizard: state.openWizard,
    closeWizard: state.closeWizard,
    setWizardStep: state.setWizardStep,
    updateWizardState: state.updateWizardState,
    resetWizardState: state.resetWizardState,
  }));
}

/**
 * Hook para acceder solo al estado (útil para componentes que no necesitan acciones)
 */
export function useDentalSessionState() {
  return useDentalSessionStore((state) => ({
    patientId: state.patientId,
    patientName: state.patientName,
    findings: state.findings,
    selectedTooth: state.selectedTooth,
    selectedSurface: state.selectedSurface,
    wizardOpen: state.wizardOpen,
    wizardState: state.wizardState,
  }));
}

/**
 * Hook para acceder solo a los getters
 */
export function useDentalSessionGetters() {
  return useDentalSessionStore((state) => ({
    getLabFindings: state.getLabFindings,
    getPendingLabFindings: state.getPendingLabFindings,
    getFindingsForTooth: state.getFindingsForTooth,
  }));
}
