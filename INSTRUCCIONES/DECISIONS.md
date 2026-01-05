# DECISIONS (ADR ligero) — DentalFlow / dentalapp

Este documento registra decisiones arquitectónicas y de negocio **no negociables**.
Regla: si una decisión cambia, se agrega un nuevo ADR que la reemplace, nunca se borra historial.

---

## ADR-0001 — Arquitectura Cloud-First y modular
**Estado:** Aprobado  
**Fecha:** 2025-12-24  
**Decisión:** La app es Cloud-First (Supabase Cloud) y modular. Cada módulo debe poder fallar sin romper el resto.  
**Motivo:**
- Internet variable requiere tolerancia y reintentos.
- Modularidad reduce retrabajos y regresiones.
**Alternativas consideradas:**
- Local-first con Docker + self-host (descartado por complejidad inicial).
**Impacto:**
- Separación por módulos en `src/modules/*`.
- Integraciones (Odoo) aisladas en capa `src/shared/integrations/*`.

---

## ADR-0002 — Multi-tenant estricto por clínica
**Estado:** Aprobado  
**Fecha:** 2025-12-24  
**Decisión:** Toda tabla de negocio tiene `clinic_id` y RLS siempre filtra por clínica.  
**Motivo:**
- Aislamiento absoluto entre clínicas.
**Impacto:**
- RLS en Supabase obligatorio.
- Ningún query sin contexto de clínica.

---

## ADR-0003 — Zero-Trust: DB decide, UI solo representa
**Estado:** Aprobado  
**Fecha:** 2025-12-24  
**Decisión:** El frontend NO decide precios, permisos ni estados finales. Todo se valida en DB (RLS + RPC).  
**Motivo:**
- Seguridad y consistencia.
**Impacto:**
- Funciones RPC para operaciones críticas.
- Triggers para cálculos financieros.

---

## ADR-0004 — Modelo financiero: Clínica↔Paciente es interno (sin Odoo)
**Estado:** Aprobado  
**Fecha:** 2025-12-24  
**Decisión:** Presupuestos/facturas al paciente se manejan dentro de DentalFlow como “ficticias” (por ahora).  
**Motivo:**
- FEL futuro, hoy no depende de Odoo.

---

## Decision 11: Evolución Arquitectura V5 - Interfaz vía Esquema Public
**Fecha:** 2026-02-05
**Contexto:** Los módulos (Medical, Lab) tienen esquemas internos, pero el frontend y algunas integraciones requieren una visión unificada y simplificada.
**Decisión:** 
- Las tablas en el esquema `public` (ej: `users`, `orders`, `patients`) actúan como la interfaz de datos primaria para el frontend.
- Se prefiere el uso de `public.users` sobre `public.profiles` para la gestión de identidad y roles.
- Se introduce `public.app_config` como almacén centralizado para configuraciones globales (ej: Welcome Toast) accesibles vía RPC.
**Racional:** Simplifica las queries de React, facilita la auditoría de RLS centralizada y desacopla la lógica interna de los módulos de la visualización.

---

## Decision 12: Resolución de Conflictos en PL/pgSQL
**Fecha:** 2026-02-05
**Contexto:** Errores recurrentes de ambigüedad en nombres de columnas (`id`).
**Decisión:** 
- Todas las funciones RPC que devuelvan tablas deben incluir obligatoriamente la directiva `#variable_conflict use_column`.
- Es obligatorio el uso de aliases de tabla en todas las cláusulas `SELECT` y `JOIN`.
**Racional:** Evita fallos críticos en producción al añadir nuevas columnas o variables con nombres comunes.

**Impacto:**
- Módulo financiero interno (budgets, payments, invoices_internal).

---

