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
