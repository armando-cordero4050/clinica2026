/**
 * Clinical V2 Module - Custom Hook
 * Convenience hook to access dental session store
 */

import { useDentalSessionStore } from '../stores/dental-session-store';

/**
 * Hook to access dental session state and actions
 * 
 * @example
 * ```tsx
 * const { patient, findings, addFinding, openWizard } = useDentalSession();
 * ```
 */
export function useDentalSession() {
  return useDentalSessionStore();
}

/**
 * Hook to access only specific parts of the store
 * Use for optimization to prevent unnecessary re-renders
 */
export function useDentalSessionSelector<T>(
  selector: (state: ReturnType<typeof useDentalSessionStore.getState>) => T
): T {
  return useDentalSessionStore(selector);
}
