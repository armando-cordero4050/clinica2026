# Lab Order Logic & Business Rules

## Core Workflow
1. **Clinic & Patient Selection**: 
   - Mandatory first step.
   - Filters available pricing if specific pricelists exist (though currently general).

2. **Material Selection**:
   - The primary driver of the form.
   - Changing material resets subordinate fields (Type, Configuration).

3. **Hierarchy**:
   `Material` -> `Tipo de Trabajo` -> `Configuración` -> `Price`

## Known Materials & Rules

### 1. Zirconio
- **Types**: 
  - *Zirconio Monolitico*
  - *Zirconio Stratificado* (Likely, need verification)
- **Configurations**:
  - *Corona Monolitica* (Unitary)
  - *Puente* (Requires selecting multiple teeth)
  - *Carilla* (Veneer)

### 2. Disilicato de Litio
- **Types**:
  - *E-max CAD*
  - *E-max Press*
- **Configurations**:
  - *Corona*
  - *Carilla*
  - *Inlay/Onlay*

### 3. Metal Porcelana
- **Types**:
  - *Standard*
  - *Premium*
- **Configurations**:
  - *Corona*
  - *Puente*

### 4. PMMA
- **Types**:
  - *Provisional*
  - *Long Term*
- **Configurations**:
  - *Corona*
  - *Puente*

## Pricing Rules
- Prices are generally per unit.
- Bridges (Puentes) might be calculated as `Unit Price * Number of Units` or have a specific block price.
- **Urgency Fees**: Need to check if "Urgency" adds a percentage or fixed fee.

## Missing Data (To Be Scraped)
- Full list of materials.
- Exact names of "Types" for each material.
- Precise pricing for each configuration.
- Constraints (e.g., max bridge units).

## Delivery Times & SLA

### 1. Regla General (Estricta)
- **SLA Base**: Cada configuración tiene `sla_days` (default: 3 días).
- **Cálculo Automático**: 
  - `Fecha Entrega` = `Fecha Creación` + `Max(SLA de items)`.
  - **Fines de Semana**: Si cae Sábado/Domingo -> Se mueve al Lunes siguiente.
- **UI**: El campo de fecha estará **DESHABILITADO** por defecto. El usuario NO puede cambiar la fecha arbitrariamente.

### 2. Excepción: Orden Express
- **Checkbox**: `[ ] Orden Express`.
- **Efecto**:
  1. Habilita el campo de fecha para selección manual.
  2. Muestra Alerta: *"Consulte a su asesor para validar el costo del servicio express."*
  3. Marca la orden con prioridad alta.


## Color & Shade Map Logic
- **Data Structure**: Stored in `lab_order_items.color` (TEXT column).
- **Format**:
  - **Simple**: `"A2"` (Legacy or simple orders).
  - **Structured**: `"G:A3 | M:A2 | I:A1"` (Gingival | Middle/Body | Incisal).
- **UI**: Interactive SVG allows selecting specific zones. If only "Middle" is selected, it saves as simple text to keep DB clean.
- **Palette**: Standard VITA Classical (A1-D4) + Bleach shades (BL1-BL4).

## Technical Implementation (v1.1 - 2026-02-05)

### Database Schema (`schema_lab`)
- **`lab_orders`**: Stores header info (Patient, Doctor, Status, Dates). Linked to `schema_medical.patients`.
- **`lab_order_items`**: Detail lines. Linked to `public.lab_configurations` (Cross-schema FK to allow using Public Catalog).
- **`lab_materials` / `lab_types` / `lab_configurations`**: Catalog tables.

### RPC Integration
**1. `create_lab_order_transaction` (Atomic Creation)**:
   - **Input**: JSON payload `{ order: {...}, items: [...] }`.
   - **Process**:
     1. Inserts Order into `lab_orders`.
     2. Inserts Items into `lab_order_items`.
     3. **Linking**: Updates `schema_medical.dental_chart` setting `lab_order_id` for the corresponding `clinical_finding_id`.
   - **Security**: `SECURITY DEFINER` allows linking across schemas (`medical` <-> `lab`) while maintaining RLS.

**2. `get_patient_dental_chart` (Updated)**:
   - Now returns `lab_order_id`.
   - **Frontend Impact**: Enables the Odontogram to identify findings with active orders, displaying the "Actualizar" button and yellow highlighting.

### Frontend Logic (Wizard)
- **Location**: `src/components/lab/wizard`.
- **State Management**: Local React State passed through steps.
- **Validation**:
  - **Color**: Mandatory check in Step 2 (`ItemsConfiguration`). Uses `toast.error` if missing.
  - **Dates**: Auto-calculated based on SLA but allows manual override.
- **Update Flow (Current Limitation)**:
  - The "Actualizar" action currently re-opens the Wizard with existing data.
  - **Note**: Submitting valid updates via `create_lab_order_transaction` currently creates a **new** order version. A dedicated `update` RPC is scheduled for Phase 3 to allow in-place modification.

### Action Hooks
- `createLabOrder` in `src/actions/lab-orders.ts`: Orchestrates the call to `create_lab_order_transaction`.
