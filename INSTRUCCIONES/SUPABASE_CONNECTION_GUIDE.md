# Guía de Conexión y Ejecución SQL - Supabase

Este documento detalla los métodos autorizados para interactuar con la base de datos de DentalFlow, ya sea para aplicar migraciones o ejecutar consultas administrativas mediante RPC.

---

## 1. Conexión Estándar (Prisma/Migrations)
Para cambios de estructura permanentes que se guardan en el repositorio.

- **Variable:** `DATABASE_URL` (encontrada en `.env`)
- **Herramienta:** `scripts/apply_migration.ts`
- **Comando:**
  ```powershell
  npx tsx scripts/apply_migration.ts supabase/migrations/nombre_archivo.sql
  ```
- **Nota:** Requiere conexión a internet estable y que la IP esté permitida en el firewall de Supabase si aplica.

---

## 2. Ejecutor de SQL vía RPC (db-executor-rpc.ts)
Este método es el más potente y se usa para ejecutar SQL directamente desde el entorno del agente, saltándose restricciones de red directas mediante una función segura en Supabase.

### Prerrequisitos
1. Debe existir la función `public.exec_sql(sql_query text)` en Supabase (definida en `supabase/migrations/20260201999999_public_exec_sql.sql`).
2. Se requiere la `SUPABASE_SERVICE_ROLE_KEY` en el archivo `.env`.

### Cómo ejecutar consultas (Raw Query)
Útil para inspecciones rápidas o actualizaciones menores.
```powershell
npx tsx scripts/db-executor-rpc.ts query "SELECT * FROM public.users LIMIT 1"
```

### Cómo ejecutar archivos SQL
Ideal para aplicar arreglos rápidos o scripts de limpieza complejos.
```powershell
npx tsx scripts/db-executor-rpc.ts file mi_script_fix.sql
```

---

## 3. Resolución de Problemas Comunes

### Error: `plpgsql.variable_conflict` permission denied
- **Causa:** Intentar ejecutar un comando `SET` dentro de una transacción RPC sin privilegios de superusuario total en la sesión.
- **Solución:** Usar el prefijo `#variable_conflict use_column` dentro del cuerpo de la función PL/pgSQL en lugar del comando `SET` a nivel de definición.

### Error: `operator does not exist: text = uuid`
- **Causa:** Comparar una columna `TEXT` (común en importaciones de Odoo o tablas espejo `public`) con un `UUID`.
- **Solución:** Casteo explícito o validación de Regex:
  ```sql
  WHERE (CASE WHEN text_col ~ '^[0-9a-fA-F-]{36}$' THEN text_col::UUID ELSE NULL END) = uuid_col
  ```

### Error: `relation "public.profiles" does not exist`
- **Causa:** En la arquitectura V5, la tabla de perfiles se unificó en **`public.users`**.
- **Solución:** Siempre consultar `public.users` para obtener roles y nombres de usuario.

### Error: `function name is not unique` (RPC Updates)
- **Causa:** Al actualizar RPCs con cambio de argumentos sin borrar la anterior.
- **Solución:** Ejecutar script "nuclear" de limpieza antes de aplicar la migración (ver `scripts/nuclear_drop_function.sql`).

---

## 4. Tipos de Datos Clave
- **`order_number`**: `TEXT` (Generado automáticamente o manual).
- **`patient_id`**: `TEXT` en tablas `public` para compatibilidad externa, `UUID` en `schema_medical`.
- **`status`**: `TEXT` (Enum de estados del Kambra).
