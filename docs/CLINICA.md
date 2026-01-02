# Módulo de Clínica Dental - DentalFlow

**Fecha de inicio:** 30/12/2025  
**Inspiración UI/UX:** https://app.doctocliq.com/panel-control/agenda  
**Stack:** React 18 + TypeScript + TailwindCSS + shadcn/ui

---

## Contexto

Este módulo se está desarrollando para replicar la funcionalidad y estructura de navegación de Doctocliq, pero manteniendo la identidad visual de DentalFlow.

### Reglas NO Negociables:

1. ✅ **Módulos aislados:** `schema_medical.*` es completamente independiente
2. ✅ **Multi-tenancy:** Todas las tablas llevan `clinic_id`
3. ✅ **RLS activo:** En todas las tablas médicas
4. ✅ **Privacidad:** El laboratorio NUNCA ve datos de pacientes
5. ✅ **No afectar módulos existentes:** Lab y Core permanecen intactos

---

## Exploración de Doctocliq - COMPLETADA ✅

### URL Base: https://app.doctocliq.com/panel-control/agenda

---

## 1. Estructura de Navegación Principal

**Tipo:** Barra horizontal superior (maximiza espacio de trabajo)

### Menús Principales:

| Menú | Submódulos | Descripción |
|------|-----------|-------------|
| **Agenda** | - | Calendario de citas con filtros por estado y doctor |
| **Pacientes** | - | Listado maestro + expedientes clínicos completos |
| **Caja** | - | Ingresos, egresos, flujo de efectivo diario |
| **Marketing** | Segmentaciones, Automatizaciones, Campañas | Herramientas de fidelización |
| **Productividad** | Reportes, KPIs | Dashboard de métricas (ingresos, servicios vendidos) |
| **Inventario** | Stock, Consumo | Control de insumos dentales |
| **Laboratorio** | Órdenes | Seguimiento de órdenes externas (ya implementado) |
| **Chat** | WhatsApp Integration | Comunicación directa con pacientes |
| **Configuración** | Historia Clínica, Usuarios, Roles | Administración del sistema |

---

## 2. Vista de Pacientes - Análisis Detallado

### 2.1 Lista de Pacientes

**Componentes:**
- ✅ Barra de búsqueda global (siempre visible)
- ✅ Filtros por etiquetas, estado, doctor asignado
- ✅ Botón flotante "+ Nuevo Paciente"

**Columnas de la Tabla:**
| Columna | Tipo de Dato | Ejemplo |
|---------|--------------|---------|
| Paciente | Texto + Avatar | "Jorge Hernández" |
| Última Cita | Fecha | "15/12/2025" |
| Próxima Cita | Fecha | "20/01/2026" |
| Tareas | Badge/Contador | "3 pendientes" |
| Presupuesto | Barra de Progreso | "60% pagado" |
| Fuente | Dropdown/Badge | "Referido", "Facebook" |
| Comentarios | Icono clickeable | Muestra últimas notas |

**Interacciones:**
- Click en fila → Abre **Quick View (Sheet lateral)**
- Click en "Abrir historia" → Vista completa del expediente

### 2.2 Quick View (Sheet Lateral)

**Secciones:**
- Header con nombre, edad, foto
- Rating del paciente (estrellas)
- Etiquetas/Tags personalizables
- Teléfonos de contacto (clickeables para WhatsApp)
- Botones de acción rápida:
  - Nueva cita
  - Nuevo presupuesto
  - Ver historial
  - **Abrir historia completa**

### 2.3 Historia Clínica Completa

**Sub-navegación lateral (Tabs verticales):**

#### a) **Datos Generales**
- Formulario extenso con:
  - Información demográfica (nombre, edad, género, fecha nacimiento)
  - Contacto (email, teléfonos, dirección completa)
  - Responsable/Tutor (si aplica)
  - Información médica general (tipo sangre, alergias, enfermedades crónicas)
  - Fuente de captación
  - Etiquetas personalizadas
  - Consentimientos firmados

#### b) **Evolución (Bitácora)**
- Línea de tiempo cronológica
- Notas médicas por fecha
- Formato: Fecha + Doctor + Nota + Archivos adjuntos
- Botón: "+ Nueva nota de evolución"

#### c) **Odontograma (⭐ COMPONENTE CLAVE)**
- **Sistema FDI (11-85)**
- **Vista visual interactiva:**
  - Dientes adultos: 11-18, 21-28, 31-38, 41-48
  - Dientes temporales: 51-55, 61-65, 71-75, 81-85
- **Funcionalidad:**
  1. Click en diente → Se despliega menú de hallazgos clínicos
  2. Seleccionar hallazgo (Caries, Endodoncia, Corona, etc.)
  3. Seleccionar superficie (Mesial, Distal, Oclusal, etc.)
  4. El hallazgo se marca visualmente en el diente
  5. Se agrega como item en la tabla de "Hallazgos clínicos"