## ADR-0005 — Odoo se usa SOLO para Laboratorio (Proveedor↔Clínica)
**Estado:** Aprobado  
**Fecha:** 2025-12-24  
**Decisión:** Odoo gestiona ventas/facturas del laboratorio hacia clínicas.  
**Motivo:**
- El laboratorio es proveedor real, clínica paga al lab por orden.
**Impacto:**
- Edge Function: crea partner si no existe, crea sale.order, genera invoice.
- La orden lab en DentalFlow se vincula con `odoo_sale_order_id` y `odoo_invoice_id`.

---

## ADR-0006 — Privacidad: Lab nunca ve datos personales del paciente
**Estado:** Aprobado  
**Fecha:** 2025-12-24  
**Decisión:** El laboratorio solo ve: edad, género, diagnóstico, solicitud, odontograma (PDF o link vista), nombre doctor y clínica.  
**Motivo:**
- Minimización de datos (privacy by design).
**Impacto:**
- Vista/DTO “lab_safe_payload”.
- RLS + API: bloquear campos sensibles.

---

## ADR-0007 — Moneda mixta (USD/GTQ) por paciente y por orden
**Estado:** Aprobado  
**Fecha:** 2025-12-24  
**Decisión:** Paciente puede tener moneda base; presupuesto puede cambiar moneda si es necesario. En Odoo, la orden lab usa moneda definida por lab/cliente (clínica).  
**Motivo:**
- Operación real en Guatemala con USD/GTQ.
**Impacto:**
- Campos `currency_code` en entidades clave.
- Tasa de cambio configurable/registrada (fase posterior si aplica).

---

## ADR-0008 — IVA por clínica (12% por defecto)
**Estado:** Aprobado  
**Fecha:** 2025-12-24  
**Decisión:** IVA inicia en 12% pero es configurable por clínica desde módulo Configuración.  
**Impacto:**
- `clinic_settings.tax_percent` editable con permisos.

---

## ADR-0009 — Reboot de Base de Datos (V4 Zero-Based)
**Estado:** Aprobado
**Fecha:** 2025-12-28
**Decisión:** Reiniciar el esquema de base de datos (`20251229000000_init_v4_schema.sql`) descartando migraciones previas conflictivas.
**Motivo:**
- La lógica V3 tenía dependencias circulares y falta de RLS estricto en el origen.
- V4 alinea `lab_orders`, `patients` y `clinics` con la "Guía Maestra V4".
**Impacto:**
- Se requiere un `db reset` en el entorno de desarrollo/staging.
- Tablas Core: `clinics`, `profiles`, `patients`, `lab_orders` (con `clinic_id` obligatorio).

---

## ADR-0010 — Estructura Híbrida Clínica (Agenda SQL / Presupuestos JSON)
**Estado:** Aprobado
**Fecha:** 2025-12-31
**Decisión:** Utilizar enfoque híbrido para la nueva estructura clínica.
- **Agenda (Appointments):** Modelo Relacional (SQL) para consultas eficientes de rangos de fecha e índices.
- **Presupuestos (Budgets):** Modelo Documental (JSONB) para los items/líneas de detalle.
**Motivo:**
- La agenda requiere queries complejos de tiempo y disponibilidad (SQL es mejor).
- Los presupuestos dentales tienen estructura variable, versiones y descuentos por línea que cambian mucho (JSONB es más flexible que tabla detalle rígida).
**Impacto:**
- Indexación JSONB requerida si se quiere buscar por tratamiento en el futuro.

---

## Decision 13: Mapeo Explícito de Roles Odoo/UI vs DB
**Fecha:** 2026-02-05
**Contexto:** La interfaz UI y Odoo usan descripciones de puesto en lenguaje natural ("Administrador de Clínica", "Odontólogo"), pero la DB requiere roles técnicos ENUM (`clinic_admin`, `doctor`) para RLS y Auth.
**Decisión:** 
- Implementar la lógica de traducción (mapping) dentro de las funciones RPC (`sync_staff_member_from_odoo`).
- No confiar en que el frontend envíe el rol técnico.
**Mapeo Oficial:**
- "Administrador de Clínica" / "Gerente" -> `clinic_admin`
- "Odontólogo" -> `doctor`
- "Asistente Dental" -> `assistant`
- "Recepcionista" -> `receptionist`
- Default -> `clinic_staff`
**Racional:** Centraliza la lógica de negocio en la DB, haciendo el sistema robusto ante cambios en el frontend o imports masivos desde Odoo.
**Impacto:**
- RPC `sync_staff_member_from_odoo` es la fuente de la verdad para asignación de permisos iniciales.

