# Guía de Uso y Lógica: Odontograma

## 💡 ¿Cómo funciona el Odontograma?
El odontograma es el "centro de mando" clínico. Su lógica conecta el diagnóstico visual con las operaciones de negocio (Cobros y Laboratorio).

### Pasos para el Usuario:
1.  **Selección**: Haz clic en cualquier diente o superficie (Cara Vestibular, Oclusal, etc.) del gráfico dentario.
2.  **Diagnóstico**: Se abre un menú donde seleccionas qué tiene el paciente.
    *   **Mejora UI**: Los hallazgos están organizados en dos secciones claras: **"Procedimientos Clínicos"** y **"Laboratorio & Prótesis"**.
3.  **Tratamiento (Automático)**:
    *   Si seleccionas **"Caries"**, el sistema sugiere "Resina" (Trabajo de Clínica).
    *   Si seleccionas **"Corona"**, el sistema detecta que es "Trabajo de Laboratorio".
4.  **Disparador de Laboratorio**:
    *   Si el tratamiento requiere laboratorio (ej. Zirconio), el sistema pregunta: *"¿Deseas crear la orden ahora?"*.
    *   Al confirmar, te lleva al **Wizard de Pedidos** con los datos del diente ya pre-llenados.
5.  **Identificación Visual**:
    *   Los servicios que requieren laboratorio se marcan automáticamente en **Amarillo** (Listado) para rápida identificación.
6.  **Notas Clínicas**:
    *   Existe un cuadro de texto para anotaciones de diagnóstico detalladas por cada hallazgo.
    *   **Actualización de Orden:** Si un hallazgo ya tiene orden de laboratorio, el botón de acción cambia a "Actualizar", permitiendo modificar la orden existente.

---

# Arquitectura Implementada (v1.1)
Este documento detalla la integración técnica entre el **Odontograma Clínico** y el **Módulo de Laboratorio**.

## 1. Flujo de Datos
El flujo sigue un modelo unidireccional con retroalimentación visual:

1.  **Origen (Odontograma)**:
    *   Usuario selecciona tratamiento (ej. Corona).
    *   UI detecta `isLabService = true`.
    *   Prompt: "¿Crear Orden?".

2.  **Transición (Wizard)**:
    *   Se abre modal `OrderWizard`.
    *   Se pasan datos iniciales: Diente, Superficie, Tratamiento Base.

3.  **Persistencia (RPC Atómico)**:
    *   Al confirmar, se ejecuta `create_lab_order_transaction`.
    *   **Atomicidad**: Crea Orden + Crea Items + **Actualiza Odontograma** (vincula `lab_order_id`).

4.  **Feedback (Odontograma)**:
    *   Odontograma recarga hallazgos.
    *   Si `finding.lab_order_id` existe:
        *   Fila se pinta **Amarillo**.
        *   Botón cambia a **"Actualizar"**.

## 2. Componentes Clave

### A. Frontend (`odontogram.tsx`)
*   **Gestión de Estado**: Mapea `lab_order_id` desde la BD al estado local del hallazgo.
*   **Visualización**:
    *   `className`: Condicional `bg-amber-50` si es servicio de laboratrio activo.
    *   `actions`: Botón "Pedir" vs "Actualizar" basado en la existencia de `orderId`.

### B. Wizard (`src/components/lab/wizard`)
*   **Validación**: Impide avanzar sin seleccionar Color (Shade Map).
*   **Cálculo de Fechas**:
    *   Usa `sla_days` de la configuración (DB).
    *   Calcula fecha entrega estimada saltando fines de semana.

### C. Backend (Supabase RPC)
*   **`create_lab_order_transaction`**:
    *   Función crítica `SECURITY DEFINER`.
    *   Permite escribir en esquemas `lab` y `medical` simultáneamente.
*   **`get_patient_dental_chart`**:
    *   Expone `lab_order_id` para que el frontend reconozca el estado.

## 3. Estado Actual y Limitaciones
*   **Actualización**: El botón "Actualizar" re-abre el wizard con los datos actuales. Al guardar, **se genera una nueva orden** (versión nueva) y se actualiza el vínculo. No se edita la orden anterior "in-place" (decisión de diseño para trazabilidad simple por ahora).
*   **Sincronización Odoo**: Pendiente para Fase 3. Actualmente la orden vive solo en DentalFlow.




