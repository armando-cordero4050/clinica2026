# 📋 ROADMAP DE DESARROLLO - DentalFlow

**Última actualización**: 2025-01-30  
**Estado del Proyecto**: Fase de Implementación Modular

---

## 🎯 MÓDULOS COMPLETADOS

### ✅ 1. MÓDULO CORE (Fundación)

**Estado**: 100% Completado

- [x] Estructura de proyecto (Vite + React + TypeScript)
- [x] Configuración de TailwindCSS + shadcn/ui
- [x] Sistema de autenticación con Supabase
- [x] Esquemas de base de datos (`schema_core`, `schema_lab`, `schema_medical`)
- [x] Sistema de roles y permisos (RLS)
- [x] Layout principal con sidebar responsive
- [x] Gestión de usuarios
- [x] Sistema de módulos (Feature Flags)

**Archivos Clave**:
- `supabase/migrations/20260101000000_v5_init_schemas.sql`
- `src/app/dashboard/layout.tsx`
- `src/lib/supabase/`

---

### ✅ 2. MÓDULO LABORATORIO - KAMBRA WORKFLOW
**Estado**: 95% Completado

#### ✅ Completado:
- [x] Tablero Kanban de 11 etapas
- [x] Sistema de correlativos (No. de Orden)
- [x] Tracking automático de tiempos por usuario/etapa
- [x] Configuración de SLA por departamento
- [x] Dashboard de rendimiento por usuario
- [x] Lógica de salto automático (órdenes digitales)
- [x] Restricciones de permisos por rol
- [x] Modales de confirmación y justificación
- [x] Sistema de pausas con aprobación
- [x] Visualización de tiempo restante (SLA)

#### 🔄 Pendiente:
- [ ] **Gestión de Pausas** - Panel para coordinadores (aprobar/rechazar)
- [ ] **Notificaciones en Tiempo Real** - Alertas cuando una orden está por vencer
- [ ] **Crear Órdenes** - Formulario para generar nuevas órdenes de laboratorio
- [ ] **Órdenes de Prueba** - Script para poblar el sistema con datos de ejemplo
- [ ] **Historial de Movimientos** - Log de cambios de estado por orden
- [ ] **Exportar Reportes** - PDF/Excel de rendimiento y productividad

**Archivos Clave**:
- `src/modules/lab/components/global-kambra.tsx`
- `src/app/dashboard/lab/kambra/page.tsx`
- `src/app/dashboard/lab/performance/page.tsx`
- `src/app/dashboard/settings/sla/page.tsx`
- `src/app/dashboard/settings/correlatives/page.tsx`
- `supabase/migrations/20260130000007_advanced_kambra_logic.sql`
- `supabase/migrations/20260130000009_sla_per_stage_tracking.sql`

---

## 🚧 MÓDULOS EN DESARROLLO

### 🔄 3. MÓDULO MÉDICO/CLÍNICA
**Estado**: 0% Completado

#### Pendiente:
- [ ] **Dashboard Médico** - Vista general para doctores
- [ ] **Gestión de Pacientes** - CRUD de pacientes con privacidad
- [ ] **Historial Clínico** - Registro de tratamientos y notas
- [ ] **Crear Órdenes para Lab** - Formulario de solicitud de trabajos
- [ ] **Seguimiento de Órdenes** - Ver estado de órdenes enviadas al lab
- [ ] **Notificaciones de Aprobación** - Alertas cuando una orden requiere revisión
- [ ] **Presupuestos** - Generación y aprobación de presupuestos
- [ ] **Facturación Clínica-Paciente** - Gestión de pagos internos

**Archivos a Crear**:
- `src/app/dashboard/medical/page.tsx`
- `src/app/dashboard/medical/patients/page.tsx`
- `src/app/dashboard/medical/orders/page.tsx`
- `src/modules/medical/components/`
- `supabase/migrations/2026XXXX_medical_module.sql`

---

### 🔄 4. MÓDULO ODOO (Integración ERP)
**Estado**: 10% Completado

#### ✅ Completado:
- [x] Configuración básica de Odoo en módulos
- [x] Placeholder de sincronización en sidebar

