# 🩺 Lógica Completa: Odontograma & Wizard de Laboratorio

Este documento detalla el funcionamiento interno, los flujos de datos y los problemas actuales de los módulos más complejos de DentalFlow.

> **Fecha de Análisis**: 2026-01-06
> **Versión**: 1.2 (Post-Análisis de Código)

---

## 🏗️ 1. Arquitectura General

El sistema intenta unir dos mundos:
1.  **Clínico (Odontograma)**: Diagnóstico visual, centrado en el paciente y el diente.
2.  **Laboratorio (Wizard)**: Manufactura, precios, materiales y tiempos de entrega.

### El Desafío
El odontograma es históricamente una herramienta de dibujo/estado. Convertirlo en un disparador transaccional (crear órdenes complejas con items, colores y fechas) ha introducido una fricción significativa en la experiencia de usuario y la arquitectura de datos.

---

## 🦷 2. Módulo Odontograma (`src/components/dental/odontogram.tsx`)

### Funcionamiento Actual (Código Analizado)
El componente actual es una **versión simplificada** (MVP) que difiere de la documentación ideal (`docs/odontograma.md`).

*   **Estado**: `teeth` es un objeto simple `Record<string, { condition: Condition }>`.
*   **Interacción**:
    *   Click en un diente -> Aplica la herramienta seleccionada (ej. 'crown').
    *   No hay menú contextual ni selección de superficies en el código actual.
    *   **NO hay disparador automático del Wizard** en el código fuente actual (`odontogram.tsx`).

### 🔴 El Problema "Fantasma"
La documentación `docs/odontograma.md` describe un flujo avanzado ("Al confirmar, te lleva al Wizard..."), pero el código fuente actual (`src/components/dental/odontogram.tsx`) **NO tiene implementada esa lógica de disparo**.
Es un odontograma puramente visual que guarda estados ('caries', 'crown', etc.) pero no está conectado al módulo de laboratorio en el frontend.

**Discrepancia Crítica:**
*   Documentación dice: Odontograma abre Wizard.
*   Código dice: Odontograma pinta colores y guarda JSON.

---

## 🧪 3. Módulo Wizard (`src/components/lab/wizard/`)

Este es el componente más complejo y donde reside la lógica de negocio del laboratorio.

### Estructura de Pasos

1.  **Paso 1: Selección de Material (`material-selection.tsx`)**
    *   **Objetivo**: El usuario elige qué quiere hacer (ej. Zirconio -> Corona).
    *   **Datos**: Carga desde `public.lab_materials`.
    *   **Lógica**:
        *   Selecciona Material (Zirconio).
        *   Filtra Tipos (Monolítico, Estratificado).
        *   Filtra Configuraciones (Corona, Puente).
    *   **Salida**: Pasa la `configuration` seleccionada al Paso 2.

2.  **Paso 2: Configuración de Items (`items-configuration.tsx`)**
    *   **Objetivo**: Detallar la orden (Dientes, Color, Fechas, Express).
    *   **Problema de UX**:
        *   Si vienes del odontograma (hipotéticamente), los dientes deberían estar pre-llenados.
        *   Si entras directo, debes escribir los dientes manualmente.
    *   **Lógica de Fechas (SLA)**:
        *   Calcula días hábiles basándose en `config.sla_days`.
        *   Permite "Orden Express" (checkbox) que habilita el input de fecha manual.
    *   **Validación**: Exige color antes de avanzar.

3.  **Paso 3: Revisión y Envío (`review-order.tsx`)**
    *   **Objetivo**: Confirmar y guardar.
    *   **Acción**: Llama a `createLabOrder` (que invoca el RPC `create_lab_order_transaction`).

---

## 🚨 4. ¿Por qué se complicó tanto? (Análisis de Causa Raíz)

### A. Fragmentación de Datos (El problema de la FK)
*   Hubo un intento fallido de duplicar catálogos en `schema_lab` y `public`.
*   Esto causó que las órdenes creadas fallaran al intentar vincularse con items que no existían en el esquema destino.
*   **Estado Actual**: Se arregló apuntando todo a `public`, pero el código legacy del frontend a veces envía IDs incorrectos o espera estructuras diferentes.

### B. Desconexión Odontograma <-> Wizard
*   Se diseñó "en papel" una integración profunda.
*   En código, existen como islas separadas. El Odontograma guarda en `clinical_findings` (o un JSON simple), y el Wizard crea `lab_orders`.
*   **El Eslabón Perdido**: Falta el código que dice: *"Cuando el usuario marque 'Corona' en el diente 18, abre el modal del Wizard pre-cargando el diente 18 y el material sugerido"*.

### C. Complejidad del Wizard ("Jirafa en un Volkswagen")
*   El Wizard intenta manejar demasiados casos borde en un modal pequeño:
    *   Selección multinivel (Material->Tipo->Config).
    *   Mapeo de colores complejos (Gingival/Cuerpo/Incisal).
    *   Lógica de fechas SLA y excepciones Express.
    *   Validación de precios.
*   Esto hace que el estado (`formData`) sea difícil de gestionar y propenso a bugs de "React State Updates" (datos que no se refrescan al volver atrás).

---

## 🛠️ 5. El Problema AHORA MISMO

El usuario (tú) siente que "no logramos solucionar el tema del wizard" porque:

1.  **No hay integración real**: Probablemente estás intentando hacer click en el odontograma esperando que pase algo, y no pasa nada porque el código no está ahí.
2.  **Wizard Aislado**: El Wizard funciona si se abre manualmente, pero carece contexto (¿qué paciente? ¿qué diente?).
3.  **Experiencia Rota**: Tienes que seleccionar manualmente cosas que el sistema ya debería saber.

### Plan de Corrección Inmediata

1.  **Reconocer la Deuda Técnica**: El odontograma actual es insuficiente.
2.  **Integración Explícita**:
    *   Modificar `odontogram.tsx` para aceptar un prop `onTreatmentSelect`.
    *   Cuando se seleccione 'crown', disparar ese evento.
    *   El componente padre (`DentalChart/page.tsx`) debe escuchar y abrir el `OrderWizard`.
3.  **Pre-llenado de Datos**:
    *   El `OrderWizard` debe recibir `initialItems` (ej. `[{ tooth: 18, type: 'crown' }]`).
    *   El `ItemsConfiguration` debe leer esos `initialItems` y poblar la tabla automáticamente.

Este documento sirve como la nueva "Fuente de Verdad Técnica" para abordar la reparación.
