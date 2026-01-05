# 📚 DOCUMENTACIÓN COMPLETA POR MÓDULOS - DentalFlow

> **Última Actualización**: 2026-01-05 17:47
> **Propósito**: Documentación exhaustiva de cada módulo, su función, archivos y lógica operativa

---

## 🔴 **BUG CRÍTICO IDENTIFICADO**

**Problema**: Las órdenes de laboratorio NO se guardan
**Causa**: El `order-wizard.tsx` cierra el modal inmediatamente sin esperar la respuesta de `createLabOrder`
**Ubicación**: `src/components/lab/wizard/order-wizard.tsx` líneas 103-107
**Solución**: Modificar `onSubmit` para que NO sea una función vacía, sino que reciba el resultado del `ReviewOrder`

---

## 📦 **MÓDULO 1: LAB ORDERS (Órdenes de Laboratorio)**

### Propósito
Gestionar el flujo completo de creación de órdenes de laboratorio desde el odontograma hasta el Kanban de producción.

### Archivos del Módulo

#### **1.1 Wizard Principal**
- **`src/components/lab/wizard/order-wizard.tsx`** (116 líneas)
  - **Función**: Contenedor del wizard de 3 pasos
  - **Estado**: Maneja `formData` con los datos de la orden
  - **Pasos**:
    1. MaterialSelection
    2. ItemsConfiguration  
    3. ReviewOrder
  - **🔴 BUG**: Línea 103-107 - `onSubmit` solo hace `console.log` y cierra

#### **1.2 Pasos del Wizard**
- **`src/components/lab/wizard/steps/material-selection.tsx`**
  - **Función**: Selección de material, tipo y configuración
  - **Datos que pasa**: `{ items: [...] }` con configuraciones seleccionadas

- **`src/components/lab/wizard/steps/items-configuration.tsx`**
  - **Función**: Configuración de items (dientes, colores, cantidades)
  - **Datos que pasa**: `{ items: [...], doctor_id, priority, target_delivery_date }`

- **`src/components/lab/wizard/steps/review-order.tsx`** (257 líneas)
  - **Función**: Revisión final + Logística + Confirmación
  - **Logística**: 3 opciones (pickup, courier, digital)
  - **Línea 56-87**: `handleConfirm` - **AQUÍ SÍ SE LLAMA** `createLabOrder`
  - **Línea 75**: `const res = await createLabOrder(orderPayload);`
  - **Línea 81**: `onSubmit()` - Cierra el modal DESPUÉS de éxito

#### **1.3 Server Action**
- **`src/actions/lab-orders.ts`** (151 líneas)
  - **Función**: `createLabOrder(orderData)`
  - **Validación**: Usa `labOrderFormSchema` (Zod)
  - **Autenticación**: Obtiene `clinic_id` desde `clinic_staff`
  - **RPC**: Llama a `create_lab_order_transaction_v2`
  - **Parámetros RPC**:
    ```typescript
    {
      p_clinic_id, p_patient_id, p_doctor_id,
      p_priority, p_target_date, p_notes,
      p_items: [{ configuration_id, tooth_number, color, unit_price, clinical_finding_id }],
      p_shipping_type, p_carrier_name, p_tracking_number,
      p_clinic_lat, p_clinic_lng
    }
    ```
  - **Fallback**: Si v2 no existe, usa `create_lab_order_transaction` (v1)

### Flujo Operativo Paso a Paso

