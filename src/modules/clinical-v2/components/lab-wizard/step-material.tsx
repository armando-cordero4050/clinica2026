/**
 * Clinical V2 - Lab Wizard Step 1: Material Selection
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getLabCatalogV2 } from '../../actions';
import { useDentalSession } from '../../hooks/use-dental-session';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LabMaterial {
  id: string;
  name: string;
  slug: string;
  description?: string;
  types: LabMaterialType[];
}

interface LabMaterialType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  configurations: LabConfiguration[];
}

interface LabConfiguration {
  id: string;
  name: string;
  slug: string;
  category: string;
  requires_units: boolean;
  base_price: number;
  sla_days: number;
}

export function StepMaterial() {
  const { wizardState, updateWizardState } = useDentalSession();
  const [materials, setMaterials] = useState<LabMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<LabMaterial | null>(null);
  const [selectedType, setSelectedType] = useState<LabMaterialType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const result = await getLabCatalogV2();
      if (result.success && result.data) {
        setMaterials(result.data as LabMaterial[]);
      } else {
        toast.error('Error al cargar catálogo de laboratorio');
      }
    } catch (error) {
      console.error('Error loading catalog:', error);
      toast.error('Error al cargar catálogo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaterialSelect = (material: LabMaterial) => {
    setSelectedMaterial(material);
    setSelectedType(null);
    updateWizardState({
      selectedMaterialId: material.id,
      selectedTypeId: undefined,
      selectedConfigurationId: undefined,
      configurationDetails: undefined,
    });
  };

  const handleTypeSelect = (type: LabMaterialType) => {
    setSelectedType(type);
    updateWizardState({
      selectedTypeId: type.id,
      selectedConfigurationId: undefined,
      configurationDetails: undefined,
    });
  };

  const handleConfigurationSelect = (config: LabConfiguration) => {
    updateWizardState({
      selectedConfigurationId: config.id,
      configurationDetails: {
        id: config.id,
        name: config.name,
        basePrice: config.base_price,
        slaDays: config.sla_days,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Cargando catálogo de materiales...
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          No hay materiales disponibles en el catálogo.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Contacta al administrador para configurar el catálogo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          1. Seleccionar Material
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => handleMaterialSelect(material)}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                'hover:border-blue-300 hover:shadow-md',
                selectedMaterial?.id === material.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              )}
            >
              <div className="font-semibold">{material.name}</div>
              {material.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {material.description}
                </p>
              )}
              <Badge variant="outline" className="mt-2">
                {material.types.length} tipos
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Type Selection */}
      {selectedMaterial && (
        <div>
          <Label className="text-base font-semibold mb-3 block">
            2. Seleccionar Tipo
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {selectedMaterial.types.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  'hover:border-purple-300 hover:shadow-md',
                  selectedType?.id === type.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                )}
              >
                <div className="font-semibold">{type.name}</div>
                {type.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {type.description}
                  </p>
                )}
                <Badge variant="secondary" className="mt-2">
                  {type.configurations.length} configuraciones
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Selection */}
      {selectedType && (
        <div>
          <Label className="text-base font-semibold mb-3 block">
            3. Seleccionar Configuración
          </Label>
          <div className="grid gap-3">
            {selectedType.configurations.map((config) => (
              <button
                key={config.id}
                onClick={() => handleConfigurationSelect(config)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  'hover:border-green-300 hover:shadow-md',
                  wizardState?.selectedConfigurationId === config.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">{config.name}</div>
                    <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                      <span>Precio base: ${config.base_price}</span>
                      <span>•</span>
                      <span>SLA: {config.sla_days} días</span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {config.category}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
