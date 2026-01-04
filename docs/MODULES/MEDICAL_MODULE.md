# Módulo Médico (Clínica) - Especificación

**Versión**: 1.0  
**Estado**: Implementado

---

## 🎯 Objetivo

Gestionar todas las operaciones clínicas incluyendo pacientes, citas, odontograma, presupuestos, pagos y órdenes de laboratorio.

---

## 📊 Funcionalidades Principales

### 1. Gestión de Pacientes
- Crear/editar pacientes
- Historial clínico
- Documentos adjuntos
- Consentimientos informados

### 2. Agenda de Citas
- Calendario interactivo
- Asignación de doctores
- Recordatorios automáticos
- Estados: pendiente, confirmada, completada, cancelada

### 3. Odontograma
- Visualización dental interactiva
- Registro de hallazgos por diente
- Tipos: caries, fractura, restauración, etc.
- Generación de órdenes de laboratorio

### 4. Presupuestos
- Creación de presupuestos
- Items con servicios y precios
- Estados: borrador, enviado, aprobado, rechazado
- Conversión a tratamiento

### 5. Pagos
- Registro de pagos
- Métodos: efectivo, tarjeta, transferencia
- Cuentas por cobrar
- Historial de pagos

### 6. Órdenes de Laboratorio
- Creación desde odontograma
- 3 tipos de entrega: Digital, Recolección, Envío
- Tracking en tiempo real
- Historial de órdenes

---

## 🗄️ Tablas Principales

- `schema_medical.patients`
- `schema_medical.appointments`
- `schema_medical.clinical_findings`
- `schema_medical.budgets`
- `schema_medical.budget_items`
- `schema_medical.payments`
- `schema_medical.clinics`
- `schema_medical.clinic_staff`

---

## 🔐 Roles y Permisos

### clinic_admin
- Acceso total a la clínica
- Gestión de staff
- Configuración

### clinic_doctor
- Gestión de pacientes
- Odontograma
- Presupuestos
- Órdenes de lab

### clinic_receptionist
- Agenda de citas
- Registro de pagos
- Consulta de pacientes

### clinic_staff
- Permisos limitados según configuración

---

**Fin del Documento**
