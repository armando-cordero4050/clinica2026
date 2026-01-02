# MEMORIA DEL PROYECTO DENTALFLOW

**Última Actualización:** 2025-12-30
**Versión:** 5.0 (Blueprint 2026 + Odoo Integration)

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### Nombre del Proyecto
**DentalFlow / DentalApp** - SaaS Cloud-First para Clínicas Dentales y Laboratorios

### Repositorio
- **Nombre:** dentalapp
- **Ruta Local:** `D:\DentalFlow`
- **GitHub:** Repositorio público
- **Rama Principal:** `main`

### Stack Tecnológico (LOCKED)
- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** TailwindCSS + shadcn/ui + Radix
- **Animaciones:** Framer Motion
- **Data Fetching:** TanStack React Query
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase Cloud (Postgres + RLS + Edge Functions)
- **ERP:** Odoo.sh (Solo para Laboratorio)
- **Monitoring:** Sentry

---

## 2. ARQUITECTURA Y REGLAS NO NEGOCIABLES

### Multi-Tenancy Estricto
- Toda tabla de negocio incluye `clinic_id`
- RLS habilitado en todas las tablas sensibles
- Zero-Trust: frontend NUNCA decide precios, permisos o estados

### Esquemas de Base de Datos
El proyecto utiliza **4 esquemas aislados** en Supabase:
1. **`schema_core`**: Autenticación, usuarios, módulos
2. **`schema_lab`**: Órdenes de laboratorio, productos, inventario
3. **`schema_medical`**: Pacientes, citas, tratamientos, odontogramas
4. **`schema_logistics`**: Tracking, envíos

### Separación de Responsabilidades
- **CLÍNICA ↔ PACIENTE:** Lógica financiera INTERNA (no usa Odoo)
- **LAB ↔ CLÍNICA:** Lógica financiera usa Odoo
- **UN pedido de lab = UN producto de lab**
- **LAB NUNCA ve datos personales de pacientes**

### Módulos Aislados
- Cada módulo debe ser independiente
- El fallo de un módulo NO debe romper otros
- NUNCA implementar lógica no aprobada explícitamente en el PR actual

---

## 3. CREDENCIALES Y CONFIGURACIÓN

### Variables de Entorno Críticas
Ubicación: `.env` y `.env.local` (NUNCA commitear)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uadurfgrkjjbexnpcjdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Odoo
ODOO_URL=http://localhost:8069
ODOO_DB=dr pedro el escamoso
ODOO_USERNAME=admin
ODOO_PASSWORD="<password_with_special_chars>"
```

### Usuarios de Prueba
- **Superadmin:** `superadmin@smartnetgt.com` / `Admin123!`
- **Rol:** `super_admin` (acceso total al sistema)

---

## 4. FUNCIONALIDADES IMPLEMENTADAS

### ✅ Core Infrastructure
- [x] Database schemas (v5) con RLS
- [x] Supabase client setup (server + client)
- [x] Odoo client setup (XML-RPC)
- [x] Middleware & auth flow
- [x] AppShell layout con sidebar dinámico
- [x] Module-based navigation
- [x] Login/Register UI (con toggle Clínica/Laboratorio)

### ✅ Integrations
- [x] **Odoo Connector:** Test de conexión via UI, autenticación verificada
- [x] **Supabase Connector:** Test de conexión via UI, RLS verificado

### ✅ Admin Module - User Management
- [x] Crear usuarios con roles (superadmin, clinic_admin, lab_admin, etc.)
- [x] Listar todos los usuarios
- [x] Actualizar roles de usuarios
- [x] Mensajes de confirmación (toast verde/rojo)
- [x] Tabla mejorada con columnas:
  - Email
  - Role
  - Status (Active/Inactive)
  - Last Login
  - Session (Online/Offline - hardcoded por ahora)
  - Actions (icono de lápiz para cambio de contraseña)

### ✅ Database Functions (RPC)
- `get_all_modules()`: Obtiene módulos activos
- `get_all_users_admin()`: Obtiene todos los usuarios (bypass RLS)
- `update_user_role_admin(p_user_id, p_new_role)`: Actualiza rol de usuario

---

## 5. FUNCIONALIDADES PENDIENTES

### 🔲 User Management
- [ ] Implementar funcionalidad de cambio de contraseña (diálogo + server action)
- [ ] Implementar presencia en tiempo real (Supabase Realtime para estado Online/Offline)

### 🔲 Clinic Module
- [ ] Gestión de pacientes
- [ ] Calendario de citas
- [ ] Odontograma interactivo
- [ ] Presupuestos y pagos

### 🔲 Lab Module
- [ ] Kanban de órdenes
- [ ] Gestión de productos
- [ ] Integración con Odoo para facturación

---

## 6. DECISIONES TÉCNICAS CLAVE

### Autenticación
- Supabase Auth para login/registro
- Trigger `handle_new_user` crea entrada en `schema_core.users` automáticamente
- Roles manejados en `schema_core.users.role`

### Server Actions
- Todas las operaciones sensibles usan **server actions** (`'use server'`)
- Admin operations usan `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS
- Funciones RPC para queries complejas o cuando el acceso directo al esquema falla

