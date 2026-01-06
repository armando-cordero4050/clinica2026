// ============================================================================
// CLINICAL V2 - FINDINGS SERVER ACTIONS
// ============================================================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { ToothNumber, ToothSurface } from '../types';

interface SaveFindingParams {
  patientId: string;
  toothNumber: ToothNumber;
  surface: ToothSurface;
  findingId: string;
  notes?: string;
}

/**
 * Guarda un hallazgo dental en la base de datos
 * Usa la tabla existente tooth_conditions o dental_chart según el esquema
 */
export async function saveFinding(params: SaveFindingParams): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> {
  try {
    const supabase = await createClient();
    const { patientId, toothNumber, surface, findingId, notes } = params;

    // Obtener el usuario autenticado y su clínica
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No autorizado' };
    }

    // Obtener clinic_id del usuario
    const { data: staff } = await supabase
      .from('clinic_staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!staff) {
      return { success: false, error: 'Usuario no asociado a una clínica' };
    }

    // Intentar guardar en dental_chart (schema_medical)
    // Primero verificar si existe, si existe actualizar, si no insertar
    const { data: existing, error: checkError } = await supabase
      .from('dental_chart')
      .select('id')
      .eq('clinic_id', staff.clinic_id)
      .eq('patient_id', patientId)
      .eq('tooth_number', toothNumber)
      .eq('surface', surface)
      .single();

    if (existing) {
      // Actualizar existente
      const { data, error } = await supabase
        .from('dental_chart')
        .update({
          condition: findingId,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating finding:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } else {
      // Insertar nuevo
      const { data, error } = await supabase
        .from('dental_chart')
        .insert({
          clinic_id: staff.clinic_id,
          patient_id: patientId,
          tooth_number: toothNumber,
          surface: surface,
          condition: findingId,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting finding:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    }
  } catch (err: any) {
    console.error('Unexpected error in saveFinding:', err);
    return { success: false, error: err.message || 'Error inesperado' };
  }
}

/**
 * Obtiene todos los hallazgos de un paciente
 */
export async function getPatientFindings(patientId: string): Promise<{
  success: boolean;
  error?: string;
  data?: any[];
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('dental_chart')
      .select('*')
      .eq('patient_id', patientId)
      .order('tooth_number');

    if (error) {
      console.error('Error fetching findings:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Unexpected error in getPatientFindings:', err);
    return { success: false, error: err.message || 'Error inesperado' };
  }
}

/**
 * Elimina un hallazgo
 */
export async function deleteFinding(findingId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('dental_chart')
      .delete()
      .eq('id', findingId);

    if (error) {
      console.error('Error deleting finding:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error in deleteFinding:', err);
    return { success: false, error: err.message || 'Error inesperado' };
  }
}
