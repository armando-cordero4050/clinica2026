# Sesión: Implementación Módulo Catálogo Lab & Refinamiento Odontograma

**Fecha:** 2026-01-04  
**Duración:** ~3 horas  
**Modelo:** Claude 4.5 Sonnet

---

## 🎯 Objetivos de la Sesión

1. Refinar la lógica de precios en el Odontograma para servicios de laboratorio
2. Definir estrategia de integración Odoo para materiales dentales
3. Crear módulo CRUD de Catálogo de Materiales en Core/Admin
4. Implementar lógica de "Orden Express" con impacto visual

---

## 📋 Decisiones Arquitectónicas Tomadas

### 1. **Pricing Logic en Odontograma (Lab vs Clinic)**

**Problema:** El Odontograma mostraba campos de precio para servicios de laboratorio, pero el precio real se define en el Wizard (según material, marca, etc.).

**Solución Implementada:**
- Cuando el usuario selecciona un hallazgo de categoría `'lab'` (Corona, Puente, etc.), se **oculta** la sección de "Servicio y Precio".
- Se muestra un mensaje informativo: *"El precio final y los detalles del material se definirán en el siguiente paso (Asistente de Laboratorio)."*
- **Archivo modificado:** `src/modules/medical/components/odontogram.tsx` (líneas 783-843).

**Justificación:** Evita confusión al usuario y mantiene la integridad del flujo de negocio (Odontograma = Diagnóstico, Wizard = Especificación Técnica + Precio).

---

### 2. **Estrategia de Integración Odoo para Materiales Dentales**

**Pregunta del Usuario:** ¿Existe `lab_materials` en Odoo? ¿Cómo sincronizar el catálogo?

**Decisión:**
- **Opción B (Elegida):** DentalFlow es la "Source of Truth" para la lógica clínica.
- Odoo solo maneja la parte financiera/contable (Facturas, Inventario).
- **NO** modelar la complejidad dental (Zirconio, Colores VITA, etc.) en Odoo.

**Implementación:**
- Crear tablas `lab_materials` y `lab_configurations` en **Supabase**.
- Campo `odoo_product_id` en `lab_configurations` para mapear a productos genéricos de Odoo (ej: "Servicio de Laboratorio - Zirconio").
- Sincronización unidireccional: DentalFlow → Odoo (solo para facturación).

**Justificación:** Odoo es un ERP genérico. Desarrollar módulos personalizados en Odoo es costoso y difícil de mantener. DentalFlow, como vertical de nicho, debe manejar su propia lógica de negocio.

---

### 3. **Módulo Admin: Catálogo de Materiales (CRUD)**

**Propuesta del Usuario:** Crear un módulo en Core/Admin para agregar materiales, variantes, marcas y precios manualmente.

**Decisión:**
- **Sí, proceder con módulo CRUD.**
- Ubicación: `Configuración Lab > Materiales` en el panel de Admin.
- Funcionalidad:
  - Tabla editable para agregar/editar/eliminar materiales.
  - Campos: Nombre, Variante, Precio Base (GTQ), SLA (días), Código Odoo (opcional).
  - Validación: No permitir duplicados exactos (nombre + variante).

**Beneficios:**
- Libertad total para actualizar catálogo sin tocar código.
- Escalabilidad: Si Imfohsalab lanza "Zirconio 4D Pro", se agrega desde la UI.
- Independencia de scripts hardcodeados.

**Estructura de Tablas:**
```sql
lab_materials (id, name, description, is_active, created_at, updated_at)
lab_configurations (id, material_id, name, code, odoo_product_id, base_price, price_type, sla_days, is_express_allowed, is_active, created_at, updated_at)
```

---

### 4. **Lógica de "Orden Express"**

**Requerimiento:** Las órdenes urgentes deben:
1. Permitir selección manual de fecha (anulando SLA automático).
2. Mostrar advertencia: *"Consulte a su asesor para validar el costo del servicio express."*
3. **Impacto Visual:**
   - En Kamba: Borde rojo, icono 🔥, etiqueta "EXPRESS".
   - En Estadísticas: Conteo separado (Express vs Normal).

**Implementación Pendiente:**
- Campo `is_express` (BOOLEAN) en tabla `lab_orders`.
- Campo `priority` (ENUM: 'standard', 'urgent') para filtros.
- Checkbox "Orden Express" en Wizard (Paso 2).
- Mensaje de advertencia condicional.

---

## 🛠️ Trabajo Realizado

### Código Modificado

1. **`src/modules/medical/components/odontogram.tsx`**
   - Líneas 783-843: Lógica condicional para ocultar precio en servicios lab.
   - Mensaje informativo agregado.

2. **`docs/TASK_STATUS.md`**
   - Actualizada Fase 2.5 con nuevo plan (Módulo CRUD + Wizard).

3. **`supabase/migrations/20260205000070_create_lab_catalog_tables.sql`**
   - Creada (múltiples iteraciones debido a errores RPC).
   - **Estado:** Pendiente de ejecución exitosa.

### Scripts Creados

1. **`scripts/introspect_supabase_schema.ts`**
   - Introspección completa del esquema de Supabase.
   - Genera `INSTRUCCIONES/SUPABASE_SCHEMA.md`.

---

## ❌ Problemas Encontrados

### 1. **Fallos Recurrentes en Ejecución SQL via RPC**