### UI/UX
- Login tiene toggle visual "Clínica/Laboratorio" (solo cambia UI, no afecta autenticación)
- Mensajes de notificación tipo "toast" para feedback de acciones
- Tabla de usuarios con datos de `schema_core.users` + `auth.users` (join para `last_sign_in_at`)

---

## 7. ESTRUCTURA DE DIRECTORIOS CLAVE

```
D:\DentalFlow/
├── docs/                          # Documentación del proyecto
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── GUIA_MAESTRA_DENTALFLOW_V3.md
│   ├── PR_GUIDELINES.md
│   ├── PR_LOG.md
│   ├── task.md                    # Checklist de tareas
│   ├── implementation_plan.md     # Planes de implementación
│   └── walkthrough.md             # Reportes de verificación
├── src/
│   ├── app/
│   │   ├── login/                 # Página de login/registro
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Layout con sidebar dinámico
│   │   │   ├── admin/
│   │   │   │   ├── users/         # Gestión de usuarios
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── actions.ts # Server actions
│   │   │   │   └── modules/       # Gestión de módulos
│   │   │   └── settings/
│   │   │       ├── odoo/          # Test Odoo connection
│   │   │       └── supabase/      # Test Supabase connection
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Cliente Supabase (browser)
│   │   │   ├── server.ts          # Cliente Supabase (server)
│   │   │   └── middleware.ts      # Middleware de sesión
│   │   └── odoo/
│   │       └── client.ts          # Cliente Odoo (XML-RPC)
├── supabase/
│   └── migrations/
│       └── 20260101000000_v5_init_schemas.sql
├── .env                           # Variables de entorno (local)
├── .env.local                     # Variables de entorno (local)
└── middleware.ts                  # Next.js middleware
```

---

## 8. WORKFLOW DE DESARROLLO

### Antes de Empezar Cualquier PR
1. Ejecutar `git status`, `git branch`, `git pull`
2. Verificar que estás en la rama correcta del PR
3. Revisar que `node_modules/` no esté trackeado
4. Verificar que no hay secretos en el repo

### Antes de Crear/Modificar SQL
1. Generar archivo de migración en `supabase/migrations/`
2. NO aplicar automáticamente
3. Imprimir SQL completo en el chat
4. Pedir revisión humana: **"REQUIERE OK HUMANO"**

### Revisión Obligatoria del Repo
1. Ejecutar `npm run build` y `npm run lint`
2. Verificar `.gitignore` excluye `node_modules` y `dist`
3. Verificar que no existen secretos en el repo

### Cada PR Debe Agregar
- Entrada en `docs/PR_LOG.md`
- Si hay cambios de arquitectura/DB: entrada en `docs/DECISIONS.md`

### STOP Conditions (Detenerse y Pedir OK)
- Cambios en Auth/RLS
- Cambios en tablas sensibles (patients, payments, budgets)
- Cambios en integraciones Odoo/Supabase
- Cambios de arquitectura

---

## 9. ERRORES COMUNES Y SOLUCIONES

### Error: "Invalid login credentials"
- **Causa:** Email con typo o contraseña incorrecta
- **Solución:** Verificar que el email sea exacto (ej: `superadmin@smartnetgt.com`, no `supradmin`)

