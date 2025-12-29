# PR_LOG — DentalFlow / dentalapp

Registro operativo por PR. Cada PR agrega una entrada nueva abajo.
Regla: no borrar entradas; si algo se corrige, se agrega una nota en el PR siguiente.

---

## PR #1 — Bootstrap / estructura base
**Fecha:** 2025-12-24  
**Objetivo:** Arrancar proyecto React+Vite+TS, estructura modular, docs base.  
**Cambios:**
- Setup inicial del repo y estructura `src/app`, `src/modules`, `src/shared`.
- Documentación base y UI kit inicial.
**Verificación:**
- Build OK
- Lint OK
**Riesgos:** bajos  
**Notas:** N/A

---

## PR #2 — Supabase Foundation (Auth & Core)
**Fecha:** 2025-12-24
**Objetivo:** Implementar base de datos Supabase (Tablas Core + RLS) y Auth Client.
**Cambios:**
- DB: Tablas `clinics`, `profiles`, `roles`, `permissions`, `clinic_members`.
- DB: Policies RLS multi-tenant estrictas.
- DB: Función `get_current_clinic_id`.
- Front: `AuthContext` y `useSession` (src/shared/lib/auth.tsx).
- Config: `supabase/config.toml` y migración `001_core_foundation.sql`.
**Verificación:**
- SQL revisado contra decisión de multi-tenancy.
- Build OK.
**Riesgos:** Crítico (Base de seguridad).
**Notas:** Se unificó PR #3 en este PR por atomicidad.
---

## PR #2 — Database Schema Implementation (V4 Reboot)
**Fecha:** 2025-12-28
**Objetivo:** Implementar la base de datos V4 (Clinics, Patients, Lab Orders) según la guía "Zero-Based".
**Cambios:**
- Migration: `20251229000000_init_v4_schema.sql`
- Enums & Tables: Clinics, Profiles, Patients, Lab Services, Orders.
- Security: RLS estricto por `clinic_id`.
**Verificación:**
- SQL Syntax Check: Pendiente.
**Riesgos:**
- Reset de DB requerido para aplicar V4 limpio.
---

## PR #3 — Auth & Tenant Resolution
**Fecha:** 2025-12-28
**Objetivo:** Implementar flujo de Login y resolución automática de `clinic_id`.
**Cambios:**
- Refactor `AuthProvider` (auth.tsx): Fetch de `profiles` al iniciar sesión.
- Componente `AuthGuard`: Protección de rutas.
- Página Login (`/login`) con shadcn/ui.
- Fix: Reemplazo de `next/navigation` por `react-router-dom` (Vite compatible).
**Verificación:**
- Build OK.
- Lint OK.
- Validación manual de tipos en `database.types.ts`.
**Riesgos:**
- Dependencia de `next-themes` añadida para compatibilidad con shadcn.
---

## PR #4 — Patients Module (CRUD)
**Fecha:** 2025-12-28
**Objetivo:** Gestión de Pacientes con RLS y Validación.
**Cambios:**
- `src/modules/patients/schemas`: Zod Schema estricto.
- `src/modules/patients/api`: Supabase Service para CRUD.
- `src/modules/patients/components`: `PatientForm` (Modal) y `PatientList`.
- `src/app/dashboard/patients`: Página principal.
- **Cleanup**: Eliminados archivos legacy (`hooks/usePatients.ts`, `pages/*` antiguos) que causaban conflictos.
**Verificación:**
- Build OK.
- Componentes Base (UI) creados manualmente (`Form`, `Dialog`, `Table`).
**Riesgos:**
- Verificar que el `clinic_id` se inyecte correctamente en el INSERT (responsabilidad del API Service).
---

## PR #5 — Lab Module (Orders & Kanban)
**Fecha:** 2025-12-28
**Objetivo:** Gestión Avanzada de Órdenes y Flujo de Trabajo (Kanban).
**Cambios:**
- `src/modules/lab/schemas`: Zod Schema para Ordenes e Items.
- `src/modules/lab/api`: API Transaccional (Order + Items).
- `src/modules/lab/components`:
    - `OrderWizard`: Formulario paso a paso para clínicas.
    - `KanbanBoard`: Tablero de gestión de estados (Drag/Drop simulado con Select).
- `src/app/dashboard/lab`: Paginas de Kanban y Nueva Orden.
- **UI Kit**: Componentes `Select` y `Badge` añadidos.
**Verificación:**
- Build OK.
- Lint OK (Fix variables no usadas).
**Riesgos:**
- El Kanban usa actualización optimista; si falla el API, revierte el estado.
**Notas:**
- Se usó `react-hook-form` con `useFieldArray` para los ítems de la orden.
