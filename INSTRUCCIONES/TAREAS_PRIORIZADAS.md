# 📋 LISTA PRIORIZADA DE TAREAS PENDIENTES - DentalFlow

**Fecha:** 2026-01-03  
**Basado en:** TAREAS_CORE_MODULE.md

---

## 🔴 PRIORIDAD CRÍTICA (Funcionalidad Core)

### 1. **Odoo Sync - Control de Visualización Dinámico** 
**Módulo:** Odoo Integration (Fase 2 - UI)  
**Impacto:** Alto - Necesario para que Super Admin gestione campos sincronizados  
**Tareas:**
- [ ] Crear UI para gestionar `odoo_field_mappings`
- [ ] Permitir marcar campos como `is_visible`, `can_read`, `can_write`
- [ ] Decidir qué campos se sincronizan a tablas operativas vs solo informativos
- [ ] Implementar "Intelligent Control Matrix" (ya hay diseño demo en `/debug/odoo-designs`)

**Estimación:** 4-6 horas  
**Dependencias:** Ninguna (DB ya lista)

---

### 2. **Gestión de Clínicas (Admin)**
**Módulo:** Admin  
**Impacto:** Alto - Vista principal para administrar clientes  
**Tareas:**
- [ ] Agregar tarjetas de resumen (Clínicas Activas, Total Pacientes, Total Órdenes)
- [ ] Vista de servicios adicionales por clínica
- [ ] Mostrar información del creador de servicios

**Estimación:** 3-4 horas  
**Dependencias:** Datos de Odoo sincronizados

---

### 3. **KAMBA - Mejoras Críticas**
**Módulo:** Lab  
**Impacto:** Alto - Herramienta principal de producción  
**Tareas:**
- [ ] Renombrar "KAMBRA" → "KAMBA" (código + DB)
- [ ] Eliminar scroll horizontal
- [ ] Aumentar tamaño de tarjetas
- [ ] Mostrar contador de órdenes por etapa

**Estimación:** 2-3 horas  
**Dependencias:** Ninguna

---

## 🟡 PRIORIDAD ALTA (UX y Datos Reales)

### 4. **Lab Dashboard - Datos Reales**
**Módulo:** Lab  
**Impacto:** Medio-Alto - Eliminar datos mock  
**Tareas:**
- [ ] Conectar todos los gráficos a DB real
- [ ] Eliminar SLA mock (94.2%)
- [ ] Validar que muestre 0 o datos reales
- [ ] Asegurar que no haya errores con datos vacíos

**Estimación:** 2-3 horas  
**Dependencias:** Órdenes reales en DB

---

### 5. **Odoo Sync - Mejoras UI**
**Módulo:** Odoo  
**Impacto:** Medio - Mejorar experiencia de sincronización  
**Tareas:**
- [ ] Validar formulario de configuración
- [ ] Botón "Probar Conexión" siempre disponible
- [ ] Botón único "Sincronizar Todo" (en lugar de individuales)
- [ ] Agregar toasts de confirmación

**Estimación:** 2 horas  
**Dependencias:** Ninguna

---

### 6. **Servicios - Configuración SLA**
**Módulo:** Lab  
**Impacto:** Medio - Configuración precisa de tiempos  
**Tareas:**
- [ ] Validar botón "Sincronizar"
- [ ] Soporte para Días, Horas y Minutos en SLA
- [ ] Mantener distinción entre SLA de servicio vs SLA de lab

**Estimación:** 2 horas  
**Dependencias:** Ninguna

---

## 🟢 PRIORIDAD MEDIA (Refinamiento)

### 7. **KAMBA - Vista de Tabla**
**Módulo:** Lab  
**Impacto:** Medio - Alternativa de visualización  
**Tareas:**
- [ ] Implementar vista de tabla alternativa
- [ ] Detalle por etapa (cuántas órdenes en cada paso)
- [ ] Mantener interacción de clic para detalles

**Estimación:** 3-4 horas  
**Dependencias:** KAMBA básico funcionando

---

### 8. **Tiempos (SLA) - Selector Mejorado**
**Módulo:** Lab  
**Impacto:** Medio - UX mejorada  
**Tareas:**
- [ ] Eliminar mock data
- [ ] Selector de Horas y Minutos con icono de reloj
- [ ] UI intuitiva

**Estimación:** 1-2 horas  
**Dependencias:** Ninguna

---

### 9. **Rendimiento (Performance)**
**Módulo:** Lab  
**Impacto:** Medio - Validación de datos  
**Tareas:**
- [ ] Validar que todos los gráficos soporten datos reales
- [ ] Probar con diferentes volúmenes de datos

**Estimación:** 1-2 horas  
**Dependencias:** Datos reales en DB

---

## 🔵 PRIORIDAD BAJA (Organización)

### 10. **Modules Control - Mejora Visual**
**Módulo:** Admin  
**Impacto:** Bajo - Estético  
**Tareas:**
- [ ] Rediseñar vista para ser más amigable
- [ ] Agregar elementos gráficos informativos

**Estimación:** 2-3 horas  
**Dependencias:** Ninguna

---

### 11. **Órdenes - Reubicación**
**Módulo:** Admin  
**Impacto:** Bajo - Organización del menú  
**Tareas:**
- [ ] Mover menú de Órdenes a "Configuración Lab" en Settings
- [ ] Validar datos reales

**Estimación:** 1 hora  
**Dependencias:** Ninguna

---

## 📊 RESUMEN POR PRIORIDAD

| Prioridad | Tareas | Estimación Total | Impacto |
|-----------|--------|------------------|---------|
| 🔴 Crítica | 3 módulos | 9-13 horas | Funcionalidad core |
| 🟡 Alta | 3 módulos | 6-7 horas | UX y datos reales |
| 🟢 Media | 3 módulos | 5-8 horas | Refinamiento |
| 🔵 Baja | 2 módulos | 3-4 horas | Organización |
| **TOTAL** | **11 módulos** | **23-32 horas** | - |

---

## 🎯 RECOMENDACIÓN DE ORDEN DE EJECUCIÓN

### Sprint 1 (Crítico - ~10 horas)
1. **Odoo Control de Visualización** (4-6h) - Completar Fase 2
2. **KAMBA Mejoras Críticas** (2-3h) - Herramienta principal
3. **Gestión de Clínicas** (3-4h) - Vista administrativa

### Sprint 2 (Alto - ~6 horas)
4. **Lab Dashboard Datos Reales** (2-3h)
5. **Odoo Sync UI** (2h)
6. **Servicios SLA** (2h)

### Sprint 3 (Medio - ~6 horas)
7. **KAMBA Vista Tabla** (3-4h)
8. **Selector SLA** (1-2h)
9. **Performance Validation** (1-2h)

### Sprint 4 (Bajo - ~3 horas)
10. **Modules Control Visual** (2-3h)
11. **Reubicación Órdenes** (1h)

---

## ⚠️ NOTAS IMPORTANTES

### Dependencias Externas
- **Odoo debe estar corriendo** para probar sincronización
- **Datos de prueba** necesarios para validar dashboards
- **Órdenes reales** necesarias para KAMBA y Performance

### Tareas Completadas (Fase 2)
- ✅ Sincronización total de campos Odoo
- ✅ Normalización de datos
- ✅ Lógica de payment policy (cash/credit)
- ✅ Almacenamiento de raw_data
- ✅ Migración de base de datos

### Bloqueadores Conocidos
- ❌ Análisis de IMFOHSA Lab (pendiente por límite de browser)
- ⏳ Requiere captura manual o esperar reset

---

**Última actualización:** 2026-01-03 19:11
