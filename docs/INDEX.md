# 🗺️ INDEX - DentalFlow Project Navigation

> **INSTRUCCIÓN PARA AGENTES IA**: Este es tu punto de entrada. Lee este archivo PRIMERO en cada sesión para entender el contexto completo del proyecto.

---

## 📍 **UBICACIÓN Y CONTEXTO**

- **Proyecto**: DentalFlow (SaaS Dental Multi-tenant)
- **Repositorio Local**: `D:\DentalFlow`
- **Stack**: React + Vite + TypeScript + Supabase + Odoo
- **Estado**: En desarrollo activo (Fase 2.5)

---

## 🎯 **OBJETIVOS ACTUALES**

### Objetivo Principal
Implementar sistema completo de gestión dental con integración ERP Odoo para laboratorios.

### Fase Actual: 2.5 - Módulo de Órdenes de Laboratorio
- ✅ Catálogo de materiales completado
- ✅ Wizard de creación de órdenes funcional
- ✅ Integración con odontograma
- 🚧 Módulo de logística en desarrollo (Sprint 1)

---

## 📚 **DOCUMENTOS CLAVE (ORDEN DE LECTURA)**

### 0. **ESTADO ACTUAL** (Leer PRIMERO en cada sesión) ⭐
- 📄 `docs/ESTADO_ACTUAL.md` - **Conocimiento de sesión actual**
  - Esquema de BD confirmado
  - Cómo conectarse a Supabase
  - Problemas resueltos y pendientes
  - Lecciones aprendidas recientes
  - **ACTUALIZAR al final de cada sesión importante**

### 1. **ARQUITECTURA Y REGLAS** (Leer para entender diseño)
- 📄 `docs/LAB_ORDER_LOGIC.md` - Lógica de negocio de órdenes
- 📄 `docs/GUIA_TRABAJOS_DENTALES.md` - Clasificación de tratamientos
- 📄 `docs/odontograma.md` - Funcionamiento del odontograma

### 2. **ESTADO DEL PROYECTO** (Leer para contexto histórico)
- 📄 `docs/PR_LOG.md` - Historial de cambios y PRs
- 📄 `docs/TASK_STATUS.md` - Estado de tareas pendientes
- 📄 `docs/PLAN_ACCION_FASE_2.5.md` - Plan actual de desarrollo

### 3. **MÓDULOS ESPECÍFICOS** (Leer según necesidad)
- 📄 `docs/MODULES/LAB_MODULE.md` - Módulo de laboratorio (10 etapas)
- 📄 `docs/MODULES/MEDICAL_MODULE.md` - Módulo médico/clínica
- 📄 `docs/MODULES/LOGISTICS_MODULE.md` - Módulo de logística

### 4. **CALENDARIO Y FLUJOS**
- 📄 `docs/calendario.md` - Sistema de citas y agenda
- 📄 `docs/WIZARD_COMPLETO_EXPRESS_SLA.md` - Wizard de órdenes

---

## 🗄️ **ESTRUCTURA DE BASE DE DATOS**

### Esquemas Principales
1. **`public`**: Catálogo de laboratorio (lab_configurations, lab_materials)
2. **`schema_lab`**: Órdenes y producción (lab_orders, lab_order_items)
3. **`schema_medical`**: Pacientes, citas, presupuestos
4. **`auth`**: Usuarios y autenticación

### ⚠️ **DECISIÓN ARQUITECTÓNICA CRÍTICA** (2026-01-05)
- **Catálogo Lab**: Vive en `public.lab_configurations` (fuente de verdad)
- **Órdenes Lab**: Viven en `schema_lab.lab_order_items`
- **FK**: `lab_order_items.configuration_id` → `public.lab_configurations.id`
- **Razón**: Frontend consume `public`, backend valida contra `public`

---

## 🔧 **MIGRACIONES SQL**

### Ubicación
- **Activas**: `supabase/migrations/*.sql` (151 archivos timestamped)
- **Archivadas**: `supabase/migrations/archive/`
  - `applied_2026_01_05/` - Migraciones urgentes aplicadas
  - `fixes_consolidated/` - Fixes históricos
  - `temp_files/` - Archivos temporales