#### Pendiente:
- [ ] **Sincronización de Productos** - Importar catálogo desde Odoo
- [ ] **Sincronización de Precios** - Actualización automática de costos
- [ ] **Generación de Órdenes de Venta** - Crear SO en Odoo desde DentalFlow
- [ ] **Generación de Facturas** - Crear invoices en Odoo
- [ ] **Webhook de Estado** - Recibir actualizaciones de Odoo
- [ ] **Log de Sincronización** - Historial de operaciones con Odoo
- [ ] **Manejo de Errores** - Retry logic y alertas de fallo

**Archivos a Crear**:
- `src/app/dashboard/settings/odoo/page.tsx`
- `src/lib/odoo/client.ts`
- `src/modules/lab/actions/odoo-sync.ts`
- `supabase/migrations/2026XXXX_odoo_integration.sql`

---

### 🔄 5. MÓDULO DE NOTIFICACIONES
**Estado**: 30% Completado

#### ✅ Completado:
- [x] Tabla de notificaciones en base de datos
- [x] Trigger para notificar en "Aprobación Cliente"
- [x] RPC para insertar notificaciones

#### Pendiente:
- [ ] **Centro de Notificaciones** - Panel en dashboard para ver todas las alertas
- [ ] **Notificaciones Push** - Integración con navegador
- [ ] **Notificaciones por Email** - Envío automático de correos
- [ ] **Notificaciones Móviles** - Push notifications para app móvil
- [ ] **Configuración de Preferencias** - Usuario decide qué notificaciones recibir
- [ ] **Marcar como Leído** - Sistema de gestión de estado

**Archivos a Crear**:
- `src/app/dashboard/notifications/page.tsx`
- `src/components/notifications-bell.tsx`
- `src/lib/notifications/push.ts`
- `supabase/migrations/2026XXXX_notifications_enhancement.sql`

---

### 🔄 6. MÓDULO DE REPORTES Y ANALYTICS
**Estado**: 0% Completado

#### Pendiente:
- [ ] **Dashboard Ejecutivo** - Métricas globales del negocio
- [ ] **Reportes de Productividad** - Gráficos de rendimiento del lab
- [ ] **Reportes Financieros** - Ingresos, costos, márgenes
- [ ] **Análisis de Cuellos de Botella** - Identificar etapas lentas
- [ ] **Predicción de SLA** - ML para estimar tiempos de entrega
- [ ] **Exportación de Datos** - CSV, Excel, PDF
- [ ] **Reportes Personalizados** - Constructor de reportes

**Archivos a Crear**:
- `src/app/dashboard/reports/page.tsx`
- `src/modules/analytics/components/`
- `src/lib/analytics/calculations.ts`

---

### 🔄 7. MÓDULO DE LOGÍSTICA Y COURIER
**Estado**: 0% Completado

#### Pendiente:
- [ ] **Gestión de Couriers** - CRUD de mensajeros
- [ ] **Asignación de Entregas** - Asignar órdenes a couriers
- [ ] **Tracking de Entregas** - Seguimiento en tiempo real
- [ ] **Confirmación de Entrega** - Firma digital y foto
- [ ] **Historial de Entregas** - Log por courier
- [ ] **Optimización de Rutas** - Sugerencias de rutas eficientes

**Archivos a Crear**:
- `src/app/dashboard/logistics/page.tsx`
- `src/modules/logistics/components/`
- `supabase/migrations/2026XXXX_logistics_module.sql`

---

## 📱 APLICACIÓN MÓVIL (Futuro)

### 🔮 8. APP MÓVIL - REACT NATIVE
**Estado**: 0% Completado

#### Pendiente:
- [ ] **Setup de React Native** - Configuración inicial
- [ ] **Autenticación Móvil** - Login con Supabase
- [ ] **Vista de Kambra** - Versión móvil del tablero
- [ ] **Escaneo de QR** - Para tracking de órdenes
- [ ] **Notificaciones Push** - Integración con Firebase
- [ ] **Cámara para Evidencias** - Fotos de entregas/QA
- [ ] **Modo Offline** - Sincronización cuando hay conexión

---

## 🔐 MÓDULO DE SEGURIDAD Y AUDITORÍA

### 🔄 9. SEGURIDAD AVANZADA
**Estado**: 40% Completado

