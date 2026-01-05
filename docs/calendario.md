# 📅 Módulo de Agenda Clínica (Calendario)

Este documento describe la arquitectura técnica, flujo de datos y archivos clave del módulo de Agenda en DentalFlow.

## 🏛 Arquitectura General

El módulo sigue una arquitectura `Server-Side First` con hidratación en cliente para interactividad.
No se hacen consultas directas a tablas (`.from('table').select()`) desde el cliente; todo pasa por **Server Actions** y **Funciones RPC** de Postgres para garantizar seguridad y consistencia lógica.

### Diagrama de Flujo

```mermaid
graph TD
    User((Usuario))
    Page[Page.tsx (Server)]
    View[CalendarView.tsx (Client)]
    Modal[NewAppointmentModal.tsx]
    Action[appointments.ts (Server Action)]
    DB[(Supabase Postgres)]

    User -->|Visita| Page
    Page -->|Fetch Data (Rango fechas)| Action
    Action -->|RPC: get_appointments_rpc| DB
    Page -->|Pasa Datos (Initial Props)| View
    
    User -->|Click Nuevo| View
    View -->|Abre| Modal
    Modal -->|Submit Data| Action
    Action -->|RPC: create_appointment_rpc| DB
    DB -->|Validación Conflictos/Lógica| DB
```

---

## 📂 Archivos Clave

### 1. Frontend (Vista y Controladores)

| Archivo | Ubicación | Responsabilidad |
|:---|:---|:---|
| `page.tsx` | `src/app/dashboard/medical/appointments/` | **Server Component**. Carga inicial de datos. Define el rango de fechas a visualizar (por defecto Semana Actual). |
| `calendar-view.tsx` | `src/app/dashboard/medical/appointments/` | **Client Component**. Renderiza la grilla del calendario. Maneja estado de navegación (semanas), modales y clicks. |
| `new-appointment-modal.tsx` | `src/app/dashboard/medical/appointments/` | Formulario de creación. Maneja selección de Paciente, Doctor y Servicios. Llama a `createAppointment`. |
| `edit-appointment-modal.tsx` | `src/app/dashboard/medical/appointments/` | Edición y visualización de detalles. Permite cambiar estados (Confirmar, Cancelar). |

### 2. Capa de Negocio (Server Actions)

**Archivo:** `src/modules/medical/actions/appointments.ts`

Esta capa actúa como "Backend For Frontend". Valida inputs básicos y llama a la base de datos de manera segura.

*   **`getAppointments(start, end)`**:
    *   Llama al RPC `get_appointments_rpc`.
    *   Retorna `Appointment[]` formateado.
*   **`createAppointment(data)`**:
    *   Prepara los datos (convierte `undefined` a `null` para SQL).
    *   Llama al RPC `create_appointment_rpc`.
    *   Ejecuta `revalidatePath` para refrescar el calendario automáticamente.

### 3. Base de Datos (Supabase / Postgres)

Toda la lógica pesada reside en SQL para asegurar integridad, incluso si se accede desde otro cliente (mobile, API externa).

#### Tabla: `schema_medical.appointments`
Almacena la cita. Contiene `clinic_id`, `doctor_id`, `patient_id`, fechas y estados.

#### Funciones RPC (Remote Procedure Calls)

**`public.get_appointments_rpc(p_start, p_end)`**
*   **Seguridad:** Filtra automáticamente por la clínica del usuario (`auth.uid() -> clinic_staff`).
*   **Eficiencia:** Retorna solo las columnas necesarias y une nombres de doctor/paciente en una sola consulta.

**`public.create_appointment_rpc(...)`**
*   **Lógica de Clínica:** Determina el ID de clínica (automático para staff, manual para SuperAdmin).
*   **Validación de Conflictos:** Verifica si el doctor ya tiene cita en ese horario (`OVERLAP`).
*   **Vinculación de Servicios:** Si se seleccionó un servicio, busca su precio en `clinic_service_prices` y crea el registro en `appointment_services` automáticamente.

---

## 🛠 Comportamiento Especial con Supabase

1.  **Row Level Security (RLS)**:
    *   La tabla `appointments` tiene RLS activado.
    *   Sin embargo, las RPCs se definen como `SECURITY DEFINER`. Esto significa que se ejecutan con permisos elevados PERO incluyen lógica interna (`WHERE clinic_id IN ...`) para asegurar que nadie vea datos ajenos.
    *   Este patrón permite lógica compleja (como `INSERT` en tablas vinculadas) sin dar permisos directos de escritura al usuario en todas las tablas.

2.  **Manejo de Errores**:
    *   Si hay traslape de horario, el RPC lanza una excepción SQL (`RAISE EXCEPTION`).
    *   El Server Action captura el error y devuelve `{ success: false, message: ... }`.
    *   El Frontend muestra el mensaje en un `toast.error` rojo.

## 📝 Notas para Desarrolladores

*   **Identificadores**: Siempre usar UUIDs. Si un ID es opcional (ej. Doctor), enviar `null`, nunca `undefined`.
*   **Fechas**: Usar `ISOString` para comunicar entre Cliente y Server. Postgres maneja `TIMESTAMPTZ`.
