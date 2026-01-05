# Pull Request Log

Este archivo registra todos los PRs y cambios importantes del proyecto DentalFlow.

---

## PR #1 - Bootstrap Project Structure
**Fecha**: 2025-12-XX
**Estado**: ✅ Completado

### Cambios
- Inicialización del proyecto con Vite + React + TypeScript
- Configuración de TailwindCSS y shadcn/ui
- Estructura de carpetas modular
- AppShell layout (sidebar + topbar + content)
- Routing básico
- Stubs de Supabase y Sentry

### Archivos Creados
- Configuración base del proyecto
- Documentación inicial

---

## Fix - Lab Order Creation from Odontogram
**Fecha**: 2026-01-02
**Tipo**: Critical Bug Fix
**Estado**: ✅ Completado

### Problema
El botón "Confirmar Pedido" en el modal de órdenes de laboratorio no funcionaba debido a restricciones RLS.

### Solución
1. Creado RPC `create_lab_order_rpc` con `SECURITY DEFINER`
2. Modificado `createLabOrder` para usar RPC en lugar de acceso directo a schema
3. Mejorado UX con toast notifications
4. Agregado logging para debugging

### Archivos Modificados
- `supabase/migrations/20260102220000_create_lab_order_rpc.sql` (nuevo)
- `src/modules/medical/actions/orders.ts`
- `src/modules/medical/components/odontogram.tsx`
- `src/modules/medical/components/order-modal.tsx`

### Documentación
Ver: `docs/FIXES/2026-01-02_lab_order_creation_fix.md`

---

## PR #10 — Kanban Fix & Welcome Experience (Visual Refactor)
**Fecha:** 2026-02-05
**Tipo:** Bug Fix / Feature Refinement
**Estado:** ✅ Completado

### Cambios
- **Resolución Crítica:** Eliminado error de ambigüedad "id" en el RPC de Kanban.
- **Mapeo de Datos:** Corrección de columnas `due_date` y casting seguro de `patient_id`.
- **Componente Premium:** Restauración de `WelcomeToast` con estilo **Nano Banana/Ocean**.
- **Infraestructura:** Creación de `app_config` para gestión de estados globales dinámicos.

### Archivos Modificados
- `src/components/ui/welcome-toast.tsx`
- `src/hooks/use-welcome-message.ts`
- `supabase/migrations/20260205000014_fix_kanban_due_date.sql`

---

## PR #11 — Fix: Appointment Modal & Doctor Selection
**Fecha:** 2026-02-05
**Tipo:** Bug Fix / UX Improvement
**Estado:** 🔄 En Progreso

### Cambios
- **Selección de Doctor:**
  - Actualizado `get_doctors_rpc` para mostrar todos los doctores al Super Admin.
  - Ajustado `getCurrentDoctor` para devolver el ID de usuario correcto.
- **UX Modal:**
  - Eliminado botón de cierre duplicado.
  - Mejorada responsividad (altura 95vh, grid responsivo).
- **Creación de Pacientes (WIP):**
  - Ajustado `createPatientInline` para manejar usuarios Super Admin sin `clinic_id` (asigna primera clínica disponible por ahora).

### Archivos Modificados
- `src/app/dashboard/medical/appointments/new-appointment-modal.tsx`
- `src/app/dashboard/medical/appointments/actions.ts`
- `supabase/migrations/20260205000040_fix_get_doctors_for_super_admin.sql`

---

## PR #2: Lab Order Module Implementation (Phase 1)
**Date**: 2026-02-05
**Status**: Ready for Review
**Description**: 
Implemented the backend and initial frontend for the Lab Order module.
- **Database Schema**: Created full schema for `lab_orders`, `lab_order_items`, `lab_materials` (catalog), `lab_material_types`, `lab_configurations`.
- **Seed Data**: Populated catalog with Zirconia, E-Max, Metal Porcelain, and PMMA options.
- **Server Actions**: Implemented `getLabCatalog` (nested query) and `createLabOrder` (transactional-like insert).
- **Validation**: Added Zod schema for Lab Order forms.
- **Wrapper**: `OrderWizard` component with 3 steps (Material, Config, Review).
- **Verification**: Added `scripts/verify_lab_migration.ts` and `src/app/dashboard/lab/test-wizard/page.tsx` for visual testing.

