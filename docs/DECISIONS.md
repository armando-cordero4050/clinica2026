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