```
1. Usuario abre Odontograma
   ↓
2. Hace clic en un diente
   ↓
3. Selecciona "Prótesis" como hallazgo
   ↓
4. Se abre OrderWizard (modal)
   ↓
5. PASO 1: MaterialSelection
   - Usuario selecciona material (ej: Zirconio)
   - Usuario selecciona tipo (ej: Corona)
   - Usuario selecciona configuración específica
   - Hace clic en "Siguiente"
   ↓
6. PASO 2: ItemsConfiguration
   - Usuario configura dientes (números)
   - Usuario selecciona colores
   - Usuario selecciona doctor
   - Usuario selecciona prioridad
   - Hace clic en "Siguiente"
   ↓
7. PASO 3: ReviewOrder
   - Usuario revisa resumen
   - Usuario selecciona método de envío (pickup/courier/digital)
   - Si pickup: captura ubicación GPS
   - Si courier: ingresa empresa y guía
   - Hace clic en "Confirmar Orden"
   ↓
8. handleConfirm() ejecuta:
   - Valida datos de logística
   - Construye orderPayload
   - Llama a createLabOrder(orderPayload)
   ↓
9. createLabOrder() ejecuta:
   - Valida con Zod
   - Obtiene clinic_id del usuario
   - Llama a RPC create_lab_order_transaction_v2
   - Retorna { orderId, error }
   ↓
10. 🔴 PROBLEMA ACTUAL:
    - ReviewOrder recibe respuesta
    - Muestra toast de éxito
    - Llama a onSubmit() del wizard
    - Wizard cierra modal SIN ESPERAR
    ↓
11. DEBERÍA:
    - Esperar respuesta completa
    - Verificar que orderId existe
    - LUEGO cerrar modal
```

### Dependencias
- **UI**: `@/components/ui/*` (shadcn/ui)
- **Validación**: `@/lib/validations/lab` (Zod schemas)
- **Notificaciones**: `sonner` (toast)
- **Animaciones**: `framer-motion`
- **Iconos**: `lucide-react`

---

## 📦 **MÓDULO 2: MEDICAL (Módulo Médico/Clínica)**

### Propósito
Gestionar pacientes, citas, odontograma, presupuestos y pagos desde la perspectiva de la clínica.

### Archivos del Módulo (28 archivos)

#### **2.1 Actions (Server)**
- **`actions/patients.ts`** - CRUD de pacientes
- **`actions/appointments.ts`** - Gestión de citas
- **`actions/clinical.ts`** - Hallazgos clínicos y odontograma
- **`actions/budgets.ts`** - Presupuestos
- **`actions/orders.ts`** - Órdenes (integración Odoo)
- **`actions/services.ts`** - Servicios médicos
- **`actions/clinics.ts`** - Gestión de clínicas
- **`actions/staff.ts`** - Personal de clínica
- **`actions/sync-services.ts`** - Sincronización con Odoo

#### **2.2 Components (UI)**
- **`components/odontogram.tsx`** - Componente principal del odontograma
  - **Función**: Visualización interactiva de dientes
  - **Interacción**: Click en diente → Abre modal de hallazgos
  - **Trigger**: Si hallazgo es "Prótesis" → Abre OrderWizard

- **`components/patient-dialog.tsx`** - Modal de creación/edición de paciente
- **`components/patient-table.tsx`** - Tabla de pacientes
- **`components/patient-sheet.tsx`** - Detalle de paciente (sidebar)
- **`components/order-modal.tsx`** - Modal de órdenes (legacy, reemplazado por wizard)

#### **2.3 Pages**
- **`pages/patient-detail.tsx`** - Página de detalle de paciente
  - **Tabs**: Información, Odontograma, Citas, Presupuestos, Pagos

### Flujo Operativo: Crear Paciente → Orden Lab

```
1. Dashboard Médico → Pacientes
   ↓
2. Click en "Nuevo Paciente"
   ↓
3. Completar formulario (nombre, DPI, teléfono, etc.)
   ↓
4. Guardar paciente
   ↓
5. Click en paciente de la lista
   ↓
6. Se abre PatientDetail
   ↓
7. Click en tab "Odontograma"
   ↓
8. Click en diente (ej: #11)
   ↓
9. Modal de hallazgos se abre
   ↓
10. Seleccionar "Prótesis"
    ↓
11. OrderWizard se abre (ver Módulo 1)
```

---

## 📦 **MÓDULO 3: LAB DASHBOARD (Dashboard de Laboratorio)**

### Propósito
Vista del laboratorio para gestionar producción, Kanban y estadísticas.

### Archivos Principales
- **`src/app/dashboard/lab/kamba/page.tsx`** - Kanban de producción
- **`src/app/dashboard/lab/page.tsx`** - Dashboard principal del lab
- **`src/modules/lab/actions/*`** - Actions del laboratorio

### Flujo Operativo: Ver Orden en Kanban