#### ✅ Completado:
- [x] Row Level Security (RLS) básico
- [x] Autenticación con Supabase Auth
- [x] Roles y permisos por usuario

#### Pendiente:
- [ ] **Auditoría de Cambios** - Log de todas las modificaciones
- [ ] **2FA (Two-Factor Auth)** - Autenticación de dos factores
- [ ] **Gestión de Sesiones** - Control de sesiones activas
- [ ] **Políticas de Contraseñas** - Requisitos de seguridad
- [ ] **Backup Automático** - Respaldo programado de datos
- [ ] **Encriptación de Datos Sensibles** - Protección de información médica

---

## 🎨 MEJORAS DE UX/UI

### 🔄 10. EXPERIENCIA DE USUARIO
**Estado**: 60% Completado

#### ✅ Completado:
- [x] Diseño responsive
- [x] Sidebar colapsable
- [x] Componentes shadcn/ui
- [x] Toasts de confirmación

#### Pendiente:
- [ ] **Tema Oscuro** - Dark mode completo
- [ ] **Personalización de Colores** - Temas por usuario/clínica
- [ ] **Onboarding** - Tutorial para nuevos usuarios
- [ ] **Tooltips y Ayuda** - Guías contextuales
- [ ] **Atajos de Teclado** - Navegación rápida
- [ ] **Búsqueda Global** - Buscar órdenes, pacientes, usuarios

---

## 📊 PRIORIDADES INMEDIATAS

### 🔥 Alta Prioridad (Esta Semana)
1. **Gestión de Pausas** - Panel para coordinadores
2. **Crear Órdenes de Prueba** - Poblar sistema con datos
3. **Formulario de Nueva Orden** - Permitir crear órdenes desde UI

### ⚡ Media Prioridad (Próximas 2 Semanas)
4. **Notificaciones en Tiempo Real** - Centro de notificaciones
5. **Dashboard Médico Básico** - Vista para doctores
6. **Gestión de Pacientes** - CRUD básico

### 📅 Baja Prioridad (Próximo Mes)
7. **Integración Odoo Completa** - Sincronización bidireccional
8. **Reportes Avanzados** - Analytics y predicciones
9. **App Móvil** - Versión para smartphones

---

## 📝 NOTAS TÉCNICAS

### Migraciones Aplicadas (En Orden)
1. ✅ `20260101000000_v5_init_schemas.sql` - Esquemas base
2. ✅ `20260102000000_lab_schema.sql` - Módulo laboratorio
3. ✅ `20260105000000_fix_lab_privacy_and_odoo.sql` - Privacidad y Odoo
4. ✅ `20260130000003_logistica_kambra_mvp.sql` - Kambra 11 etapas
5. ✅ `20260130000005_lab_roles_notifications.sql` - Roles y notificaciones
6. ✅ `20260130000006_update_order_rpc_v2.sql` - RPC de actualización
7. ✅ `20260130000007_advanced_kambra_logic.sql` - Pausas y correlativos
8. ✅ `20260130000008_update_kambra_rpc_v3.sql` - RPC actualizado
9. ✅ `20260130000009_sla_per_stage_tracking.sql` - Tracking de tiempos
10. ✅ `20260130000010_expose_sla_config.sql` - Exponer SLA
11. ✅ `20260130000011_expose_sequences.sql` - Exponer correlativos
12. ✅ `20260130000012_get_lab_users.sql` - Obtener usuarios lab

### Stack Tecnológico
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **ERP**: Odoo.sh (Integración futura)
- **Monitoring**: Sentry (Configurado)

### Reglas de Arquitectura
- ✅ Multi-tenancy estricto (`clinic_id` en todas las tablas)
- ✅ Zero-trust (frontend nunca decide precios/permisos)
- ✅ Privacidad del paciente (lab no ve datos personales)
- ✅ Idempotencia en integraciones Odoo
- ✅ Módulos aislados (fallo de uno no afecta otros)

---

## 🎯 PRÓXIMOS PASOS

**Esperando instrucciones del usuario para decidir:**
- A) Gestión de Pausas
- B) Crear Órdenes de Prueba
- C) Formulario de Nueva Orden
- D) Otro módulo prioritario

---

**Documento vivo - Se actualiza con cada sprint completado**