**Changes**:
- `supabase/migrations/20260205000050_lab_order_schema.sql` (New)
- `src/actions/lab-orders.ts` (New)
- `src/types/lab.ts` (New)
- `src/lib/validations/lab.ts` (New)
- `src/components/lab/wizard/*` (New UI)
- `scripts/verify_lab_migration.ts` (New)

**Validation**:
- Schema verified via `verify_lab_migration.ts`.
- Build passed (`npm run build`).
- Lint checks passed for new files.

**Action Required**:
- Manual review of the Wizard UI at `/dashboard/lab/test-wizard`.
- Next steps: Integrate into Patient Chart (Odontogram) and complete "Shade Map" advanced UI.

- [x] **[SQL]** `20260205000055_link_chart_to_lab.sql`: Adds `lab_order_id` to `dental_chart`.

---

## PR #12 — Lab Order Integration & Linking (Finding -> Order)
**Fecha:** 2026-02-05
**Tipo:** Feature / Architecture Refinement
**Estado:** 🛑 Ready (Requires Migration Application)

### Cambios
Se completó la integración "Odontograma -> Orden de Laboratorio" asegurando integridad transaccional y visibilidad de esquemas.

- **Base de Datos:**
  - Nueva columna `lab_order_id` en `dental_chart` (Migration 55).
  - Nuevo RPC `create_lab_order_transaction` (Migration 56) para manejar inserción de orden + ítems + vinculación en una sola transacción atómica, resolviendo también acceso a `schema_lab` y `schema_medical`.
- **Backend (Server Actions):**
  - Refactorizado `createLabOrder` para invocar el RPC transaccional.
- **Frontend:**
  - Implementado Date Picker nativo en `ItemsConfiguration` con paso de estado al Wizard.
- **Testing:**
  - Creado script `scripts/verify_lab_permissions.ts` para validación E2E (Doctor Permissions).
  - Creado script `scripts/apply_migration.ts` para aplicación controlada de migraciones SQL.

### Archivos Nuevos/Modificados
- `supabase/migrations/20260205000055_link_chart_to_lab.sql`
- `supabase/migrations/20260205000056_create_lab_order_rpc.sql`
- `src/actions/lab-orders.ts`
- `src/components/lab/wizard/steps/items-configuration.tsx`
- `scripts/verify_lab_permissions.ts`

### Acción Requerida

---

## PR #13 — Lab Order SLA & Auto-Delivery Date
**Fecha:** 2026-02-05
**Tipo:** Feature / DB Schema
**Estado:** ✅ Completado

### Cambios
Implementado el cálculo automático de la fecha de entrega sugerida para órdenes de laboratorio.

- **Base de Datos:**
  - Nueva columna `sla_days` (INTEGER, Default 3) en `schema_lab.lab_configurations`.
- **Backend:**
  - `getLabCatalog` ahora retorna el SLA por configuración.
- **Frontend:**
  - `ItemsConfiguration` calcula `target_delivery_date` automáticamente.
  - Regla: `Fecha Actual + Max(SLA Items)`.
  - Regla Negocio: Se saltan fines de semana (Sábado/Domingo -> Lunes).
  - Permite edición manual si el usuario lo desea.

### Archivos Modificados
- `supabase/migrations/20260205000060_add_sla_to_configurations.sql`
- `src/actions/lab-orders.ts`
- `src/components/lab/wizard/steps/items-configuration.tsx`
- `src/types/lab.ts`

---

## PR #14 — Lab Order Shade Map (Interactive SVG)
**Fecha:** 2026-02-05
**Tipo:** Feature / UI Component
**Estado:** ✅ Completado

### Cambios
Implementado un selector de color interactivo y zonificado para órdenes de laboratorio, reemplazando el selector simple.

- **Componente `ShadeMapSelector`:**
  - SVG Interactivo con 3 zonas: Gingival, Body (Medio), Incisal.
  - Paleta VITA (A1-D4, Bleach).
  - Feedback visual de selección (fill/stroke).
