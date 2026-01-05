# Usuarios de Prueba y Credenciales

Este documento mantiene el registro de los usuarios autorizados para pruebas en el entorno de desarrollo y staging.

## Super Admin (Core)
El único usuario que debe existir tras un reset completo.

- **Usuario:** `admin@dentalflow.com`
- **Password:** `Admin123!`
- **Rol:** `super_admin`
- **Scope:** Acceso total a todas las clínicas y módulos (Tenant 0).

---

## Administradores de Clínica (Sincronizados desde Odoo)

Estos usuarios fueron sincronizados automáticamente desde Odoo y representan los contactos principales de cada clínica registrada.

### Dr. Pedro el Escamoso

- **Usuario:** `drpedro@clinica.com`
- **Password:** `Clinica9090!`
- **Rol:** `clinic_admin`
- **Clínica:** Dr Pedro el escamoso
- **Puesto:** Administrador Clínica
- **Estado:** ✅ Activo y funcionando

### Dr. Harry
- **Usuario:** `dr.harry@clinica.com`
- **Password:** *(Debe ser establecida mediante "Reset Password" en la UI)*
- **Rol:** `clinic_admin`
- **Clínica:** Dr Harry
- **Puesto:** Administrador Clínica
- **Estado:** ✅ Activo (sincronizado desde Odoo)

### Clínica Dental A
- **Usuario:** `clinica.dental@a.com`
- **Password:** *(Debe ser establecida mediante "Reset Password" en la UI)*
- **Rol:** `clinic_admin`
- **Clínica:** Clínica Dental A
- **Puesto:** Administrador Clínica
- **Estado:** ✅ Activo (sincronizado desde Odoo)

### Clínica Sonrisas
- **Usuario:** `info@clinicasonrisas.com`
- **Password:** *(Debe ser establecida mediante "Reset Password" en la UI)*
- **Rol:** `clinic_admin`
- **Clínica:** Clínica Sonrisas
- **Puesto:** Administrador Clínica
- **Estado:** ✅ Activo (sincronizado desde Odoo)

### Azure Interior
- **Usuario:** `azure.Interior24@example.com`
- **Password:** `Clinica5050!`
- **Rol:** `clinic_admin`
- **Clínica:** Azure Interior
- **Puesto:** Administrador Clínica
- **Estado:** ✅ Activo (sincronizado desde Odoo)

### Deco Addict
- **Usuario:** `deco_addict@yourcompany.example.com`
- **Password:** *(Debe ser establecida mediante "Reset Password" en la UI)*
- **Rol:** `clinic_admin`
- **Clínica:** Deco Addict
- **Puesto:** Administrador Clínica
- **Estado:** ✅ Activo (sincronizado desde Odoo)

### Dr. Celeste (Clínica 1)
- **Usuario:** `dr.celeste@clinica1.com`
- **Password:** `Clinica2026!`
- **Rol:** `clinic_doctor`
- **Clínica:** Clínica 1
- **Puesto:** Doctor
- **Estado:** ✅ Activo
- **Notas:** Usuario de prueba para validar funcionalidades de doctor

---

## Usuarios de Laboratorio

### Admin Lab
- **Usuario:** `admin.lab@a.com`
- **Password:** Admin123!
- **Rol:** `lab_admin`
- **Puesto:** Administrador de Laboratorio
- **Estado:** ✅ Activo

### Staff Lab - Ingresos
- **Usuario:** `ingresos1@a.com`
- **Password:** `909080807070`
- **Rol:** `courier` (Mensajero/Staff)
- **Puesto:** Encargado de Ingresos
- **Estado:** ✅ Activo

---

## Notas Importantes

### Activación de Cuentas de Clínica
1. Los usuarios sincronizados desde Odoo se crean con `is_pending_activation = TRUE`
2. Para activar una cuenta:
   - Ve a **Dashboard → Medical → Clinics → [Clínica] → Staff**
   - Haz clic en el botón **"RESETEAR"** junto al usuario
   - Establece una contraseña temporal (ej: `Dental123!`)
   - El usuario podrá iniciar sesión inmediatamente

### Proceso de Reset de Contraseña
- El sistema utiliza **Supabase Admin API** para gestionar contraseñas
- Al resetear, se crea automáticamente el usuario en `auth.users` si no existe
- El email se marca como verificado automáticamente
- No se envían emails de confirmación (modo desarrollo)

### Roles y Permisos
- `super_admin`: Acceso completo a todo el sistema
- `clinic_admin`: Administrador de una clínica específica (puede gestionar staff, pacientes, órdenes)
- `clinic_staff`: Personal de clínica con permisos limitados
- `patient`: Usuario paciente (solo puede ver su información)

### Sincronización Odoo
- Los contactos principales de cada partner en Odoo se sincronizan automáticamente como `clinic_admin`
- Los contactos secundarios se sincronizan como `clinic_staff`
- La sincronización se ejecuta desde: **Dashboard → Settings → Odoo → Sync → Clientes**
