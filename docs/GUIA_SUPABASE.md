# Guía de Conexión "Agentic DB Bridge" para Supabase

Esta guía documenta la solución definitiva para conectar agentes de IA (o entornos locales restringidos) a la base de datos de Supabase, superando las limitaciones comunes de red como IPv6-only, bloqueos de puertos TCP (5432/6543) y fallos de SNI en Poolers.

## 1. El Problema

Al intentar conectar Node.js (`pg`) con Supabase desde ciertos entornos locales o agentes:
*   **IPv6 Force:** Supabase usa IPv6 por defecto. Muchas redes locales/Docker solo resuelven IPv4.
*   **Timeouts TCP:** Los puertos 5432 y 6543 suelen estar bloqueados o filtrados.
*   **SNI Failures:** Los Transaction Poolers requieren que el cliente envíe el Hostname exacto (SNI) en el handshake SSL. Librerías básicas o conexiones por IP directa fallan aquí (`Tenant or user not found`).

## 2. La Solución: HTTP RPC Bridge

En lugar de luchar contra la capa de red (TCP/IP), utilizamos la capa de aplicación (HTTP/HTTPS) que ya funciona (puerto 443).
Creamos una función remota (RPC) segura en la base de datos que acepta SQL crudo y lo ejecuta.

### Ventajas
*   ✅ Funciona en cualquier red con acceso a Internet (HTTPS).
*   ✅ No requiere configurar IPv4 Add-ons ($) ni VPNs.
*   ✅ Utiliza `service_role` key para autenticación robusta.

---

## 3. Implementación Paso a Paso

### Paso 1: Crear la Función RPC (SQL)

Ejecuta este SQL en el **Supabase Dashboard > SQL Editor**.
Esto crea una "puerta trasera segura" que solo puede abrir tu clave de servicio.

```sql
-- Función para ejecutar SQL arbitrario vía HTTP
-- IMPORTANTE: Crear en schema 'public' para que supabase-js la encuentre fácil.

CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- CONFIANZA EN GATEWAY: 
    -- Si esta función se ejecuta, asumimos que el usuario pasó la barrera de autenticación 
    -- de la API Gateway con la 'service_role key'.
    -- (Asegúrate de REVOCAR permisos a public/anon).

    IF lower(sql_query) LIKE 'select%' OR lower(sql_query) LIKE 'with%' THEN
        EXECUTE 'SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM (' || sql_query || ') t' INTO result;
        RETURN result;
    ELSE
        EXECUTE sql_query;
        RETURN jsonb_build_object('status', 'success');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Seguridad CRÍTICA: Bloquear acceso público, permitir solo a Admin (Service Role)
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
```

### Paso 2: Configurar Variables de Entorno (.env)

Necesitas la URL del proyecto y la **Service Role Key** (la secreta, `service_role`, NO la `anon`).

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsIn... (Tu clave secreta)
```

> **Nota de Seguridad:** NUNCA expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend (`NEXT_PUBLIC_...`). Úsala solo en scripts locales o backend.

### Paso 3: Script Ejecutor (Node.js/TypeScript)

Instala las dependencias:
```bash
npm install @supabase/supabase-js dotenv
```

Crea el script puente `scripts/db-executor-rpc.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Cargar .env
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) process.env[k] = envConfig[k];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SERVICE_KEY) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');

// Cliente Supabase con Service Key
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
    // A veces necesario forzar header
  global: { headers: { Authorization: `Bearer ${SERVICE_KEY}` } }
});

async function run() {
  const mode = process.argv[2]; // query | file
  const payload = process.argv[3];
  
  let sql = mode === 'file' ? fs.readFileSync(payload, 'utf-8') : payload;

  console.log(`⚡ Ejecutando SQL vía RPC...`);
  
  // Llamada a la función
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Error RPC:', error);
    process.exit(1);
  }

  console.log('✅ Resultado:', JSON.stringify(data, null, 2));
}

run();
```

## 4. Uso

Para ejecutar un comando SQL simple:
```bash
npx tsx scripts/db-executor-rpc.ts query "SELECT version();"
```

Para ejecutar un archivo de migración/reset:
```bash
npx tsx scripts/db-executor-rpc.ts file supabase/migrations/reset_db.sql
```

## 5. Limitaciones Conocidas

*   **No es Superuser:** El rol `service_role` no es `postgres` (root). No puede ejecutar comandos como `SET session_replication_role` (usado para desactivar triggers masivamente).
    *   *Solución:* Usar `TRUNCATE TABLE x CASCADE` en lugar de desactivar FKs.
*   **Transacciones:** Cada llamada RPC es su propia transacción atómica si falla. No puedes iniciar una transacción en una llamada y validarla en otra.
*   **Timeouts HTTP:** Para scripts muy largos de migración, la Gateway de Supabase puede dar timeout (aprox 60s). Divide scripts grandes en partes.
