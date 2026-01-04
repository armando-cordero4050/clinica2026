# GUÍA MAESTRA DE ARQUITECTURA DENTALFLOW 2026
**"La Fuente de la Verdad Definitiva"**

**Versión:** 1.0.0 (Final Architecture)
**Fecha:** 01/01/2026

---

## 1. STACK TECNOLÓGICO

El proyecto DEBE seguir estrictamente estas tecnologías:

*   **Frontend Reference:** Next.js 14 (App Router).
*   **Lenguaje:** TypeScript 5.x.
*   **Estilos:** TailwindCSS + Shadcn/UI.
*   **Iconos:** Lucide React.
*   **Data Fetching:** React Server Actions (No usar API Routes /pages/api).
*   **Base de Datos:** PostgreSQL (Supabase) + RPC Functions.
*   **Integración ERP:** Odoo XML-RPC.

---

## 2. MAPA DE MÓDULOS (Estructura de Carpetas)

La aplicación se divide en MÓDULOS AISLADOS dentro de `/src/modules`:

1.  **`/core`**: Configuración global, Usuarios, Auth.
2.  **`/medical`**: Lógica de Clínica (Pacientes, Citas).
3.  **`/lab`**: Lógica de Laboratorio (Órdenes, Producción).
4.  **`/logistics`**: Lógica de Envíos.
5.  **`/warehouse`**: Lógica de Bodega (Inventario).
6.  **`/odoo`**: Adaptador de Integración (Solo conexión).

---

## 3. DETALLE POR MÓDULO

### 3.1. Core (Admin)

Responsable de la configuración global y tenants (clínicas).

*   **Tablas:** `schema_core.clinics`, `schema_core.users`, `schema_core.odoo_config`.
*   **Acciones:** `syncMasterData()` (Sincroniza Odoo -> DentalFlow).
*   **Nota:** La configuración de Odoo se lee primero de la Base de Datos, y si falla, del archivo `.env`.

### 3.2. Laboratorio (Lab)

Responsable de la producción (La Fábrica).

*   **Tabla Maestra:** `schema_lab.services` (Catálogo sincronizado de Odoo).
*   **Tabla Operativa:** `schema_lab.orders` (Las órdenes de trabajo).
*   **Workflow:** Las órdenes siguen un flujo de 11 estados (Kambra), desde `clinic_pending` hasta `delivery`.

### 3.3. Médico (Clínica)

Responsable de la atención al paciente.

*   **Tablas:** `schema_medical.patients`, `schema_medical.appointments`.
*   **Precios:** Usa la tabla `schema_medical.clinic_service_prices`.
    *   La clínica **NO PUEDE** cambiar el nombre del servicio (viene del Lab).
    *   La clínica **SÍ PUEDE** cambiar el precio de venta al paciente.

### 3.4. Logística

Gestiona el movimiento físico de las órdenes.

*   Usa la tabla `schema_lab.orders` filtrando por estado (`clinic_pending` para recolección, `delivery` para entrega).
*   Maneja campos como `courier_name` y `tracking_number`.

### 3.5. Bodega (Warehouse)

Espejo del Inventario de Odoo.

1.  **Sincronización:** Leemos stock disponible desde Odoo.
2.  **Consumo:** Los técnicos solicitan insumos (Notas de Entrega).
3.  **Trazabilidad:** En cada orden de Lab, se puede indicar (opcionalmente) qué "Nota de Entrega" proveyó el material usado (ej: Disco de Zirconio).

### 3.6. Aplicación Móvil (App)

Extensión del sistema para operarios en campo y doctores.

*   **Tecnología:** PWA (Progressive Web App) o React Native (TBD).
*   **Perfiles y Funcionalidad:**
    1.  **Logística (Mensajeros):**
        *   Ruta de recolección y entrega optimizada.
        *   Escaneo de QR para check-in/checkout.
        *   Prueba de entrega digital (Foto/Firma).
    2.  **Doctores (Clínica):**
        *   Subida de fotos de paciente directo a la orden.
        *   Aprobación rápida de diseños (Visor 3D simplificado).
        *   Notificaciones Push (Cita confirmada, Trabajo listo).
    3.  **Laboratorio (Técnicos/Jefes):**
        *   **Control de Piso:** Escaneo de QR para mover órdenes entre estaciones (ej: Diseño -> Fresado).
        *   Consulta rápida de detalles sin ir al PC.
    4. **Core (Admin/Gerencia):**
        *   Dashboard de bolsillo (Ventas del día, Alertas).
        *   Autorizaciones de emergencia.

