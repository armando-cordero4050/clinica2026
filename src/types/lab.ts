export type LabCategory = 'fixed' | 'removable' | 'orthodontics' | 'cosmetic' | 'restoration';

export interface LabConfiguration {
  id: string;
  name: string;
  category: LabCategory;
  requires_units?: boolean; // If true, price is typically per unit and user selects multiple teeth
  base_price?: number;
  sla_days?: number;
}

export interface LabMaterialType {
  id: string;
  name: string;
  configurations: LabConfiguration[];
}

export interface LabMaterial {
  id: string;
  name: string;
  types: LabMaterialType[];
}

export interface LabCatalog {
  materials: LabMaterial[];
}
