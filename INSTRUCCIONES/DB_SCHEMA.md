# Esquema Maestro de Base de Datos - DentalFlow

**Última Actualización:** 2026-02-01 (Validado contra Migraciones)
**Estado:** VERIFICADO

Este documento es la **FUENTE DE LA VERDAD**. Cualquier desviación en código o SQL es un error.

---

## 🏗️ Estructura de Schemas

### 1. `schema_core` (Gobierno y Auth)
Infraestructura global, configuración y usuarios.

*   **`users`**
    *   **PK:** `id` (UUID, FK -> `auth.users`)
    *   **Campos:** `email`, `role`, `status`, `name`
    *   **Roles:** `super_admin`, `clinic_admin`, `doctor`, `lab_admin`, `lab_staff`
*   **`modules`**: Feature flags globales.
*   **`odoo_config`**: Credenciales API Odoo.
*   **`odoo_sync_log`**: Historial de sincronizaciones.

### 2. `schema_medical` (Negocio Clínica)
Todo lo relacionado con la operación de una clínica dental.

*   **`clinics`** (**¡OJO! Está en MEDICAL, no en CORE**)
    *   **PK:** `id` (UUID)
    *   **Campos:** `name`, `email`, `nit`, `is_active`, `pd_odoo_id`
*   **`clinic_staff`**
    *   **PK:** `id` (UUID)
    *   **FKs:** `clinic_id`, `user_id`
    *   **Roles:** `clinic_admin`, `clinic_doctor`, `clinic_staff`, `clinic_receptionist`
*   **`patients`**
    *   **PK:** `id` (UUID)
    *   **FK:** `clinic_id`
    *   **Datos:** `first_name`, `last_name`, `patient_code`, `medical_conditions`, `odoo_partner_id`
*   **`appointments`**
    *   **PK:** `id` (UUID)
    *   **FKs:** `clinic_id`, `patient_id`, `doctor_id`
    *   **Datos:** `start_time`, `end_time`, `status`, `appointment_type`
*   **`clinic_service_prices`**
    *   **PK:** `id` (UUID)
    *   **FKs:** `clinic_id`, `service_id` (Schema Lab)
    *   **Datos:** `cost_price` (Odoo), `sale_price` (Clínica), `margin`
*   **`clinical_findings`** (Odontograma)
    *   **PK:** `id` (UUID)
    *   **FKs:** `patient_id`, `tooth_number`
*   **`evolution_notes`** (Historial)
*   **`finding_types_config`** (Config Odontograma)

### 3. `schema_lab` (Negocio Laboratorio)
La "Fábrica" de prótesis y dispositivos.

*   **`services`** (Catálogo)
    *   **PK:** `id` (UUID)
    *   **Datos:** `odoo_id`, `code`, `name`, `base_price`
*   **`orders`** (Kanban)
    *   **PK:** `id` (UUID)
    *   **FKs:** `clinic_id`
    *   **Datos:** `status` (new -> delivered), `odoo_sale_order_id`
*   **`order_items`**
    *   **PK:** `id` (UUID)
    *   **FKs:** `order_id`, `service_id`

---

## 🚨 Errores Comunes de Arquitectura (LEER)

1.  **Ubicación de `clinics`:**
    *   ❌ ERROR: `schema_core.clinics`
    *   ✅ CORRECTO: `schema_medical.clinics`

2.  **Ubicación de `clinic_staff`:**
    *   ❌ ERROR: `schema_core.clinic_staff`
    *   ❌ ERROR: `clinic_members` (Nombre antiguo)
    *   ✅ CORRECTO: `schema_medical.clinic_staff`

3.  **RLS es Obligatorio:**
    *   Nunca crear tablas en `schema_medical` sin columna `clinic_id` y Policies RLS habilitadas.

4.  **Integridad Referencial:**
    *   Borrar una `clinic` debe hacer CASCADE a `staff`, `patients`, `appointments`, etc.

---

## 🌐 Evolución Arquitectura V5 (Capa Public)

Desde febrero 2026, el sistema utiliza el esquema `public` como una "Capa de Presentación":

*   **`public.users`**: Vista unificada de perfiles y roles. Usar esta siempre en lugar de `profiles`.
*   **`public.orders`**: Tabla principal para el Kanban de laboratorio. 
    *   *Mapeo Crítico:* `due_date` (antiguamente `delivery_date`), `patient_id` (tipo `TEXT`).
*   **`public.app_config`**: Almacén de configuraciones globales (ej: Welcome Message "Ocean").