### Error: "Service role key not configured"
- **Causa:** Falta `SUPABASE_SERVICE_ROLE_KEY` en `.env`
- **Solución:** Agregar la clave desde Supabase Dashboard → Settings → API

### Error: Roles no persisten en DB
- **Causa:** Cliente Supabase JS no puede actualizar `schema_core.users` directamente
- **Solución:** Usar función RPC `update_user_role_admin()`

### Error: Lista de usuarios vacía
- **Causa:** RLS bloqueando acceso a `schema_core.users`
- **Solución:** Usar `SUPABASE_SERVICE_ROLE_KEY` + función RPC `get_all_users_admin()`

---

## 10. PRÓXIMOS PASOS PLANIFICADOS

1. **Implementar cambio de contraseña:**
   - Crear diálogo modal
   - Server action `changeUserPassword(userId, newPassword)`
   - Usar `supabaseAdmin.auth.admin.updateUserById()`

2. **Implementar presencia en tiempo real:**
   - Conectar Supabase Realtime
   - Actualizar campo `is_online` dinámicamente
   - Mostrar badge verde/gris en tabla

3. **Continuar con módulos de Clínica y Lab:**
   - Seguir arquitectura modular
   - Mantener aislamiento de módulos
   - Documentar cada decisión en `DECISIONS.md`

---

## 11. CONTACTOS Y RECURSOS

### Supabase Project
- **URL:** https://supabase.com/dashboard/project/uadurfgrkjjbexnpcjdq
- **Project ID:** uadurfgrkjjbexnpcjdq

### Odoo Instance
- **URL:** http://localhost:8069
- **Database:** dr pedro el escamoso

### Documentación de Referencia
- Next.js 15: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Odoo XML-RPC: https://www.odoo.com/documentation/16.0/developer/misc/api/odoo.html

---

## 12. INTEGRACIÓN ODOO (COMPLETADA 2025-12-30)

### Resumen General
Integración bidireccional completa entre DentalFlow y Odoo ERP para gestión de clínicas, servicios y órdenes de laboratorio.

### ✅ Módulos Sincronizados

#### 1. CLÍNICAS (Odoo Partners → DentalFlow)
- **Tabla:** `schema_medical.clinics`
- **Función RPC:** `sync_clinic_from_odoo(p_odoo_partner_id, p_partner_data, p_child_contacts)`
- **Datos sincronizados:**
  - Nombre, dirección, teléfono, email, website, NIT
  - Contactos (staff) con roles automáticos
- **Roles asignados:**
  - Primer contacto: `clinic_admin`
  - Otros contactos: `clinic_staff`, `clinic_doctor`, `clinic_receptionist`
- **Estado:** ✅ 3 clínicas sincronizadas
- **Página:** `/dashboard/medical/clinics`

#### 2. SERVICIOS (Odoo Products → DentalFlow)
- **Tabla:** `schema_lab.services`
- **Función RPC:** `sync_service_from_odoo(p_odoo_product_id, p_product_data)`
- **Filtros de sincronización:**
  - Productos con código que empieza con "LD"
  - Productos con categoría que contiene "lab", "laboratorio" o "dental"
- **Datos sincronizados:**
  - Código, nombre, categoría, precio base
  - Odoo ID, categoría Odoo, datos raw
- **Estado:** ✅ 1 servicio sincronizado (LD-carillas)
- **Página:** `/dashboard/lab/services`

#### 3. ÓRDENES (Bidireccional Odoo ↔ DentalFlow)
- **Tabla:** `schema_lab.orders`
- **Funciones RPC:**
  - `sync_order_from_odoo(p_odoo_sale_order_id, p_sale_order_data)` - Importar
  - `create_sale_order_in_odoo()` - Exportar (pendiente UI)
- **Mapeo de estados:**
  - Odoo `draft/sent` → DentalFlow `new`
  - Odoo `sale` → DentalFlow `design`
  - Odoo `done` → DentalFlow `delivered`
- **Datos del paciente:**
  - Almacenados en campo `note` de Odoo
  - Formato: `"Paciente: ID - Nombre"`
- **Validaciones implementadas:**
  - Fechas inválidas (`'false'`, `null`, vacías)
  - Partner IDs en formato array `[id, "name"]`
  - Datos faltantes o corruptos