**Causa Raíz:**
- Tabla `lab_materials` preexistente con esquema incompatible (columna `slug` no definida en nuestro script).
- `CREATE TABLE IF NOT EXISTS` protegía la tabla vieja en lugar de actualizarla.
- Errores en cadena: Al fallar una parte del script (ej. Policies RLS), el RPC abortaba toda la transacción.

**Intentos de Solución:**
1. Envolver `ENABLE ROW LEVEL SECURITY` en bloques `DO ... EXCEPTION`.
2. Agregar `DROP TABLE IF EXISTS ... CASCADE` al inicio.
3. Simplificar script (solo CREATE + SEED, sin RLS/Policies).

**Estado Actual:**
- Error persistente: `"lab_configurations" is not a table`.
- Hipótesis: El RPC `exec_sql` tiene limitaciones o permisos restrictivos.

**Próximos Pasos:**
- Ejecutar migración directamente en Supabase Dashboard (SQL Editor).
- O usar CLI de Supabase: `supabase db push`.

---

## 📊 Estado de la Base de Datos (Snapshot)

**Generado:** 2026-01-05T03:54:03.377Z  
**Archivo:** `INSTRUCCIONES/SUPABASE_SCHEMA.md`

### Tablas Existentes

| Tabla | Filas | Estado |
|-------|-------|--------|
| `clinics` | 3 | ✅ |
| `users` | 3 | ✅ |
| `patients` | 1 | ✅ |
| `appointments` | 0 | ✅ |
| `lab_orders` | 0 | ✅ |
| `lab_order_items` | 0 | ✅ |
| `lab_stages` | 0 | ✅ |
| `lab_services` | 0 | ✅ |
| `dental_chart` | 0 | ✅ |
| `budgets` | 0 | ✅ |
| `budget_items` | 0 | ✅ |
| `odoo_customers` | 3 | ✅ |
| `odoo_products` | 1 | ✅ |
| `settings` | 0 | ✅ |

**Tablas Faltantes (a crear):**
- `lab_materials`
- `lab_configurations`

---

## 📝 Plan Actualizado (TASKv3)

### Fase 2.5: Wizard Avanzado & Módulo Catálogo

**Objetivo:** Crear herramienta administrativa para gestión de materiales y refinar Wizard con SLA estricto.

#### ⏳ **Módulo Admin: Catálogo de Materiales (CRUD)**
- [ ] **Backend**: Crear tablas `lab_materials` y `lab_configurations` con soporte de precios y variantes.
- [ ] **Frontend**: Crear vista `Configuración Lab > Materiales` en Core/Admin.
- [ ] **Funcionalidad**: Tabla editable para agregar Nombres, Variantes, Precios Base y SLA.
- [ ] **Odoo**: Campo opcional `odoo_product_id` para mapeo futuro.

#### ⏳ **Lógica de Fechas (Strict SLA)**
- [ ] Deshabilitar input de fecha por defecto en Wizard.
- [ ] Implementar Checkbox "Orden Express".
- [ ] Mensaje fijo de advertencia para Express.

#### ⏳ **Wizard UI Final**
- [ ] Conectar pasos del Wizard a la nueva tabla `lab_materials` real (DB).
- [ ] Actualizar paso 3 (Review) para reflejar prioridad y fecha final bloqueada.

---

## 🔄 Próximos Pasos Inmediatos

1. **Ejecutar migración SQL manualmente** en Supabase Dashboard.
2. **Verificar creación de tablas** `lab_materials` y `lab_configurations`.
3. **Seed data inicial** con catálogo Imfohsalab (Zirconio, E-MAX, Metal, PMMA).
4. **Crear módulo Frontend** (CRUD) en `src/modules/core/lab-materials/`.
5. **Actualizar Wizard** para consumir datos de `lab_configurations`.

---

## 📚 Documentos Actualizados

- ✅ `docs/TASK_STATUS.md` - Plan TASKv3
- ✅ `INSTRUCCIONES/SUPABASE_SCHEMA.md` - Snapshot de DB
- ⏳ `INSTRUCCIONES/DECISIONS.md` - Pendiente (agregar decisiones de esta sesión)
- ⏳ `docs/LAB_ORDER_LOGIC.md` - Pendiente (actualizar con lógica Express)

---

## 💡 Lecciones Aprendidas

1. **RPC `exec_sql` tiene limitaciones:** Para migraciones complejas (DROP/CREATE/ALTER), es más confiable usar el SQL Editor de Supabase o CLI.
2. **Introspección de DB es crítica:** Antes de crear queries, siempre verificar el estado actual de la DB para evitar conflictos de esquema.
3. **Separar concerns:** Odontograma (Diagnóstico) ≠ Wizard (Especificación Técnica). Mantener esta separación evita confusión en la UX.
4. **Flexibilidad > Hardcoding:** Un módulo CRUD para materiales es más escalable que scripts de seed data estáticos.

---

## 🎯 Métricas de la Sesión

- **Archivos Modificados:** 3
- **Archivos Creados:** 3
- **Migraciones Intentadas:** 1 (pendiente de éxito)
- **Scripts de Utilidad:** 1 (introspección de schema)
- **Decisiones Arquitectónicas:** 4
- **Tokens Utilizados:** ~75,000 / 200,000

---

**Fin de Sesión**
