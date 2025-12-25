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
**Fecha:** YYYY-MM-DD  
**Objetivo:**  
**Cambios:**  
**Decisiones tomadas (si aplica):**  
**Verificación:**  
- Build:
- Lint:
- Tests:
**Riesgos / pendientes:**  
**Notas:**