- **Tabla de Hallazgos:**
  - Columnas: Diente, Superficie, Diagnóstico, Tratamiento propuesto, Estado, Acciones
  - Acción: "Agregar a presupuesto" (mapeo automático a servicio)

#### d) **Presupuestos**
- Lista de cotizaciones del paciente
- Estado: Draft, Enviado, Aprobado, Rechazado, Expirado
- Botón: "+ Nuevo presupuesto"
- **Generación automática desde odontograma:**
  - Los hallazgos clínicos pueden convertirse en items de presupuesto
  - Mapeo: "Caries" → Servicio: "Resina Simple" (con precio)
  - Cada item muestra: Diente, Tratamiento, Cantidad, Precio unitario, Total

#### e) **Documentos y Multimedia**
- Carga de archivos:
  - Radiografías
  - Fotos antes/después
  - Consentimientos informados firmados
  - Recetas médicas
  - Resultados de laboratorio
- Organización por tipo y fecha
- Vista previa inline

#### f) **Pagos y Facturación**
- Histórico de pagos vinculados
- Saldo pendiente
- Métodos de pago utilizados
- Integración con módulo de Caja

---

## 3. Otros Módulos Explorados

### 3.1 Caja (Cashier/Payments)
- Dashboard de flujo de efectivo del día
- Ingresos vs Egresos
- Métodos de pago (Efectivo, Tarjeta, Transferencia)
- Cierre de caja diario

### 3.2 Productividad (Reports)
- KPIs visuales:
  - Ingresos por doctor
  - Servicios más vendidos
  - Tasa de conversión de presupuestos
  - Pacientes nuevos vs recurrentes

### 3.3 Inventario
- Control de stock de insumos
- Alertas de stock mínimo
- Consumo por tratamiento
- Proveedores

### 3.4 Laboratorio
- Lista de órdenes enviadas
- Estado: Pendiente, En proceso, Listo, Entregado
- Integración con laboratorios externos
- **Nota:** Ya tenemos base implementada en `schema_lab.orders`

### 3.5 Configuración - Historia Clínica
- **Hallazgos Clínicos configurables:**
  - Crear/editar tipos de hallazgos (Caries, Endodoncia, etc.)
  - Asignar colores para visualización en odontograma
  - **Mapeo a servicios:** Vincular hallazgo con servicio para auto-cotización
- **Consentimientos personalizados:**
  - Plantillas de documentos
  - Firma digital
- **Campos personalizados:**
  - Agregar campos adicionales al expediente

---

## 4. Componentes UI/UX Clave para DentalFlow

**Stack: TailwindCSS + shadcn/ui + Framer Motion**

### 4.1 Componentes a Adaptar:

| Componente Doctocliq | Equivalente shadcn/ui | Uso |
|---------------------|----------------------|-----|
| Barra superior horizontal | Custom Header | Navegación principal |
| Búsqueda global | `<Input>` con `<Command>` | Buscar pacientes rápidamente |
| Lista de pacientes | `<DataTable>` + `<Table>` | Vista maestra |
| Quick View lateral | `<Sheet>` | Detalles rápidos sin perder contexto |
| Tabs verticales (Historia) | `<Tabs orientation="vertical">` | Navegación del expediente |
| Odontograma visual | **Custom SVG Component** | Mapeo dental interactivo |
| Modales de formularios | `<Dialog>` | Crear/editar pacientes, presupuestos |
| Barra de progreso (presupuestos) | `<Progress>` | Mostrar % pagado |
| Badges de estado | `<Badge variant="...">` | Estados de citas, presupuestos |
| Botón flotante "+ Nuevo" | `<Button size="icon" className="fixed...">` | Acción primaria |

### 4.2 Patrones de Navegación:

1. **Menú horizontal superior** (vs sidebar vertical actual)
2. **Breadcrumbs dinámicos**
3. **Sheet lateral** para quick actions (no modal full-screen)
4. **Tabs verticales** en vistas complejas (Historia Clínica)

---

## 5. Modelo de Datos Ajustado

### Cambios respecto al esquema inicial:

#### Nueva Tabla: `schema_medical.clinical_findings`
```sql
CREATE TABLE schema_medical.clinical_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  patient_id UUID NOT NULL REFERENCES schema_medical.patients(id),
  
  tooth_number INTEGER CHECK (tooth_number BETWEEN 11 AND 85),
  surface TEXT[], -- Puede ser múltiple: ['mesial', 'distal']
  finding_type TEXT NOT NULL, -- 'caries', 'endodontics', 'crown', etc.
  diagnosis TEXT,
  treatment_proposed TEXT,
  
  -- Mapeo a presupuesto
  budget_item_id UUID REFERENCES schema_medical.budget_items(id),
  mapped_service_id UUID REFERENCES schema_lab.services(id),
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'budgeted', 'approved', 'in_progress', 'completed')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES schema_core.users(id)
);
```