- **Estado:** ✅ Órdenes sincronizadas sin errores
- **Página:** `/dashboard/medical/orders`

### Campos Odoo Utilizados

| Campo DentalFlow | Campo Odoo | Descripción |
|------------------|------------|-------------|
| Paciente ID + Nombre | `note` | "Paciente: ID - Nombre" |
| Puesto Staff | `function` | Job Position del contacto |
| Fecha Entrega | `commitment_date` | Fecha compromiso de entrega |
| Estado Orden | `state` | draft/sent/sale/done |
| Precio Total | `amount_total` | Total de la venta |
| Cliente | `partner_id` | ID del partner (clínica) |
| Vendedor | `user_id` | Usuario de Odoo |

### Migraciones SQL Aplicadas

1. ✅ `20260130000015_clinic_sync_from_odoo.sql` - Sync clínicas y staff
2. ✅ `20260130000016_expose_clinics_tables.sql` - Vistas públicas para PostgREST
3. ✅ `20260130000017_add_pending_activation.sql` - Usuarios pendientes de activación
4. ✅ `20260130000018_add_user_name.sql` - Columna nombre en users
5. ✅ `20260130000019_extend_services_for_odoo.sql` - Campos Odoo en services
6. ✅ `20260130000020_services_sync_from_odoo.sql` - RPC sync servicios
7. ✅ `20260130000021_extend_orders_for_odoo.sql` - Campos Odoo en orders
8. ✅ `20260130000022_orders_sync_from_odoo.sql` - RPC sync órdenes con validaciones

### Estructura del Menú

```
GESTIÓN DE CLÍNICAS
  📋 Clínicas      → /dashboard/medical/clinics
  🔧 Servicios     → /dashboard/lab/services
  📦 Órdenes       → /dashboard/medical/orders
```

### Archivos de Código Clave

#### Server Actions
- `src/modules/medical/actions/clinics.ts` - Sync clínicas
- `src/modules/lab/actions/services.ts` - Sync servicios
- `src/modules/medical/actions/orders.ts` - Sync órdenes + crear ventas

#### Páginas
- `src/app/dashboard/medical/clinics/page.tsx` - Gestión clínicas
- `src/app/dashboard/lab/services/page.tsx` - Gestión servicios
- `src/app/dashboard/medical/orders/page.tsx` - Gestión órdenes

#### Cliente Odoo
- `src/lib/odoo/client.ts` - Cliente XML-RPC para Odoo

### Próximos Pasos Sugeridos

1. **Crear Órdenes desde DentalFlow**
   - Implementar UI para crear nuevas órdenes
   - Conectar con `createSaleOrderInOdoo()`

2. **Actualizar Staff en Odoo**
   - Cuando se crea staff en DentalFlow, crear/actualizar contacto en Odoo
   - Usar campo `function` para el puesto de trabajo

3. **Dashboard de Sincronización**
   - Métricas y estadísticas de sync
   - Gráficos de éxito/errores
   - Logs detallados

4. **Webhooks Odoo (Opcional)**
   - Sincronización en tiempo real
   - Notificaciones de cambios

### Problemas Resueltos

#### Error: `pgcrypto` extension not found
- **Solución:** Instalada extensión en schema `public`
- **Migración:** Ejecutada en Supabase Dashboard

#### Error: `null value in column "id" of relation "users"`
- **Causa:** Inserción directa en `auth.users` desde PL/pgSQL
- **Solución:** Crear usuarios solo en `schema_core.users` con `is_pending_activation=TRUE`

#### Error: `column "patient_id" is of type uuid but expression is of type text`
- **Causa:** Conflicto de tipos en columna existente
- **Solución:** DROP y recrear columna como TEXT

#### Error: `invalid input syntax for type date: 'false'`
- **Causa:** Odoo devuelve `'false'` para fechas vacías
- **Solución:** Validación con try-catch en PL/pgSQL

#### Error: `invalid input syntax for type integer`
- **Causa:** Odoo devuelve `partner_id` como array `[id, "name"]`
- **Solución:** Extraer primer elemento con `->0`

---

**FIN DE MEMORIA**

