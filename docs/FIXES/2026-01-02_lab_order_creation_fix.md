# Fix: Lab Order Creation from Odontogram

**Fecha**: 2026-01-02
**Módulo**: Medical / Lab Orders
**Severidad**: Critical (bloqueaba creación de órdenes)

## Problema

El botón "Confirmar Pedido" en el modal de creación de órdenes de laboratorio no funcionaba. No se creaban las órdenes y no había feedback al usuario.

## Causa Raíz

1. **Permisos RLS**: El usuario con rol `clinic_admin` no tenía acceso directo a `schema_lab.orders` ni `schema_lab.order_items`
2. **Acceso directo a schema**: El código intentaba hacer `INSERT` directo usando `.schema('schema_lab').from('orders')`, lo cual fallaba con error `"Invalid schema: schema_0"`
3. **Falta de RPC**: No existía un RPC con `SECURITY DEFINER` para crear órdenes

## Solución Implementada

### 1. Creación del RPC `create_lab_order_rpc`

**Archivo**: `supabase/migrations/20260102220000_create_lab_order_rpc.sql`

```sql
CREATE OR REPLACE FUNCTION public.create_lab_order_rpc(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_patient_name TEXT,
    p_service_ids UUID[],
    p_is_digital BOOLEAN DEFAULT FALSE,
    p_notes TEXT DEFAULT NULL,
    p_due_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, schema_lab
```

**Características**:
- ✅ `SECURITY DEFINER`: Ejecuta con permisos elevados
- ✅ Calcula `total_price` automáticamente desde `schema_lab.services`
- ✅ Determina `status` inicial basado en `is_digital`
- ✅ Inserta orden y order_items en una sola transacción
- ✅ Retorna el UUID de la orden creada

### 2. Modificación de `createLabOrder`

**Archivo**: `src/modules/medical/actions/orders.ts`

**Antes**:
```typescript
const { data: newOrder, error: orderError } = await supabase
    .schema('schema_lab')
    .from('orders')
    .insert(payload)
    .select()
    .single()
```

**Después**:
```typescript
const { data: orderId, error: rpcError } = await supabase.rpc('create_lab_order_rpc', {
    p_clinic_id: clinicId,
    p_patient_id: data.patient_id,
    p_patient_name: data.patient_name,
    p_service_ids: data.items,
    p_is_digital: data.is_digital,
    p_notes: data.notes || null,
    p_due_date: data.estimated_delivery || null
})
```

### 3. Mejoras en UX

**Archivo**: `src/modules/medical/components/odontogram.tsx`

- ✅ Reemplazado `alert()` por `toast` notifications (usando `sonner`)
- ✅ Agregado `toast.loading()` durante la creación
- ✅ Agregado `toast.success()` / `toast.error()` según resultado
- ✅ Agregado `try-catch` para manejo de errores
- ✅ Agregado logs de consola para debugging

**Archivo**: `src/modules/medical/components/order-modal.tsx`

- ✅ Agregado logs de consola para tracing del flujo

## Flujo Completo

1. Usuario hace clic en superficie del diente → Abre modal de hallazgo
2. Selecciona hallazgo + servicio → Guarda tratamiento
3. Aparece en tabla con botón "Pedir" (solo si `isLabService === true`)
4. Click en "Pedir" → Abre `OrderModal`
5. Click en "Confirmar Pedido" → Llama `handleConfirmOrder`
6. `handleConfirmOrder` extrae `serviceIds` de findings
7. Llama `createLabOrder` (Server Action)
8. `createLabOrder` llama RPC `create_lab_order_rpc`
9. RPC crea orden + items en `schema_lab`
10. Retorna UUID de orden
11. Toast de éxito + cierra modal + actualiza estado local

## Testing

✅ Creación de orden desde odontograma
✅ Visualización en módulo de órdenes (`/dashboard/medical/orders`)
✅ Visualización en pestaña de paciente
✅ Cálculo correcto de precio total
✅ Estado inicial correcto (`digital_picking` o `clinic_pending`)

## Archivos Modificados

1. `supabase/migrations/20260102220000_create_lab_order_rpc.sql` (nuevo)
2. `src/modules/medical/actions/orders.ts` (modificado)
3. `src/modules/medical/components/odontogram.tsx` (modificado)
4. `src/modules/medical/components/order-modal.tsx` (modificado)

## Notas Importantes

⚠️ **NO ELIMINAR** el RPC `create_lab_order_rpc` - es crítico para que `clinic_admin` pueda crear órdenes
⚠️ **NO CAMBIAR** a acceso directo a `schema_lab` - siempre usar RPCs con `SECURITY DEFINER`
⚠️ El modal y la lógica de "Pedir" están funcionando correctamente - **NO MODIFICAR** sin revisar este documento

## Próximos Pasos (Opcional)

- [ ] Agregar campo `doctor_name` real (actualmente usa email)
- [ ] Agregar `tooth_number` a order_items (actualmente NULL)
- [ ] Implementar actualización de estado en findings después de crear orden
- [ ] Agregar validación de servicios duplicados
