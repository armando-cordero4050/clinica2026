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

## PR #2 — Supabase Foundation (Auth & Core) (Initial)

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
---

## PR #6 — Global UI Integration

**Fecha:** 2025-12-28
**Objetivo:** Unificación de Módulos en Dashboard Layout.
**Cambios:**
- `src/app/App.tsx`: Configuración de Routing (`/dashboard`) y AuthGuard.
- `src/app/AppShell.tsx`: Sidebar con navegación real (Pacientes, Lab).
- **Core**: Implementación de Logout y User Info en Sidebar.
**Verificación:**
- Build OK.
- Navegación interna conectada.
---

## PR #7 — Appointments Module (Agenda)

**Fecha:** 2025-12-28
**Objetivo:** Módulo de Gestión de Citas (Agenda Semanal).
**Cambios:**
- **DB**: Nueva tabla `appointments` con RLS por clínica.
- `src/modules/appointments`:
    - `api`: CRUD completo y filtro por rango de fechas.
    - `components/CalendarView`: Vista semanal con navegación (Semana anterior/siguiente).
- **UI**: Página `/dashboard/appointments` integrada en Sidebar.
**Verificación:**
- Build OK.
- Lint OK.
- SQL Migrations aplicadas.
**Notas:**
- Se usó una cuadrícula (CSS Grid) para simular el calendario semanal.
- Próxima mejora: Modal para crear cita (ahora solo hay botón placeholder).

---

## PR #8 — Clinic Flow Optimization (Agenda & Odontogram Enhancements)

**Fecha:** 2025-12-31
**Objetivo:** Optimizar el flujo clínico con Agenda mejorada y Odontograma Financiero + Logística.
**Cambios:**
- **Agenda**: Modal `NewAppointmentModal` (replica Doctocliq) con creación rápida de pacientes.
- **Odontograma**: 
    - Lógica financiera (Costo, Precio, Margen %/$).
    - Integración con Catálogo de Servicios Mock (Core).
    - Modal de Pedido (`OrderModal`) con opciones de logística (Digital/Físico, Guatex, etc.).
- **DB**: Migración `20260130000032_clinic_flow_optimization.sql`.
    - `appointments` (Full SQL).
    - `budgets` (Híbrido: Items en JSONB).
    - Updates en `schema_lab.orders` (Logística en JSONB).
**Verificación:**
- Componentes UI funcionales.
- Lint OK.
**Riesgos:**
- Dependencia de JSONB para items financieros requiere validación estricta en API/Frontend.

---

## PR #9 — Admin Credentials & Patient Flow

**Fecha:** 2025-12-31
**Objetivo:** Establecer credenciales definitivas para Admin Core y validar flujo de creación de pacientes.
**Cambios:**
- **DB**: Migración `20260131000001_update_core_admin_credentials.sql`.
- **Core**: Usuario `admin@dentalflow.com` establecido como `super_admin`.
- **Medical**: Página de creación de pacientes (`/dashboard/medical/patients/new`) conectada a API.
- **Admin**: Dashboard de Clínicas con monitoreo de pacientes en tiempo real.
**Verificación:**
- SQL aplicado manualmente.
- Login con nuevas credenciales validado.

---

## PR #10 — Kanban Fix & Welcome Experience

**Fecha:** 2026-02-05
**Objetivo:** Resolver bug crítico de ambigüedad en Kanban y restaurar experiencia de bienvenida creativa.
**Cambios:**
- **DB**: Migraciones `20260205000008` hasta `20260205000014`.
    - Fix `public.get_lab_kanban`: Resolvió ambigüedad de `id`, mapeo de `due_date` y cast de `patient_id`.
    - Create `public.app_config`: Almacenamiento de configuraciones globales (ej: Welcome Message).
- **Front**: 
    - `WelcomeToast`: Añadida variante `banana` y soporte dinámico para `ocean`.
    - `use-welcome-message`: Eliminada restricción de sesión para mostrar el toast en cada login/reload por petición del usuario.
- **Config**: Establecido `Ocean` como variante por defecto.
**Verificación:**
- Kanban carga datos reales con éxito.
- Toast visible en cada carga de página.
**Riesgos:**
- El toast en cada carga puede saturar el área visual si hay muchas notificaciones simultáneas.

## PR #11 — Odoo Integration Phase 2 (Total Sync & Credit Logic)
**Fecha:** 2026-02-05
**Objetivo:** Implementar sincronización total de campos, normalización de datos y lógica financiera (Cash/Credit).
**Cambios:**
- **DB**: Migración `20260205000015_odoo_phase2_logic.sql`.
    - Añadida columna `raw_data` (JSONB) en todas las tablas clave (Customers, Products, Services, Clinics, Invoices).
    - Añadidos campos financieros (`payment_policy`, `payment_term_id/name`) en `odoo_customers` y `clinics`.
    - Actualizados RPCs `sync_clinic_from_odoo` y `sync_service_from_odoo` para manejar sincronización total y atomismo entre esquemas.
- **Front (Server Actions)**: 
    - Implementado `Universal Normalizer` para transformar valores falsos de Odoo (`false`, `null`) en valores seguros para el frontend (`""`, `0`).
    - Actualizada sincronización para usar `fields: []` (Full Sync) en Clientes, Productos, Facturas y Staff.
    - Implementada lógica de detección de política de pago (`cash` vs `credit`) basada en plazos de pago de Odoo.
    - Eliminadas redundancias de upsert en acciones del servidor (centralizado en RPCs).
**Verificación:**
- SQL aplicado con éxito.
- Acciones del servidor refactorizadas y limpias de lint errors (en gran parte).
**Riesgos:**
- El almacenamiento de `raw_data` masivo puede aumentar el tamaño de la base de datos a largo plazo; se recomienda monitorear el crecimiento de tablas JSONB.
- Se requiere validar la integración con la UI de despacho para aplicar el bloqueo basado en `payment_policy`.

---

## PR #12 — Staff Role Mapping & Sync Repair
**Fecha:** 2026-02-05
**Objetivo:** Solucionar bug de creación de staff ("Hang") y falta de sincronización de clínicas.
**Cambios:**
- **DB**: Migración `20260205000030_fix_staff_role_mapping.sql`.
    - Lógica de traducción de "Job Position" (UI) a "System Role" (DB).
- **Core Action**: `sync-repair.ts` (Server Action) para vincular clínicas huérfanas con Odoo partners.
- **Admin UI**: Botón "Reparar Vínculos Odoo" en Settings.
**Verificación:**
- Test manual de "Reparar Vínculos" exitoso.
- SQL de mapeo aplicado.
**Riesgos:**
- Si se agregan nuevos puestos en el futuro, requieren actualización del SQL Case.
