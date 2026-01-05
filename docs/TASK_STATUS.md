
# DentalFlow - Control de Tareas

## 🛠️ 1. Mantenimiento & Fixes

| Estado | Tarea | Prioridad | Nota |
| :---: | :--- | :--- | :--- |
| ✅ | Fix: Impacto selección de Doctor | **Alta** | Corregido |
| ✅ | Fix: Creación Citas (Super Admin) | **Media** | Aplicado Manualmente |

## 🔬 2. Módulo de Órdenes de Laboratorio (Fase 1)

**Objetivo:** Implementar flujo de Solicitud Clínica -> Orden de Laboratorio.

### 🗄️ A. Estructura de Datos (Backend)

* ✅ **Schema Definition**
  * Creadas tablas `lab_orders` y `lab_order_items`.
  * Configurado RLS (Políticas de Seguridad).

* ✅ **Seed Data**
  * Migración de materiales (Zirconio, etc.).

* ⏳ **Lógica de Negocio**
  * ✅ Fetch de catálogos anidados.
  * ✅ Create Order + Items.
  * ✅ Cálculo automático de fecha de entrega.

### 🖥️ B. Interfaz de Usuario (Frontend)

* ✅ **Wizard de Órdenes**
  * Pasos 1 a 3 completados.

* ✅ **Shade Map Component**
  * Mapa de color dental interactivo (SVG Zonificado).

* ✅ **Smart Date Picker**
  * Implementación nativa.

### 🔌 C. Integración

* ✅ **Odontograma Trigger**
  * "Prótesis" abre Wizard.

* ✅ **Order Summary & Submit**
  * Review Screen.
  * RPC Transaction (Atomic).
  * Link to Dental Chart.

## 🚀 3. Verificación & Despliegue

* ✅ **End-to-End Test Script**
  * `scripts/verify_lab_permissions.ts`

  * ✅ Ejecución SQL (Aplicado fix XX000 en PR #16).
  * ✅ Validación Visual y de Color (Frontend).

* ✅ **Fix: Build Error (Popover)**
  * Instalado componente faltante.

* ✅ **Fix: Dashboard Menu Integrity**
  * Restaurados 9 módulos faltantes en menú Clínica.

## ⚡ 4. Fase 2.5: Wizard Avanzado & Módulo Catálogo (TASKv3)

**Objetivo:** Crear herramienta administrativa para gestión de materiales y refinar Wizard con SLA estricto.

* ✅ **Módulo Admin: Catálogo de Materiales (CRUD)**
  * [x] **Backend**: Crear tablas `lab_materials` y `lab_configurations` con soporte de precios y variantes.
  * [x] **Frontend**: Crear vista `Configuración Lab > Materiales` en Core/Admin.
  * [x] **Funcionalidad**: Tabla editable para agregar Nombres, Variantes, Precios Base y SLA.
  * [x] **Odoo**: Campo opcional `odoo_product_id` para mapeo futuro.
  * [x] **Menú**: Agregado al sidebar en sección "Configuración Lab".
  * [x] **Correcciones**: React key warning, routing, Express field removido.

* ✅ **Lógica de Fechas (Strict SLA)**
  * [x] Input de fecha deshabilitado por defecto.
  * [x] Fecha calculada automáticamente según SLA de la configuración.
  * [x] Cálculo de días hábiles (salta fines de semana).
  * [x] Checkbox "Orden Express" implementado.
  * [x] Fecha manual solo disponible si Express está activado.
  * [x] Mensaje de advertencia para Express (condiciones pendientes).

* ✅ **Wizard UI Final**
  * [x] Conectado a tabla `lab_materials` real (DB).
  * [x] Paso 1: Selección de Material con datos dinámicos.
  * [x] Paso 2: Configuración con SLA automático y Express.
  * [x] Paso 3: Review actualizado (pendiente).
  * [x] Botón "CREAR ORDEN DE LAB" agregado en Odontograma.

* ⏳ **Pendientes**
  * [ ] Definir condiciones de Orden Express (costo adicional, SLA reducido).
  * [ ] Impacto visual en Kamba (borde rojo, icono 🔥).
  * [ ] Estadísticas Express vs Normal.