```
1. Orden creada desde clínica
   ↓
2. RPC create_lab_order_transaction_v2 inserta en:
   - schema_lab.lab_orders (estado inicial: 'clinic_pending')
   - schema_lab.lab_order_items
   ↓
3. Usuario lab navega a /dashboard/lab/kamba
   ↓
4. Página carga órdenes con RPC get_lab_kanban_orders
   ↓
5. Órdenes se muestran en columnas por estado:
   - clinic_pending (Pendiente Clínica)
   - income_validation (Validación Ingreso)
   - gypsum (Yesos)
   - design (Diseño CAD)
   - client_approval (Aprobación Cliente)
   - nesting (Optimización)
   - production_man (Producción Manual)
   - qa (Control Calidad)
   - billing (Facturación)
   - delivery (Entrega)
```

---

## 📦 **MÓDULO 4: AUTHENTICATION (Autenticación)**

### Propósito
Gestionar login, roles y permisos multi-tenant.

### Archivos Principales
- **`src/app/login/page.tsx`** - Página de login
- **`src/lib/supabase/client.ts`** - Cliente de Supabase
- **`src/lib/supabase/server.ts`** - Cliente server-side

### Roles Disponibles
- `super_admin` - Acceso total
- `clinic_admin` - Gestión de clínica
- `clinic_doctor` - Pacientes y órdenes
- `clinic_receptionist` - Citas y pagos
- `lab_staff` - Producción
- `courier` - Logística

### Flujo de Autenticación

```
1. Usuario ingresa email/password
   ↓
2. Supabase Auth valida credenciales
   ↓
3. Si válido, crea sesión
   ↓
4. Backend consulta clinic_staff para obtener:
   - clinic_id
   - role
   ↓
5. RLS filtra datos por clinic_id
   ↓
6. Usuario redirigido a dashboard según rol
```

---

## 📦 **MÓDULO 5: DATABASE (Base de Datos)**

### Esquemas

#### **5.1 public**
- `lab_materials` - Materiales (Zirconio, PMMA, etc.)
- `lab_material_types` - Tipos (Corona, Puente, etc.)
- `lab_configurations` - **FUENTE DE VERDAD** para catálogo

#### **5.2 schema_lab**
- `lab_orders` - Órdenes de laboratorio
- `lab_order_items` - Items de órdenes
  - **FK**: `configuration_id` → `public.lab_configurations`

#### **5.3 schema_medical**
- `patients` - Pacientes
- `appointments` - Citas
- `clinical_findings` - Hallazgos del odontograma
- `budgets` - Presupuestos
- `payments` - Pagos
- `clinics` - Clínicas
- `clinic_staff` - Personal
- `clinic_service_prices` - Precios por clínica

### RPCs Críticos
- `create_lab_order_transaction_v2` - Crear orden con logística
- `get_lab_kanban_orders` - Obtener órdenes para Kanban
- `create_appointment_rpc` - Crear cita
- `get_doctors_rpc` - Obtener doctores de clínica

---

## 🔧 **CORRECCIÓN DEL BUG CRÍTICO**

### Problema Identificado
El `order-wizard.tsx` define `onSubmit` como una función vacía que solo cierra el modal:

```typescript
// LÍNEA 103-107 (INCORRECTO)
onSubmit={async () => {
    console.log('Submitting', formData);
    onClose();
}}
```

### Solución
El `ReviewOrder` ya llama correctamente a `createLabOrder`, pero el wizard no espera la respuesta. Necesitamos:

1. **Eliminar** el `onSubmit` del wizard
2. **Modificar** `ReviewOrder` para que cierre el modal directamente
3. **O** pasar una función que espere el resultado

### Archivos a Modificar
1. `src/components/lab/wizard/order-wizard.tsx` - Líneas 103-107
2. `src/components/lab/wizard/steps/review-order.tsx` - Línea 81

---

## 📊 **ESTADÍSTICAS DEL PROYECTO**

- **Total Módulos**: 5 principales
- **Total Archivos TypeScript**: ~60
- **Total Migraciones SQL**: 151 activas + 35 archivadas
- **Total RPCs**: ~30
- **Total Tablas**: ~50

---

**Fin de Documentación**
