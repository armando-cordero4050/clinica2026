# 📅 Calendario de Laboratorio & Revisión de Capacidad

**Fecha de Creación:** 2026-01-04  
**Estado:** 📝 Planificación  
**Prioridad:** Media  

---

## 🎯 Objetivo

Implementar un sistema de visualización de capacidad del laboratorio mediante un calendario que muestre:
1. Órdenes recibidas por día (según fecha de solicitud)
2. Órdenes a entregar por día (según fecha de entrega)

Esto permitirá al doctor verificar la disponibilidad del laboratorio antes de confirmar una orden.

---

## 📊 Lógica de Capacidad

### **Consulta de Órdenes Activas**

**Query Base:**
```sql
SELECT 
    id,
    order_number,
    created_at,
    target_delivery_date,
    status,
    priority
FROM lab_orders
WHERE status NOT IN ('finalizado', 'entregado', 'cancelado')
ORDER BY target_delivery_date ASC
```

**Criterios:**
- ✅ Incluir todas las órdenes que NO estén finalizadas
- ✅ Estados activos: `pendiente`, `en_proceso`, `listo_para_entrega`, `en_transito`
- ✅ Agrupar por fecha de solicitud (`created_at`)
- ✅ Agrupar por fecha de entrega (`target_delivery_date`)

---

## 🗓️ Calendario de Laboratorio

### **Ubicación:**
- **Módulo Core**: `/dashboard/core/lab-calendar`
- **Módulo Lab**: `/dashboard/lab/calendar`

### **Visualización:**

#### **Vista Mensual:**
```
┌─────────────────────────────────────────────────┐
│         Enero 2026 - Calendario Lab             │
├─────┬─────┬─────┬─────┬─────┬─────┬─────────┤
│ Dom │ Lun │ Mar │ Mié │ Jue │ Vie │ Sáb     │
├─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│     │     │     │  1  │  2  │  3  │   4     │
│     │     │     │ 🟢3 │ 🔴2 │ 🟢5 │  🔴1    │
│     │     │     │ 🔴1 │ 🟢4 │ 🔴3 │  🟢2    │
├─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│  5  │  6  │  7  │  8  │  9  │ 10  │  11     │
│ 🟢2 │ 🔴4 │ 🟢6 │ 🔴2 │ 🟢3 │ 🔴5 │  🟢1    │
│ 🔴1 │ 🟢3 │ 🔴2 │ 🟢1 │ 🔴4 │ 🟢2 │  🔴3    │
└─────┴─────┴─────┴─────┴─────┴─────┴─────────┘

Leyenda:
🟢 = Órdenes Recibidas (fecha de solicitud)
🔴 = Órdenes a Entregar (fecha de entrega)
```

### **Colores:**
- **🟢 Verde**: Órdenes recibidas ese día (`created_at`)
- **🔴 Rojo**: Órdenes a entregar ese día (`target_delivery_date`)
- **🟡 Amarillo**: Órdenes Express (prioridad alta)
- **⚪ Gris**: Días sin actividad

---

## 🔍 Función "Revisar Capacidad"

### **Ubicación:**
- Botón en Paso 2 del Wizard: "Revisar Capacidad"

### **Comportamiento:**

1. **Click en "Revisar Capacidad"**
   - Abre un modal/drawer con el calendario
   - Muestra el mes actual y siguientes 2 meses
   - Resalta la fecha seleccionada/calculada

2. **Información Mostrada:**
   ```
   ┌─────────────────────────────────────────┐
   │ Capacidad del Laboratorio               │
   ├─────────────────────────────────────────┤
   │ Fecha Seleccionada: 7 de enero, 2026    │
   │                                         │
   │ Órdenes a Entregar ese día: 3           │
   │ ├─ Normal: 2                            │
   │ └─ Express: 1                           │
   │                                         │
   │ Órdenes Recibidas ese día: 5            │
   │                                         │
   │ Estado: ✅ Capacidad Disponible         │
   │                                         │
   │ Sugerencia: Fecha óptima                │
   └─────────────────────────────────────────┘
   ```

3. **Indicadores de Capacidad:**
   - ✅ **Verde**: Menos de 5 órdenes a entregar → Capacidad disponible
   - ⚠️ **Amarillo**: 5-10 órdenes a entregar → Capacidad limitada
   - 🔴 **Rojo**: Más de 10 órdenes a entregar → Sobrecargado

4. **Acciones:**
   - **Cerrar**: Volver al wizard sin cambios
   - **Sugerir Fecha**: Proponer fecha alternativa con menor carga
   - **Confirmar**: Mantener fecha seleccionada

---

## 📋 Estructura de Datos

### **Agregación por Fecha:**

