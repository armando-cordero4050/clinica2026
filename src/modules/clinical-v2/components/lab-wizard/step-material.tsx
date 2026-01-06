// ============================================================================
// CLINICAL V2 - LAB WIZARD STEP 1: MATERIAL SELECTION
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDentalSession } from '../../hooks/use-dental-session';
import { getLabMaterials, getLabConfigurations } from '@/modules/core/lab-materials/actions';
import { Loader2, ChevronRight, Package } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function StepMaterial() {
  const { setWizardStep, updateWizardState, wizardState } = useDentalSession();
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    wizardState.materialId || null
  );
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(
    wizardState.configurationId || null
  );
  const [loading, setLoading] = useState(true);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  // Cargar materiales al montar
  useEffect(() => {
    loadMaterials();
  }, []);

  // Cargar configuraciones cuando se selecciona un material
  useEffect(() => {
    if (selectedMaterialId) {
      loadConfigurations(selectedMaterialId);
    } else {
      setConfigurations([]);
      setSelectedConfigId(null);
    }
  }, [selectedMaterialId]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const result = await getLabMaterials();
      if (result.success && result.data) {
        setMaterials(result.data);
      } else {
        toast.error('Error al cargar materiales');
      }
    } catch (error) {
      toast.error('Error inesperado al cargar materiales');
    } finally {
      setLoading(false);
    }
  };

  const loadConfigurations = async (materialId: string) => {
    setLoadingConfigs(true);
    try {
      const result = await getLabConfigurations(materialId);
      if (result.success && result.data) {
        setConfigurations(result.data);
      } else {
        toast.error('Error al cargar configuraciones');
      }
    } catch (error) {
      toast.error('Error inesperado al cargar configuraciones');
    } finally {
      setLoadingConfigs(false);
    }
  };

  const handleNext = () => {
    if (!selectedMaterialId || !selectedConfigId) {
      toast.error('Por favor selecciona un material y una configuración');
      return;
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    const config = configurations.find(c => c.id === selectedConfigId);

    updateWizardState({
      materialId: selectedMaterialId,
      materialName: material?.name,
      configurationId: selectedConfigId,
      configurationName: config?.name,
    });

    setWizardStep(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Cargando materiales...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Paso 1: Seleccionar Material</h3>
        <p className="text-sm text-gray-600">
          Elige el tipo de material y la configuración específica para el trabajo de laboratorio
        </p>
      </div>

      {/* Grid de materiales */}
      <div>
        <label className="text-sm font-medium mb-3 block">Material Base</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => {
                setSelectedMaterialId(material.id);
                setSelectedConfigId(null);
              }}
              className={cn(
                'p-4 border-2 rounded-lg text-left transition-all hover:shadow-md',
                selectedMaterialId === material.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-start gap-2">
                <Package className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{material.name}</div>
                  {material.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                  {material.config_count > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {material.config_count} configuraciones
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuraciones (aparecen cuando se selecciona un material) */}
      {selectedMaterialId && (
        <div>
          <label className="text-sm font-medium mb-3 block">Configuración</label>
          
          {loadingConfigs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : configurations.length === 0 ? (
            <Card className="p-4 text-center text-gray-500">
              No hay configuraciones disponibles para este material
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {configurations.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setSelectedConfigId(config.id)}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all hover:shadow-md',
                    selectedConfigId === config.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="font-semibold text-sm mb-1">{config.name}</div>
                  {config.code && (
                    <p className="text-xs text-gray-500 mb-2">Código: {config.code}</p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Precio base: ${config.base_price?.toFixed(2) || '0.00'}
                    </span>
                    <span className="text-gray-600">
                      SLA: {config.sla_days} días
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleNext}
          disabled={!selectedMaterialId || !selectedConfigId}
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