---

## Decision 14: Estrategia de Fetching para Modal de Citas

**Fecha:** 2026-01-03  
**Contexto:** El modal de creación de citas necesita mostrar:
1. Lista de doctores filtrada por clínica actual
2. Lista de servicios sincronizados con Odoo y con precios configurados

**Decisión:**

### Doctores
- **Enfoque:** RPC `get_doctors_rpc()` que hace JOIN entre `clinic_staff` y `schema_core.users`
- **Retorna:** `(id, email, name, role)`
- **Filtrado:** Por `clinic_id` del usuario actual (vía `auth.uid()`)
- **Roles incluidos:** `'doctor'`, `'admin'`, `'clinic_doctor'`

### Servicios
- **Enfoque:** Query directa a `clinic_service_prices` con JOIN a `services`
- **Filtrado:** 
  - Por `clinic_id` (implícito vía RLS)
  - Por `is_active = true`
  - Por nombre del servicio (client-side filtering)
- **Limitación:** Supabase JS client no soporta fácilmente `.ilike()` en tablas relacionadas
- **Workaround:** Fetch todos los servicios activos de la clínica, filtrar por nombre en cliente

**Racional:**
- **Doctores:** RPC encapsula lógica de JOIN compleja y asegura consistencia
- **Servicios:** Query directa es más simple para caso de uso actual; RPC se considerará si el catálogo crece significativamente (>100 items)

**Trade-offs:**
- **Doctores:** Requiere migración manual para actualizar RPC
- **Servicios:** Overhead de red al traer datos no filtrados; aceptable para catálogos pequeños

**Impacto:**
- Frontend más simple, lógica de negocio en backend
- Mejor separación de concerns
- Facilita testing y mantenimiento

---

## Decision 15: Arquitectura de Precios en Servicios (PENDIENTE DE RESOLUCIÓN)

**Fecha:** 2026-01-03  
**Contexto:** Desajuste crítico entre Odoo sync, esquema DB y expectativas UI:
- **Odoo:** Envía `list_price` (precio de venta)
- **Sync Logic:** Pasa `p_price` a RPC `sync_service_from_odoo`
- **DB Schema:** Tiene columnas `cost_price_gtq`/`cost_price_usd` (precio de costo)
- **UI:** Espera campo `base_price` (no existe en DB)

**Problema:**
1. No hay columna para almacenar precio de venta en tabla `services`
2. UI muestra `Q 0` porque `base_price` es undefined
3. Datos de Odoo (Q 600) no se están guardando correctamente

**Opciones Evaluadas:**

### Opción A: Agregar columnas de precio de venta (RECOMENDADA)
- Agregar `sale_price_gtq` y `sale_price_usd` a tabla `services`
- Actualizar RPC `sync_service_from_odoo` para guardar `p_price` en `sale_price_gtq`
- Actualizar UI para usar `svc.sale_price_gtq`
- **Pros:** Semántica clara, separa costo de venta
- **Contras:** Requiere migración de esquema

### Opción B: Usar cost_price_gtq para precio de venta
- Actualizar RPC para guardar `p_price` en `cost_price_gtq`
- Actualizar UI para usar `svc.cost_price_gtq`
- **Pros:** No requiere cambio de esquema
- **Contras:** Semántica confusa (costo ≠ venta), dificulta lógica de márgenes futura

### Opción C: Crear vista computada
- Crear vista DB que mapea columna correcta a `base_price`
- **Pros:** No cambia esquema físico
- **Contras:** Capa adicional de abstracción, complejidad innecesaria

