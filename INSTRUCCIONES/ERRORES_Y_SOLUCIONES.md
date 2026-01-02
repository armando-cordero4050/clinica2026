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

### Lección Aprendida
Al modificar bloques de importación grandes, verificar siempre que no se estén eliminando componentes en uso, especialmente cuando se usan herramientas de "replace" con rangos de líneas.