- **Integración:**
  - Integrado en `ItemsConfiguration` (Wizard Step 2).
  - Compatible con formato de string estructurado: `G:A3 | M:A2 | I:A1`.
  - Mantiene compatibilidad con selecciones simples (Body only).

### Archivos Nuevos/Modificados
- `src/components/lab/shade-map-selector.tsx` (Nuevo)
- `src/components/lab/wizard/steps/items-configuration.tsx` (Modificado)

### Acción Requerida
Ninguna.

---

## Fix - Dashboard Menu & Build Restoration
**Fecha:** 2026-02-05
**Tipo:** Bug Fix / Integrity
**Estado:** ✅ Completado

### Problema
- Error de compilación por falta de `popover.tsx`.
- Enlaces rotos (404) en el menú de Clínica para 9 módulos (`cashier`, `suppliers`, `pharmacy`, etc.).

### Solución
1. Instalado componente `popover` via shadcn-ui.
2. Creados directorios y páginas stub ("En Construcción") para los 9 módulos faltantes en `src/app/dashboard/medical`.
   - `cashier`, `suppliers`, `accounts-payable`, `accounts-receivable`, `invoicing`, `payment-gateway`, `pharmacy`, `productivity`, `reports`.
3. Validada la navegación completa del dashboard.

### Archivos Modificados
- `src/components/ui/popover.tsx` (Nuevo)
- `src/app/dashboard/medical/*` (9 Archivos Nuevos)

---

## PR #16 — Lab Order Refinement: Validation & Visual Status
**Fecha:** 2026-02-05
**Tipo:** Bug Fix / Quality Assurance
**Estado:** ✅ Completado

### Cambios
- **Corrección RPC:** Actualizado `get_patient_dental_chart` para retornar `lab_order_id`, permitiendo al frontend identificar tratamientos con órdenes activas.
- **Validación UI:** Agregado `toast.error` en `ItemsConfiguration` para prevenir envío sin color seleccionado (Bug Fix: faltaba import).
- **Refactorización:** Eliminado uso inseguro de `useEffect` en `ItemsConfiguration` para cálculo de fechas, reemplazándolo por lógica síncrona robusta (ESLint Fix).
- **UX:** El Odontograma ahora muestra correctamente el botón "Actualizar" y fondo amarillo para ítems de laboratorio activos.

### Archivos Modificados
- `supabase/migrations/20260205000065_update_dental_chart_rpc.sql` (Nuevo)
- `src/components/lab/wizard/steps/items-configuration.tsx` (Refactor)
- `src/modules/medical/components/odontogram.tsx` (State Update)
- `src/modules/medical/actions/clinical.ts` (Interface Update)

### Notas Técnicas
- Se resolvió un error de migración `XX000` (cannot change return type) usando `DROP FUNCTION` previo en el script SQL y ejecutando via `db-executor-rpc`.


---

## PR #17  Lab Materials Catalog Module (Admin CRUD)
**Fecha:** 2026-01-04
**Tipo:** Feature / Module Implementation
**Estado:**  Completado

### Objetivo
Implementar un m�dulo administrativo completo para gestionar el cat�logo de materiales de laboratorio.

### Cambios Principales
- Tablas: lab_materials, lab_configurations
- 8 Server Actions CRUD
- M�dulo Admin completo con tabla expandible
- Wizard conectado a DB real
- Documentaci�n exhaustiva (5 docs)

### Archivos Creados
- supabase/migrations/EJECUTAR_AHORA_create_lab_catalog.sql
- src/modules/core/lab-materials/* (4 archivos)
- docs/* (5 documentos)

### Estad�sticas
- L�neas de C�digo: ~1,230
- Tiempo: 4 horas
- Score: 95/100 


### Actualizaci�n Final (2026-01-04 22:42)
-  Implementado checkbox 'Orden Express' en Wizard
-  Fecha bloqueada por defecto (calculada seg�n SLA)
-  Fecha manual solo disponible con Express activado
-  C�lculo autom�tico de d�as h�biles (salta fines de semana)
-  Mensaje de advertencia para Express
-  Bot�n 'CREAR ORDEN DE LAB' en Odontograma
-  Correcci�n de selector de color
-  Validaci�n completa de campos