```typescript
interface DayCapacity {
    date: string;                    // "2026-01-07"
    ordersReceived: number;          // Órdenes recibidas ese día
    ordersToDeliver: number;         // Órdenes a entregar ese día
    expressOrders: number;           // Órdenes Express
    status: 'available' | 'limited' | 'overloaded';
    orders: {
        id: string;
        order_number: string;
        priority: 'normal' | 'urgent';
        status: string;
    }[];
}
```

### **Query de Agregación:**

```sql
-- Órdenes a entregar por día
SELECT 
    DATE(target_delivery_date) as delivery_date,
    COUNT(*) as total_orders,
    SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as express_orders
FROM lab_orders
WHERE status NOT IN ('finalizado', 'entregado', 'cancelado')
GROUP BY DATE(target_delivery_date)
ORDER BY delivery_date ASC;

-- Órdenes recibidas por día
SELECT 
    DATE(created_at) as received_date,
    COUNT(*) as total_received
FROM lab_orders
WHERE status NOT IN ('cancelado')
GROUP BY DATE(created_at)
ORDER BY received_date ASC;
```

---

## 🎨 Componentes a Crear

### **1. LabCalendar Component**
- **Ubicación**: `src/components/lab/lab-calendar.tsx`
- **Props**:
  - `selectedDate`: Fecha seleccionada/calculada
  - `onDateSelect`: Callback al seleccionar fecha
  - `highlightDates`: Fechas a resaltar

### **2. CapacityReviewModal Component**
- **Ubicación**: `src/components/lab/capacity-review-modal.tsx`
- **Props**:
  - `open`: Boolean
  - `onClose`: Callback
  - `targetDate`: Fecha a revisar
  - `onConfirm`: Callback con fecha confirmada

### **3. Server Action**
- **Ubicación**: `src/modules/core/lab-calendar/actions.ts`
- **Funciones**:
  - `getLabCapacity(startDate, endDate)`: Obtener capacidad por rango
  - `getCapacityByDate(date)`: Obtener capacidad de un día específico
  - `suggestOptimalDate(sla_days)`: Sugerir mejor fecha según carga

---

## 🚀 Fases de Implementación

### **Fase 1: Backend (1-2 horas)**
- [ ] Crear server action `getLabCapacity()`
- [ ] Implementar query de agregación
- [ ] Crear tipos TypeScript

### **Fase 2: Componente Calendario (2-3 horas)**
- [ ] Crear `LabCalendar` component
- [ ] Integrar con `react-day-picker` o similar
- [ ] Estilizar con colores por capacidad

### **Fase 3: Modal de Revisión (1-2 horas)**
- [ ] Crear `CapacityReviewModal`
- [ ] Integrar calendario
- [ ] Mostrar estadísticas del día

### **Fase 4: Integración con Wizard (1 hora)**
- [ ] Conectar botón "Revisar Capacidad"
- [ ] Pasar fecha calculada al modal
- [ ] Permitir cambio de fecha si es Express

### **Fase 5: Página de Calendario (2 horas)**
- [ ] Crear ruta `/dashboard/core/lab-calendar`
- [ ] Vista completa del calendario
- [ ] Filtros por estado, prioridad, etc.

---

## 📊 Métricas a Mostrar

### **En el Calendario:**
- Total de órdenes por día
- Órdenes Express vs Normal
- Tendencia semanal/mensual

### **En el Modal:**
- Capacidad del día seleccionado
- Comparación con días anteriores
- Sugerencia de fecha óptima
- Tiempo promedio de entrega

---

## 🔐 Permisos

### **Acceso al Calendario:**
- ✅ `super_admin`: Full access
- ✅ `lab_admin`: Full access
- ✅ `lab_staff`: Read-only
- ✅ `clinic_admin`: Read-only (solo para revisar capacidad)
- ✅ `clinic_doctor`: Read-only (solo para revisar capacidad)
- ❌ `clinic_staff`: No access
- ❌ `patient`: No access

---

## 📝 Notas Adicionales

### **Consideraciones:**
1. **Días Hábiles**: El calendario debe respetar días hábiles (lunes a viernes)
2. **Feriados**: Considerar feriados nacionales (próxima fase)
3. **Capacidad Máxima**: Definir límite de órdenes por día (configurable)
4. **Notificaciones**: Alertar al lab cuando se acerque a capacidad máxima

### **Integraciones Futuras:**
- [ ] Sincronizar con calendario de Google/Outlook
- [ ] Enviar recordatorios de entregas próximas
- [ ] Dashboard de métricas de capacidad
- [ ] Predicción de carga con ML

---

**Creado por:** Antigravity AI  
**Aprobado por:** Usuario  
**Estado:** 📝 Pendiente de implementación