#### Tabla de Configuración: `schema_medical.finding_types_config`
```sql
CREATE TABLE schema_medical.finding_types_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  
  name TEXT NOT NULL, -- 'Caries', 'Endodoncia', etc.
  color_hex TEXT, -- Para visualización en odontograma
  default_service_id UUID REFERENCES schema_lab.services(id), -- Auto-mapeo
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Plan de Implementación - FASE 1

### Prioridad ALTA (Semana 1-2):

#### **Sprint 1: Base de Datos y Pacientes** ✅ COMPLETADO

1. ✅ **COMPLETADO** - Crear migraciones SQL:
   - ✅ `schema_medical.patients` - Tabla de pacientes con info completa
   - ✅ `schema_medical.clinical_findings` - Hallazgos del odontograma
   - ✅ `schema_medical.finding_types_config` - Configuración de hallazgos
   - ✅ `schema_medical.evolution_notes` - Notas de evolución/bitácora
   - ✅ Políticas RLS para todas las tablas
   - ✅ Vistas públicas para acceso desde frontend
   - 📄 Archivo: `20260130000031_create_patients_and_findings.sql`
   
2. ✅ **COMPLETADO** - Implementar CRUD de pacientes:
   - ✅ Lista con búsqueda y filtros (`PatientTable`)
   - ✅ Formulario de creación (`PatientDialog`)
   - ✅ Quick View (Sheet lateral) (`PatientSheet`)
   - ✅ Página de detalle con tabs (`PatientHistoryTabs`)
   - ✅ Server Actions completas (`patients.ts`)
   - ✅ Integrado en menú del dashboard

**Archivos creados:**
- `src/modules/medical/actions/patients.ts`
- `src/modules/medical/components/patient-table.tsx`
- `src/modules/medical/components/patient-header.tsx`
- `src/modules/medical/components/patient-dialog.tsx`
- `src/modules/medical/components/patient-sheet.tsx`
- `src/modules/medical/components/patient-history-tabs.tsx`
- `src/app/dashboard/medical/patients/page.tsx`
- `src/app/dashboard/medical/patients/[id]/page.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/separator.tsx`

#### **Sprint 2: Odontograma Interactivo**
1. ✅ Crear componente visual del odontograma (SVG):
   - Dientes adultos (32 piezas)
   - Dientes temporales (20 piezas)
   - Sistema FDI correcto
2. ✅ Implementar interactividad:
   - Click en diente → Menú de hallazgos
   - Selección de superficie
   - Marcado visual diferenciado por tipo
3. ✅ Tabla de hallazgos clínicos:
   - CRUD de hallazgos
   - Vinculación con dientes
   - Botón "Agregar a presupuesto"

#### **Sprint 3: Presupuestos y Auto-cotización**
1. ✅ Implementar módulo de presupuestos:
   - Creación manual
   - **Generación automática desde hallazgos**
   - Cálculo de totales (subtotal, impuestos, descuentos)
2. ✅ Configuración de mapeo hallazgos → servicios
3. ✅ Estados y aprobación de presupuestos

### Prioridad MEDIA (Semana 3-4):

#### **Sprint 4: Evolución y Documentos**
1. ✅ Notas de evolución (bitácora cronológica)
2. ✅ Carga y gestión de multimedia
3. ✅ Integración de firma digital (consentimientos)

### Prioridad BAJA (Fase 2):

- Agenda de citas
- Módulo de Caja
- Reportes de Productividad
- Marketing y Automatizaciones

---

## 7. Checklist de Componentes UI

### Componentes Nuevos a Crear:

- [ ] **Header horizontal** (reemplaza sidebar actual para clínicas)
- [ ] **SearchBar global** con `<Command>` de shadcn
- [ ] **PatientSheet** (Quick View lateral)
- [ ] **PatientTable** (DataTable con columnas personalizadas)
- [ ] **OdontogramSVG** (Componente visual interactivo)
- [ ] **FindingsTable** (Lista de hallazgos clínicos)
- [ ] **BudgetGenerator** (Wizard de creación de presupuestos)
- [ ] **EvolutionTimeline** (Línea de tiempo de notas)
- [ ] **DocumentUploader** (Carga de archivos médicos)

---

## RECORDATORIO CRÍTICO

✅ **Este módulo es COMPLETAMENTE INDEPENDIENTE:**
- `schema_medical.*` NO afecta `schema_lab.*` ni `schema_core.*`
- Reutiliza `schema_core.users` y `schema_medical.clinics` (ya existentes)
- La integración con Odoo es OPCIONAL y solo para sincronización de contactos

✅ **Línea gráfica:**
- Mantener TailwindCSS + shadcn/ui
- Colores de DentalFlow (azul/índigo)
- Animaciones suaves con Framer Motion
- **Estructura de navegación horizontal** (como Doctocliq)

---

## Siguiente Paso

**¿Comenzamos con el Sprint 1: Crear las tablas de base de datos para Pacientes y Hallazgos Clínicos?**
