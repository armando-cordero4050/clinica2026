# Registro de Errores y Soluciones de Aprendizaje

Este documento es una base de conocimiento viva. Cada vez que ocurra un error técnico, de arquitectura o de base de datos, se debe registrar aquí con su solución para evitar reincidencias.

---

## 2026-02-01: Error 42P01 en Reset Script

### Error
`ERROR: 42P01: relation "schema_core.clinic_staff" does not exist` al intentar truncar tablas en `reset_all_data.sql`.

### Causa
Se asumió incorrectamente que la tabla se llamaba `clinic_staff`, probablemente por confusión con nomenclatura de otros proyectos o versiones anteriores.

### Investigación
Revisando el código en `src/modules/medical/actions/orders.ts` y migraciones anteriores, se confirmó que la tabla correcta es **`schema_core.clinic_members`**.

### Solución
1. Corregir el script SQL cambiando `clinic_staff` por `clinic_members`.
2. Registrar la estructura correcta en `DB_SCHEMA.md`.

### Lección Aprendida
**NUNCA** adivinar nombres de tablas en scripts de mantenimiento. Siempre consultar `INSTRUCCIONES/DB_SCHEMA.md` o verificar `supabase/migrations` antes de escribir `TRUNCATE` o `DROP`.

---

## 2026-02-01: Error de "Cascading Renders" en useEffect

### Error
`Error: Calling setState synchronously within an effect can trigger cascading renders` en `src/app/dashboard/settings/sla/page.tsx`.

### Causa
Se llamaba a `setLoading(true)` dentro de una función asíncrona que era invocada directamente en el cuerpo de un `useEffect`. Al ser una actualización de estado síncrona al inicio del efecto, React advierte sobre posibles bucles de renderizado infinito o degradación de performance.

### Solución
Eliminar el `setLoading(true)` síncrono si no es estrictamente necesario o usar un patrón de inicialización fuera del efecto si el estado ya está definido. En este caso, se removió la llamada síncrona para permitir que el loader se maneje de forma asíncrona.

### Lección Aprendida
Evitar actualizaciones de estado críticas de forma síncrona inmediatamente después de montar un componente si se pueden manejar mediante estados iniciales o promesas asíncronas limpias.

---

## 2026-02-01: Iconos de Lucide "Missing" tras Refactor

### Error
`Cannot find name 'Pause'`, `Cannot find name 'Play'`, `Cannot find name 'CheckCircle2'` en `global-kamba.tsx`.

### Causa
Al añadir nuevos iconos (`TableIcon`, `LayoutGrid`) en el bloque de importación de `lucide-react`, se eliminaron accidentalmente los iconos preexistentes debido a una selección parcial de líneas.

### Solución
Restaurar los iconos faltantes en el objeto de importación de la librería.

---

## 2026-02-05: Error 42702: column reference "id" is ambiguous

### Error
`42702: column reference "id" is ambiguous` en la función RPC `get_lab_kanban`.

### Causa
Cuando una función usa `RETURNS TABLE`, el nombre de las columnas de salida entra en conflicto con las columnas de las tablas si se llaman igual (ej: `id`).

### Solución
Utilizar la directiva `#variable_conflict use_column` dentro del bloque de la función PL/pgSQL:
```sql
CREATE OR REPLACE FUNCTION ... RETURNS TABLE (...) AS $$
#variable_conflict use_column
BEGIN
  ...
END;
$$;
```

### Lección Aprendida
Siempre calificar las columnas con aliases (`o.id`, `p.id`) y usar `#variable_conflict` para evitar colisiones con parámetros de salida.

---

## 2026-02-05: Error: operator does not exist: text = uuid

### Error
`operator does not exist: text = uuid` al intentar unir `public.orders` con `public.patients`.

### Causa
En la tabla espejo `public.orders`, `patient_id` se almacenó como `TEXT`, mientras que en `public.patients` la PK es `UUID`.

### Solución
Castear el `TEXT` a `UUID` de forma segura validando el formato con Regex:
```sql
LEFT JOIN public.patients p ON (CASE WHEN o.patient_id ~ '^[0-9a-fA-F-]{36}$' THEN o.patient_id::UUID ELSE NULL END) = p.id
```

### Lección Aprendida
No asumir tipos de datos entre esquemas diferentes (`schema_medical` vs `public`). Siempre verificar `information_schema.columns`.


### Lección Aprendida
Al modificar bloques de importación grandes, verificar siempre que no se estén eliminando componentes en uso, especialmente cuando se usan herramientas de "replace" con rangos de líneas.

---

## 2026-01-03: Error: "You're importing a component that needs useState"

### Error
```
You're importing a component that needs `useState`. 
This React Hook only works in a Client Component. 
To fix, mark the file (or its parent) with the `"use client"` directive.
```

### Contexto
Next.js 14+ con App Router distingue entre Server Components y Client Components.

### Causa
- Usar hooks de React (`useState`, `useEffect`, etc.) en un Server Component
- Next.js por defecto trata todos los componentes como Server Components
- Los hooks solo funcionan en Client Components

### Solución
Agregar la directiva `'use client'` al inicio del archivo:

```typescript
'use client'

import { useState } from 'react'
// ... resto del código
```

### Cuándo usar 'use client'
- Cuando uses hooks de React (useState, useEffect, useContext, etc.)
- Cuando uses event handlers (onClick, onChange, etc.)
- Cuando uses browser APIs (window, localStorage, etc.)
- Cuando uses librerías que dependen del navegador

### Cuándo NO usar 'use client'
- Componentes que solo renderizan contenido estático
- Componentes que hacen data fetching con async/await
- Componentes que usan Server Actions directamente

### Ejemplo Completo
```typescript
// ❌ INCORRECTO - Sin 'use client'
import { useState } from 'react'

export default function MyComponent() {
  const [count, setCount] = useState(0) // Error!
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// ✅ CORRECTO - Con 'use client'
'use client'

import { useState } from 'react'

export default function MyComponent() {
  const [count, setCount] = useState(0) // Funciona!
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Archivo Afectado
- `src/app/dashboard/settings/page.tsx`

### Fecha
2026-01-03

---

## 2026-01-03: Botón "Guardar" colgado en Creación de Staff

### Error
El formulario de creación de staff (`AddStaffDialog`) se quedaba en estado "Sincronizando..." indefinidamente o no completaba la acción. Los logs mostraban error pero la UI no reaccionaba claramente para el usuario.

### Causa
La clínica actual ("Clinica 1") no tenía un `odoo_partner_id` asignado en la base de datos local (`schema_medical.clinics`). El backend validaba esto y retornaba error, pero el frontend no manejaba visualmente la falta de sincronización previa.

### Diagnóstico
Se implementó un sistema de "Flight Recorder" (`src/lib/logger.ts`) que escribió en `logs/debug.log`. El log reveló:
`[ERROR] Clinic has no Odoo ID`

### Solución
1.  **Inmediata**: Se creó un script (`sync-repair.ts`) para buscar la clínica en Odoo por email y enlazarla.
2.  **Permanente**: Se añadió un botón **"Reparar Vínculos Odoo"** en `Dashboard > Settings > Mantenimiento` para que el admin pueda corregir esto sin tocar código.
3.  **Prevención**: Se añadirá validación bloqueante en UI si la clínica no está sincronizada.