---

## 4. FLUJO DE DATOS (Data Flow)

**Ejemplo: Sincronización de Precios**

1.  **Odoo (ERP):** El contador actualiza el costo de una Corona de Zirconio ($50).
2.  **Modulo Core:** El Admin sincroniza productos (`schema_lab.services` recibe el costo $50).
3.  **Modulo Medical:** La Clínica sincroniza su lista.
    *   Ve que el costo subió a $50.
    *   Su precio de venta ($150) se MANTIENE fijo (no cambia automático).
    *   El sistema recalcula el margen de ganancia reducido.

---

## 5. UI KIT DENTALFLOW (Sistema de Diseño)

**Filosofía:** "Clean, Clinical, & High Contrast".

### Colores Principales

*   **Primary (Brand):** Azul `Blue-600` (#2563EB). Botones principales.
*   **Secondary:** Slate Obscuro `Slate-900` (#0F172A). Navegación.
*   **Success:** Verde `Green-600`.
*   **Error:** Rojo `Red-600`.
*   **Warning/Debug:** Naranja `Orange-500`.

### Tipografía

*   Fuente: **Inter** (Sans-serif).
*   Tamaño Base: 14px.
*   Títulos:
    *   **H1:** 24px Bold.
    *   **H2:** 20px Semibold.

### Componentes Estándar

Usar siempre componentes de `@/components/ui/*`:

*   **Card:** Contenedor principal de contenido.
*   **Button:** Variantes `default`, `outline`, `ghost`.
*   **Badge:** Para estados (ej: "En Proceso").
*   **Toast:** Para notificaciones (Librería `sonner`).
*   **Icons:** Librería `lucide-react`.

---

## 6. FLUJO DE TRABAJO DENTALFLOW (Paso a Paso)

Este es el proceso lógico desde que un producto existe en Odoo hasta que la orden se entrega en la clínica.

### 🏁 Fase 1: Configuración Masiva (Admin)
1. **Sincronización Odoo:** El Admin presiona "Sincronizar Todo".
   - Trae **Clientes** (Clínicas) y **Productos** (Servicios) con el 100% de sus campos.
   - Normaliza datos (convierte nulos/false en `0`).
2. **Definición de Precios:** La Clínica entra a su panel y asigna su precio de venta al paciente para cada servicio sincronizado.
3. **Términos de Pago:** El sistema detecta si la clínica es `Cash` o `Credit` basado en Odoo.

### 🛠️ Fase 2: Operación Médica (Clínica)
4. **Ingreso de Paciente:** El doctor registra al paciente.
5. **Creación de Orden:** El doctor crea una orden de laboratorio seleccionando un servicio (ej: Corona Zirconio).
6. **Envío al Lab:** La orden viaja al esquema de laboratorio (`schema_lab.orders`) y aparece en el **KAMBA**.

### 🏗️ Fase 3: Producción (Laboratorio)
7. **Recepción:** El lab recibe los modelos/archivos digitales.
8. **Producción (KAMBA):** La orden fluye por las etapas (Diseño -> Fresado -> Acabado).
9. **Control de Calidad:** Se marca como lista para despacho.

### 🚚 Fase 4: Despacho y Finanzas (Cierre)
10. **Validación de Pago:**
    - Si es **Crédito**: Se libera automáticamente para envío.
    - Si es **Contado**: Se bloquea hasta que la clínica registre el pago.
11. **Facturación Odoo:** El sistema genera la factura en Odoo automáticamente.
12. **Entrega:** El mensajero (Logística) entrega la orden y marca el fin del ciclo.

---
**FIN DE LA GUÍA**

