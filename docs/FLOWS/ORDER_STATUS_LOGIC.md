# Lógica de Estados Iniciales de Órdenes - DentalFlow

**Última Actualización**: 2026-01-02 22:05  
**Versión**: 1.1 (Corregida)

---

## 🎯 **FLUJO CORRECTO DE ESTADOS INICIALES**

Cuando un doctor crea una orden de laboratorio, el estado inicial depende del **tipo de entrega** seleccionado:

---

### 1️⃣ **DIGITAL** (Archivos STL/PLY/PDF)

**Tipo de Entrega**: `digital`  
**Estado Inicial**: `design` (Diseño)

**Flujo**:
```
Doctor selecciona "Digital"
  ↓
Adjunta archivos (STL, PLY, PDF)
  ↓
Confirma orden
  ↓
Orden creada con status = 'design'
  ↓
Aparece en Kanban en columna "Diseño"
```

**Razón**: Los archivos digitales van directo a diseño, no requieren procesamiento físico previo.

---

### 2️⃣ **ANALÓGICO - RECOLECCIÓN** (Logística recoge)

**Tipo de Entrega**: `pickup`  
**Estado Inicial**: `income_validation` (Ingresos)

**Flujo**:
```
Doctor selecciona "Recolección"
  ↓
Confirma orden
  ↓
Orden creada con status = 'income_validation'
  ↓
Aparece en Kanban en columna "Validación Ingreso"
  ↓
Logística ve la orden en /dashboard/logistics
  ↓
Courier se asigna y recoge
  ↓
Al recibir en lab, staff valida y mueve a siguiente etapa
```

**Razón**: Las muestras físicas deben pasar por validación de ingresos al llegar al laboratorio.

---

### 3️⃣ **ANALÓGICO - ENVÍO** (Doctor envía por mensajería)

**Tipo de Entrega**: `shipping`  
**Estado Inicial**: `clinic_pending` (Pendiente Clínica)

**Flujo**:
```
Doctor selecciona "Envío"
  ↓
Ingresa empresa de mensajería y No. de guía
  ↓
Confirma orden
  ↓
Orden creada con status = 'clinic_pending'
  ↓
Aparece en Kanban en columna "Pendiente Clínica"
  ↓
Doctor envía por su cuenta
  ↓
Al recibir en lab, staff mueve a 'income_validation'
```

**Razón**: La orden queda pendiente hasta que la clínica envíe las muestras por mensajería externa.

---

## 📊 **TABLA RESUMEN**

| Tipo de Entrega | delivery_type | Estado Inicial | Columna Kanban |
|-----------------|---------------|----------------|----------------|
| Digital | `digital` | `design` | Diseño |
| Recolección | `pickup` | `income_validation` | Validación Ingreso |
| Envío | `shipping` | `clinic_pending` | Pendiente Clínica |

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### RPC: `create_lab_order_rpc`

```sql
v_status := CASE 
    WHEN p_delivery_type = 'digital' THEN 'design'
    WHEN p_delivery_type = 'pickup' THEN 'income_validation'
    WHEN p_delivery_type = 'shipping' THEN 'clinic_pending'
    ELSE 'clinic_pending'
END;
```

### Archivo de Migración
- `supabase/migrations/20260102260000_fix_order_status_logic.sql`

---

## ✅ **VALIDACIÓN**

Para probar que funciona correctamente:

1. **Orden Digital**:
   - Crear orden → Seleccionar "Digital" → Adjuntar archivo
   - Verificar que aparece en columna "Diseño" del Kanban

2. **Orden Recolección**:
   - Crear orden → Seleccionar "Recolección"
   - Verificar que aparece en columna "Validación Ingreso"
   - Verificar que aparece en `/dashboard/logistics`

3. **Orden Envío**:
   - Crear orden → Seleccionar "Envío" → Ingresar guía
   - Verificar que aparece en columna "Pendiente Clínica"

---

## 📝 **NOTAS IMPORTANTES**

- ✅ El SLA se calcula automáticamente desde `services.sla_hours`
- ✅ La fecha de entrega NO es editable por el doctor
- ✅ Los archivos digitales se suben a Supabase Storage bucket `lab-files`
- ✅ Las órdenes de recolección aparecen automáticamente en el módulo de logística

---

**Fin del Documento**