**Decisión:** **RESUELTO** - Implementada Opción A (Migración Completa)

**Implementación (2026-01-04):**
1. ✅ Agregadas columnas `sale_price_gtq`, `sale_price_usd` a `schema_lab.services`
2. ✅ Migrados datos de `base_price` → `sale_price_gtq`
3. ✅ Actualizado RPC `sync_service_from_odoo` para guardar en `sale_price_gtq`
4. ✅ Marcado `base_price` como DEPRECATED (mantener por compatibilidad)
5. ✅ Agregado soporte para `standard_price` (costo) desde Odoo

**Impacto:**
- **Crítico:** Resuelve cotizaciones, facturas y lógica financiera
- **Beneficio:** Separación clara entre precio de venta y costo
- **Compatibilidad:** Código legacy sigue funcionando con `base_price`

---

## ADR-0014 — Unified Services View Across Modules
**Estado:** Aprobado  
**Fecha:** 2026-01-04  
**Decisión:** Todos los módulos (Core, Lab, Clínica) usan la misma vista `public.services` como fuente de datos.

**Contexto:**
- Módulos Core/Lab usaban `public.services`
- Módulo Clínica usaba `clinic_service_prices`
- Diferentes fuentes = diferentes campos visibles = inconsistencias

**Decisión:**
- Vista `public.services` es la única fuente de verdad
- Incluye: `sale_price_gtq`, `sale_price_usd`, `cost_price_gtq`, `cost_price_usd`, `odoo_id`, `last_synced`
- Todos los módulos usan `getLabServices()` RPC

**Alternativas Consideradas:**
1. Mantener fuentes separadas (descartado - duplicación)
2. Crear vista específica por módulo (descartado - complejidad)

**Impacto:**
- ✅ Single source of truth
- ✅ Cambios se propagan automáticamente
- ✅ Menos bugs por inconsistencias
- ✅ Mantenimiento simplificado

**Archivos Afectados:**
- `src/app/dashboard/medical/services/page.tsx`
- `src/app/dashboard/medical/services/services-table.tsx`
- `src/modules/medical/actions/services.ts`

---

## ADR-0015 — Odoo Sync with Cost Price
**Estado:** Aprobado  
**Fecha:** 2026-01-04  
**Decisión:** Sincronización desde Odoo incluye tanto precio de venta (`list_price`) como costo (`standard_price`).

**Contexto:**
- Sync original solo traía `list_price`
- Sin costo = sin cálculo de márgenes
- Sin análisis de rentabilidad

**Decisión:**
- RPC `sync_service_from_odoo` acepta `p_list_price` y `p_standard_price`
- Guarda en `sale_price_gtq` y `cost_price_gtq` respectivamente
- TypeScript actualizado para pasar ambos valores

**Beneficios:**
- ✅ Cálculo automático de márgenes
- ✅ Análisis de rentabilidad por servicio
- ✅ Decisiones de pricing informadas
- ✅ Reportes financieros completos

**Impacto Técnico:**
- Migración: `20260205000039_update_sync_service_from_odoo.sql`
- Código: `src/modules/odoo/actions/sync-products.ts`
- Interfaz: `OdooProduct` incluye `standard_price`

---

## ADR-0016 — PostgreSQL Function Signature Management
**Estado:** Aprobado  
**Fecha:** 2026-01-04  
**Decisión:** Al cambiar signature de funciones PostgreSQL, siempre usar `DROP FUNCTION` explícito antes de `CREATE`.

**Contexto:**
- `CREATE OR REPLACE` no funciona con cambios de signature
- PostgreSQL cachea definiciones de funciones
- Causó bug QNaN por función no actualizada

**Decisión:**
```sql
-- CORRECTO
DROP FUNCTION IF EXISTS public.func_name(old_params);
CREATE FUNCTION public.func_name(new_params) ...

-- INCORRECTO
CREATE OR REPLACE FUNCTION public.func_name(new_params) ...
```