### ⚠️ **REGLA**: 
- Solo ejecutar migraciones timestamped `YYYYMMDDHHMMSS_*.sql`
- Archivos en `archive/` son solo referencia histórica

---

## 🔑 **DECISIONES ARQUITECTÓNICAS IMPORTANTES**

### 1. Multi-tenancy
- Todas las tablas de negocio tienen `clinic_id`
- RLS estricto por clínica
- Super Admin puede ver todo

### 2. Integración Odoo
- ✅ Sincronización de Servicios: Activa
- ✅ Sincronización de Clínicas: Activa
- ⏳ Sincronización de Órdenes: Pendiente (Fase 3)

### 3. Roles
- `super_admin`: Acceso total
- `clinic_admin`: Gestión de clínica
- `clinic_doctor`: Pacientes y órdenes
- `clinic_receptionist`: Citas y pagos
- `lab_staff`: Producción
- `courier`: Logística

---

## 🚨 **PROBLEMAS RESUELTOS RECIENTEMENTE**

### 2026-01-05
1. ✅ **Foreign Key Lab Orders**: Reapuntado a `public.lab_configurations`
2. ✅ **Reorganización de Migraciones**: 35 archivos archivados
3. ✅ **Verificación de Migraciones**: Todas las urgentes aplicadas

### 2026-01-04
1. ✅ **Fix Appointments**: Columna `sale_price_gtq` corregida
2. ✅ **Fix Services**: Permisos RLS aplicados

---

## 📝 **FLUJO DE TRABAJO PARA AGENTES IA**

### Al iniciar una sesión:
1. **Leer**: `docs/INDEX.md` (este archivo)
2. **Revisar**: `docs/PR_LOG.md` (últimas 3 entradas)
3. **Consultar**: `docs/TASK_STATUS.md` (tareas pendientes)
4. **Verificar**: Documento específico del módulo en cuestión

### Al hacer cambios:
1. **Actualizar**: `docs/PR_LOG.md` con entrada de cambio
2. **Marcar**: `docs/TASK_STATUS.md` si se completa tarea
3. **Documentar**: Decisiones críticas en el módulo correspondiente

### Al encontrar inconsistencias:
1. **Prioridad**: Este INDEX.md es la fuente de verdad
2. **Segundo**: Documentos en `docs/MODULES/`
3. **Tercero**: Código fuente actual

---

## 🔍 **CÓMO BUSCAR INFORMACIÓN**

### Pregunta: "¿Cómo funcionan las órdenes de laboratorio?"
→ Lee: `docs/LAB_ORDER_LOGIC.md` + `docs/MODULES/LAB_MODULE.md`

### Pregunta: "¿Qué migraciones están aplicadas?"
→ Lee: `supabase/migrations/archive/applied_2026_01_05/README.md`

### Pregunta: "¿Cómo se integra Odoo?"
→ Lee: `docs/MODULES/LAB_MODULE.md` (sección Odoo) + `docs/PR_LOG.md`

### Pregunta: "¿Qué está pendiente?"
→ Lee: `docs/TASK_STATUS.md` + `docs/PLAN_ACCION_FASE_2.5.md`

---

## 📊 **MÉTRICAS DEL PROYECTO**

- **Migraciones SQL**: 151 activas + 35 archivadas
- **Módulos Activos**: 5 (Medical, Lab, Logistics, Odoo, Gamification)
- **Tablas DB**: ~50 (distribuidas en 4 esquemas)
- **RPCs**: ~30 funciones de servidor

---

## 🎓 **LECCIONES APRENDIDAS**

1. **Esquemas Duplicados**: No duplicar catálogos entre `public` y `schema_lab`
2. **Migraciones Urgentes**: Usar prefijo `EJECUTAR_AHORA_` solo para fixes críticos
3. **Documentación**: Mantener PR_LOG.md actualizado en cada cambio
4. **Verificación**: Siempre verificar en Supabase antes de asumir que algo está aplicado

---

## 🔗 **ENLACES RÁPIDOS**

- **Supabase Dashboard**: [Configurar en .env.local]
- **Odoo Instance**: [Configurar en odoo_config]
- **Repositorio**: Local en `D:\DentalFlow`

---

**Última Actualización**: 2026-01-05
**Mantenido por**: Agente IA + Usuario
**Versión**: 1.0
