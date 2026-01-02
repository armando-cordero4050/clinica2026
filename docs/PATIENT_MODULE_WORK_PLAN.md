# 📋 Plan de Trabajo COMPLETO: Módulo de Pacientes - DentalFlow

**Fecha:** 2025-12-31
**Objetivo:** Replicar COMPLETAMENTE el módulo de pacientes de Doctocliq

---

## 🎯 **VISTA COMPLETA A REPLICAR**

### **Layout Principal:**
```
┌─────────────────────────────────────────────────────────────┐
│ SIDEBAR IZQUIERDO │ CONTENIDO CENTRAL │ PANEL DERECHO      │
│ (Navegación)      │ (Odontograma/Tabs)│ (Notas Evolución)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 **1. SIDEBAR IZQUIERDO (Navegación del Paciente)**

### **Header del Paciente:**
- [ ] **Avatar grande** (foto del paciente)
- [ ] **Nombre completo**
- [ ] **Fecha de creación** ("Creado el 28 dic 2025")
- [ ] **Botones de acción:**
  - WhatsApp (icono)
  - Email (icono)
  - Más opciones (...)

### **Sección Superior (Tarjetas):**
- [ ] **Etiquetas:**
  - Botón "+ Agregar"
  - Lista de etiquetas con colores
  - Click para editar/eliminar

- [ ] **Notas:**
  - Textarea "Escribe aquí"
  - Guardado automático

- [ ] **Alergias:** (destacado en rojo)
  - Textarea "Escribe aquí"
  - Icono de alerta

### **Sección Ortodoncia:** (Opcional pero visible)
- [ ] **Título editable** con dropdown
- [ ] **Stepper horizontal de 4 fases:**
  1. Diagnóstico (F. Inicio, Duración meses)
  2. Tratamiento Inic. (F. Fin, Retraso meses)
  3. Contención (Nueva F. Fin)
  4. Post-Contención
- [ ] **Indicador de inasistencias:** "Inasistencias: 0"

### **Menú de Navegación:**
- [ ] **Filiación** (icono de persona)
- [ ] **Historia clínica** (icono de documento)
- [ ] **Odontograma** (icono de diente) ⭐ ACTIVO
- [ ] **Periodontograma** (icono de encías)
- [ ] **Ortodoncia** (icono de brackets)
- [ ] **Estado de cuenta** (icono de dinero)
- [ ] **Prescripciones** (icono de receta)
- [ ] **Archivos** (icono de carpeta)

---

## 🦷 **2. CONTENIDO CENTRAL (Odontograma)**

### **Tabs Superiores:**
- [ ] **Odo. Inicial** (tab activo en cyan)
- [ ] **Odo. Evolución**
- [ ] **Odo. Alta**

### **Controles del Odontograma:**
- [ ] **Selector de Doctor:** Dropdown
- [ ] **Selector de Tipo:** Dropdown (Adultos/Niños)
- [ ] **Selector de Nomenclatura:** Dropdown (Internacional/FDI)
- [ ] **Botón "Marcado múltiple"** con checkbox
- [ ] **Leyenda de colores:**
  - 🔴 Mal estado
  - 🔵 Buen estado
- [ ] **Botón "Nuevo odontograma"**
- [ ] **Botón de configuración** (engranaje)

### **Mapa Dental SVG:**
- [ ] **Dientes superiores:** 18-11, 21-28
- [ ] **Dientes inferiores:** 48-41, 31-38
- [ ] **Numeración FDI** encima de cada diente
- [ ] **Diseño realista** de cada diente (incisivos, caninos, molares)
- [ ] **Estados visuales:**
  - Normal (beige claro)
  - Seleccionado (highlight)
  - Con hallazgo (color según tipo)
  - Ausente (vacío)

### **Interactividad:**
- [ ] **Click en diente:**
  - Abre modal/popover de hallazgos
  - Muestra superficies (Mesial, Distal, Oclusal, Vestibular, Lingual)
  - Lista de hallazgos disponibles
  - Botón "Guardar"

- [ ] **Marcado múltiple:**
  - Checkbox para seleccionar varios dientes
  - Aplicar mismo hallazgo a todos

### **Tabla de Hallazgos (Debajo del odontograma):**
- [ ] **Columnas:**
  - Diente (número FDI)
  - Superficie
  - Diagnóstico
  - Tratamiento propuesto
  - Estado
  - Acciones (editar/eliminar)
- [ ] **Botón "Agregar a presupuesto"**

---

## 📝 **3. PANEL DERECHO (Notas de Evolución)**

### **Header:**
- [ ] **Título:** "Notas de evolución"
- [ ] **Botón "+"** (agregar nota)
- [ ] **Botón de filtro** (embudo)

### **Timeline Vertical:**
- [ ] **Cada nota muestra:**
  - Fecha y hora
  - Doctor que atendió
  - Texto de la nota
  - Archivos adjuntos (si hay)
  - Botón de editar/eliminar

### **Formulario de Nueva Nota:**
- [ ] **Modal con campos:**
  - Fecha (date picker)
  - Hora (time picker)
  - Doctor (dropdown)
  - Motivo de consulta (textarea)
  - Diagnóstico (textarea)
  - Tratamiento realizado (textarea)
  - Observaciones (textarea)
  - Próxima cita (date picker)
  - Adjuntar archivos (upload)

---

## 📊 **4. TABLA DE PACIENTES (Vista Principal)**

### **Header de la Tabla:**
- [ ] **Tabs:**
  - "Mis pacientes" (activo)
  - "Asistencias"

- [ ] **Filtros:**
  - Búsqueda global (barra superior)
  - Búsqueda en tabla (nombre, apellido, doc, tel)
  - Dropdown "Activos" (Activos/Inactivos/Todos)

- [ ] **Botón de acciones (+):**
  - Crear presupuesto
  - Nuevo paciente
  - Agendar cita
  - Crear campaña

### **Columnas de la Tabla:**
1. **Paciente:**
   - Avatar (circular)
   - Nombre completo
   - Etiquetas (badges de colores)

2. **Última Cita:**
   - Fecha relativa ("Hace 1 día")
   - Badge de estado:
     - ✅ Verde (asistió)
     - ❌ Rojo (no asistió)
     - ⏱️ Gris (programada)

3. **Próxima Cita:**
   - Fecha programada
   - "--" si no hay

4. **Tarea:**
   - Contador de tareas pendientes
   - Badge con número

5. **Presupuesto:**
   - Barra de progreso visual
   - Texto: "Q 0 / Q 600"
   - Colores:
     - Verde (100% pagado)
     - Amarillo (parcial)
     - Rojo (0% pagado)

6. **Fuente:**
   - Origen del paciente
   - Icono + texto (Instagram, Facebook, etc.)

7. **Comentario:**
   - Notas breves
   - Icono de comentario
   - Click para editar

8. **Acciones:**
   - Botón de menú (...)
   - Opciones:
     - Ver detalle
     - Editar
     - Agendar cita
     - Crear presupuesto
     - Eliminar

---

## 🎨 **5. SIDEBAR DE DETALLE RÁPIDO (Sheet)**

### **Estructura:**
- [ ] **Header:**
  - Avatar grande
  - Nombre completo
  - Teléfono (clickeable → WhatsApp)
  - Email
  - Botón "Abrir historia" (destacado)

- [ ] **Nota General:**
  - Textarea grande
  - Guardado automático
  - Placeholder: "Escribe una nota general..."

- [ ] **Tabs Internos:**
  
  **Tab 1: Citas**
  - Tabla con: Fecha, Doctor, Motivo, Estado, Comentario
  - Botón "Nueva cita"
  - Estados con badges de colores

  **Tab 2: Filiación**
  - Formulario editable inline:
    - Teléfono
    - Email
    - Fuente de captación (dropdown)
    - N° de historia clínica
    - Grupo (dropdown)
    - Línea de negocio (dropdown)
  - Botón "Guardar cambios"

  **Tab 3: Presupuestos**
  - Lista de presupuestos
  - Cada uno muestra:
    - Número de presupuesto
    - Fecha
    - Total
    - Pagado
    - Pendiente
    - Estado (badge)
  - Botón "Nuevo presupuesto"

  **Tab 4: Tareas**
  - Lista de tareas manuales
  - Lista de tareas automáticas
  - Cada tarea muestra:
    - Descripción
    - Fecha
    - Estado (pendiente/completada)
    - Responsable
  - Botón "Nueva tarea"

---

## 📋 **6. FORMULARIO DE CREACIÓN/EDICIÓN**

### **Modal Grande:**
- [ ] **Título:** "Nuevo paciente" / "Editar paciente"

### **Sección 1: Datos Obligatorios**
- [ ] **Tipo de documento:** Dropdown (DPI/Pasaporte/NIT)
- [ ] **Número de documento:** Input
- [ ] **Nombres:** Input
- [ ] **Apellido Paterno:** Input
- [ ] **Apellido Materno:** Input
- [ ] **Teléfono:** Input con selector de país

### **Sección 2: "Más datos" (Colapsable)**
- [ ] **Email:** Input
- [ ] **Fecha de nacimiento:** Date picker
- [ ] **Sexo:** Radio buttons (M/F/Otro)
- [ ] **Fuente de captación:** Dropdown
- [ ] **Aseguradora:** Dropdown
- [ ] **Etiquetas:** Multi-select con colores
- [ ] **Dirección completa:**
  - País (dropdown)
  - Departamento/Estado
  - Ciudad
  - Dirección
  - Código postal
- [ ] **Contacto de emergencia:**
  - Nombre
  - Teléfono
  - Relación

### **Botones:**
- [ ] "Cancelar" (outline)
- [ ] "Guardar" (primary)

---

## 🏷️ **7. SISTEMA DE ETIQUETAS**

### **Gestión de Etiquetas:**
- [ ] **CRUD completo:**
  - Crear etiqueta
  - Editar nombre y color
  - Eliminar etiqueta
  - Listar todas

### **Tipos de Etiquetas:**
- [ ] VIP (dorado)
- [ ] Impuntual (rojo)
- [ ] Deudor (naranja)
- [ ] Nuevo (verde)
- [ ] Referido (azul)
- [ ] Personalizado (cualquier color)

### **Uso de Etiquetas:**
- [ ] Asignar múltiples etiquetas a un paciente
- [ ] Filtrar pacientes por etiqueta
- [ ] Mostrar en tabla como badges
- [ ] Mostrar en sidebar

---

## 📂 **8. GESTIÓN DE ARCHIVOS**

### **Tipos de Archivos:**
- [ ] Radiografías
- [ ] Fotos antes/después
- [ ] Consentimientos firmados
- [ ] Recetas médicas
- [ ] Resultados de laboratorio
- [ ] Documentos generales

### **Funcionalidades:**
- [ ] **Upload:**
  - Drag & drop
  - Click para seleccionar
  - Múltiples archivos
  - Preview antes de subir

- [ ] **Galería:**
  - Vista de grid
  - Vista de lista
  - Filtro por tipo
  - Búsqueda por nombre

- [ ] **Visor:**
  - Lightbox para imágenes
  - Visor de PDF inline
  - Descarga de archivos
  - Compartir por WhatsApp/Email

---

## 💰 **9. INTEGRACIÓN CON PRESUPUESTOS**

### **Desde Odontograma:**
- [ ] **Botón "Agregar a presupuesto"** en tabla de hallazgos
- [ ] **Modal de presupuesto:**
  - Seleccionar hallazgos
  - Mapear a servicios
  - Asignar precios
  - Calcular total
  - Guardar como borrador o enviar

### **En Tabla de Pacientes:**
- [ ] **Barra de progreso:**
  - Verde: 100% pagado
  - Amarillo: Parcial
  - Rojo: 0% pagado
  - Tooltip con detalles

### **En Sidebar:**
- [ ] **Lista de presupuestos:**
  - Número
  - Fecha
  - Total
  - Pagado
  - Pendiente
  - Estado (badge)
  - Acciones (ver/editar/eliminar)

---

## 📅 **10. INTEGRACIÓN CON CITAS**

### **En Tabla:**
- [ ] **Última Cita:**
  - Fecha relativa
  - Badge de estado (asistió/no asistió)
  - Tooltip con detalles

- [ ] **Próxima Cita:**
  - Fecha programada
  - Hora
  - Doctor
  - Tooltip con detalles

### **En Sidebar:**
- [ ] **Tab de Citas:**
  - Tabla con historial completo
  - Columnas: Fecha, Doctor, Motivo, Estado, Comentario
  - Botón "Nueva cita"
  - Click en fila para ver detalles

### **Agendar Cita:**
- [ ] **Modal:**
  - Fecha (date picker)
  - Hora (time picker)
  - Doctor (dropdown)
  - Motivo (textarea)
  - Duración (dropdown)
  - Recordatorio (checkbox)

---

## 🎯 **PLAN DE TRABAJO ACTUALIZADO (Priorizado)**

### **SPRINT 1: Base de Datos y Backend (4-6 horas)**
1. [ ] Crear tablas faltantes:
   - `patient_tags` (etiquetas)
   - `patient_tag_assignments` (relación paciente-etiqueta)
   - `patient_appointments` (citas)
   - `patient_budgets` (presupuestos)
   - `patient_budget_items` (items de presupuesto)
   - `patient_tasks` (tareas)
   - `patient_documents` (archivos)
   - `patient_notes` (notas generales)

2. [ ] Crear Server Actions:
   - CRUD de etiquetas
   - CRUD de citas
   - CRUD de presupuestos
   - CRUD de tareas
   - Upload de archivos
   - Notas de evolución

### **SPRINT 2: Tabla Avanzada (6-8 horas)**
1. [ ] Agregar columnas faltantes:
   - Avatar
   - Etiquetas (badges)
   - Última cita (fecha + badge)
   - Próxima cita
   - Tareas (contador)
   - Presupuesto (barra de progreso)
   - Fuente
   - Comentario

2. [ ] Implementar filtros:
   - Tabs (Mis pacientes/Asistencias)
   - Dropdown de estado (Activos/Inactivos/Todos)
   - Búsqueda avanzada

3. [ ] Botón de acciones rápidas (+)

### **SPRINT 3: Sidebar Mejorado (6-8 horas)**
1. [ ] Rediseñar header:
   - Avatar grande
   - Botones de acción (WhatsApp, Email)

2. [ ] Implementar tabs:
   - Citas (tabla completa)
   - Filiación (formulario editable)
   - Presupuestos (lista)
   - Tareas (lista)

3. [ ] Nota general con guardado automático

### **SPRINT 4: Odontograma Completo (12-16 horas)** ⭐ CRÍTICO
1. [ ] **Componente SVG:**
   - 32 dientes adultos (diseño realista)
   - 20 dientes temporales
   - Numeración FDI correcta
   - Estados visuales (normal, seleccionado, con hallazgo, ausente)

2. [ ] **Controles:**
   - Selector de doctor
   - Selector de tipo (adultos/niños)
   - Selector de nomenclatura
   - Marcado múltiple (checkbox)
   - Leyenda de colores

3. [ ] **Tabs:**
   - Odo. Inicial
   - Odo. Evolución
   - Odo. Alta

4. [ ] **Interactividad:**
   - Click en diente → Modal de hallazgos
   - Selector de superficies
   - Lista de hallazgos disponibles
   - Guardado en DB

5. [ ] **Tabla de hallazgos:**
   - Lista de todos los hallazgos
   - Editar/eliminar
   - Botón "Agregar a presupuesto"

### **SPRINT 5: Sidebar Izquierdo (Historia Clínica) (8-10 horas)**
1. [ ] **Header del paciente:**
   - Avatar grande
   - Nombre y fecha de creación
   - Botones de acción

2. [ ] **Tarjetas superiores:**
   - Etiquetas (+ Agregar)
   - Notas (textarea)
   - Alergias (destacado en rojo)

3. [ ] **Sección Ortodoncia:**
   - Stepper de 4 fases
   - Indicador de inasistencias

4. [ ] **Menú de navegación:**
   - 8 opciones con iconos
   - Highlight del activo

### **SPRINT 6: Panel de Notas de Evolución (6-8 horas)**
1. [ ] **Timeline vertical:**
   - Lista de notas cronológica
   - Cada nota con fecha, doctor, texto
   - Archivos adjuntos

2. [ ] **Formulario de nueva nota:**
   - Todos los campos requeridos
   - Upload de archivos
   - Guardado en DB

3. [ ] **Filtros:**
   - Por fecha
   - Por doctor
   - Por tipo

### **SPRINT 7: Sistema de Etiquetas (4-6 horas)**
1. [ ] CRUD de etiquetas
2. [ ] Asignación a pacientes
3. [ ] Filtrado por etiquetas
4. [ ] Visualización en tabla y sidebar

### **SPRINT 8: Gestión de Archivos (6-8 horas)**
1. [ ] Upload de archivos (drag & drop)
2. [ ] Galería de imágenes
3. [ ] Visor de documentos
4. [ ] Categorización y búsqueda

### **SPRINT 9: Integración Presupuestos (8-10 horas)**
1. [ ] Crear presupuesto desde odontograma
2. [ ] Barra de progreso en tabla
3. [ ] Lista de presupuestos en sidebar
4. [ ] Estados y pagos

### **SPRINT 10: Integración Citas (6-8 horas)**
1. [ ] Mostrar última/próxima cita en tabla
2. [ ] Historial de citas en sidebar
3. [ ] Agendar nueva cita
4. [ ] Estados y badges

---

## ⏱️ **ESTIMACIÓN TOTAL: 66-88 horas (8-11 días)**

### **Prioridades CRÍTICAS (Empezar HOY):**
1. **Odontograma Completo** (16h) ⭐⭐⭐
2. **Tabla Avanzada** (8h) ⭐⭐
3. **Sidebar Mejorado** (8h) ⭐⭐

### **Prioridades ALTAS (Esta Semana):**
4. **Sidebar Izquierdo** (10h) ⭐
5. **Notas de Evolución** (8h) ⭐
6. **Sistema de Etiquetas** (6h) ⭐

### **Prioridades MEDIAS (Próxima Semana):**
7. **Gestión de Archivos** (8h)
8. **Integración Presupuestos** (10h)
9. **Integración Citas** (8h)

---

## 🚀 **¿POR DÓNDE EMPEZAMOS?**

**Recomendación basada en impacto visual:**
1. **Tabla Avanzada** (8h) → Victoria rápida, mejora visual inmediata
2. **Odontograma** (16h) → Lo más complejo pero crítico
3. **Sidebar Mejorado** (8h) → Funcionalidad completa

**¿Empezamos con la tabla avanzada para tener una victoria rápida?** 🎯