**Lecciones Aprendidas:**
- PostgreSQL no permite overloading implícito
- Debe especificarse lista exacta de parámetros en DROP
- Cache puede persistir entre deploys

**Impacto:**
- Todas las migraciones de funciones deben seguir este patrón
- Documentar en guía de desarrollo
- Agregar a checklist de PR


---

## Decision 17: Soporte de Super Admin en Creación de Citas
**Fecha:** 2026-02-05
**Contexto:** Los usuarios `super_admin` no tienen registro en `clinic_staff`, por lo que el RPC `create_appointment_rpc` fallaba al intentar inferir el `clinic_id`.
**Decisión:** 
- Modificar `create_appointment_rpc` para aceptar un parámetro opcional `p_clinic_id`.
- Si se proporciona `p_clinic_id`, se usa prioritariamente.
- Si no se proporciona, se mantiene la lógica de inferencia desde `clinic_staff`.
- En el frontend (`actions.ts`), si el usuario es `super_admin`, se infiere la clínica desde el doctor seleccionado o se usa la primera disponible como fallback.
**Racional:** Permite a los administradores globales gestionar citas sin necesidad de estar "contratados" en cada clínica, manteniendo la integridad referencial.
**Impacto:**
- Requiere ejecutar migración SQL manual.
- RPC actualizado con nuevo parámetro.


---

## Decision 18: Vinculación Odontograma - Laboratorio
**Fecha:** 2026-02-05
**Contexto:** Se implementó el flujo de crear órdenes de laboratorio desde el odontograma.
**Problema:** No existía vínculo BD entre hallazgo clínico y orden.
**Decisión:** Agregar `lab_order_id` a `schema_medical.dental_chart`.
**Impacto:** Permite visualización de estado en el odontograma y evita duplicados.


---

## Decision 19: Transaccionalidad en Creación de Órdenes (RPC)
**Fecha:** 2026-02-05
**Contexto:** La creación de una orden de laboratorio implica 3 operaciones de escritura dependientes: 
1. `INSERT` en `lab_orders` (Schema Lab)
2. `INSERT` en `lab_order_items` (Schema Lab)
3. `UPDATE` en `dental_chart` (Schema Medical, para vincular hallazgo)
**Problema:** Hacer esto en el cliente (3 requests) es propenso a inconsistencias si uno falla, y complica las políticas RLS cruzadas.
**Decisión:** Crear una función RPC `create_lab_order_transaction` con `SECURITY DEFINER`.
**Racional:** 
- Garantiza **atomicidad** database-level (todo o nada).
- Simplifica la gestión de permisos: el usuario solo necesita permiso para ejecutar el RPC.
- Reduce latencia (1 round-trip).
**Impacto:** 
- `createLabOrder` (Server Action) ahora delega toda la escritura a este RPC.


---

## Decision 20: Cálculo de Fechas de Entrega (SLA)
**Fecha:** 2026-02-05
**Contexto:** Los doctores necesitan saber cuándo estará lista una orden, pero calcularlo exactamente es complejo (feriados, carga de trabajo).
**Decisión:** 
- Implementar un cálculo **estimado** basado en `sla_days` estático por configuración.
- Lógica "Soft": Se permite al usuario sobrescribir la fecha.
- Regla de fin de semana: Si cae fin de semana, mover al lunes.
**Racional:** 
- Es mejor dar una fecha aproximada inmediata que bloquear el sistema esperando una planificación de capacidad real (que requiere módulo de producción complejo).
- La flexibilidad manual maneja excepciones sin código extra.
**Impacto:**
- Nueva columna `sla_days` en DB.

---

## ADR-0021  M�dulo CRUD de Cat�logo de Materiales (Lab)
**Estado:** Aprobado
**Fecha:** 2026-01-04
**Decisi�n:** Crear un m�dulo administrativo (CRUD) en Core/Admin para gestionar el cat�logo de materiales de laboratorio.

