# Logística Kambra - DentalFlow V5

Este documento define el flujo de trabajo global del tablero de producción y logística del laboratorio de DentalFlow.

## Columnas del Tablero (11 Etapas)

| # | Columna | Responsable | Descripción |
|---|---------|-------------|-------------|
| 1 | **Órdenes por Clínica** | Entrada | Punto inicial de todas las órdenes recibidas. |
| 2 | **Órdenes Digitales** | Logística | Órdenes recibidas vía portal. Muestra mensajería, doctor, paciente y requerimiento. |
| 3 | **Ingresos** | Logística | Validación de materiales/archivos. Si es Digital -> Col 5. Si es Análogo -> Col 4. |
| 4 | **Yesos (Gips)** | Lab Staff | Procesamiento de modelos físicos. Puede pasar a Col 5 o regresar a Col 3 (requiere justificación). |
| 5 | **Diseño** | Lab Staff | Etapa de diseño CAD. Al terminar pasa a Col 6. |
| 6 | **Aprobación Cliente** | Doctor | **NOTIFICACIÓN AUTOMÁTICA:** Al entrar aquí, dispara aviso a Dashboard y App Móvil del Doctor. |
| 7 | **NESTING** | Lab Staff | Preparación de archivos para fresado/impresión. |
| 8 | **MAN** | Lab Staff | Procesamiento manual o manufactura. |
| 9 | **QA** | QA Staff | Control de calidad. Define si pasa a Facturar (Col 10) o a Pruebas (Col 11). |
| 10 | **Facturar** | Admin/Coord | **RESTRICCIÓN:** Solo Lab Admin o Coordinador Lab pueden mover aquí. |
| 11 | **Delivery** | Logística | Despacho final de la orden. |

## Nuevos Roles y Permisos

- **Coordinador Lab (`lab_coordinator`):** Rol con permisos de supervisión, puede validar ingresos y autorizar el paso a facturación.


## Reglas de Movimiento y Validación

1. **Retornos (Back-movements):** Cualquier movimiento hacia una columna anterior requiere obligatoriamente un modal de justificación.
2. **Salto Digital:** Las órdenes digitales en la columna 3 saltan directamente a la columna 5 (Diseño).
3. **Flujo de Yesos:** El personal de Yesos puede avanzar a Diseño o regresar a Ingresos si falta algo.
4. **Decisión de QA:**
   - Si se marca como **Pruebas (Tests)**: Salta directamente a la columna 11 de Delivery previo modal de confirmación.
   - Si se marca para **Facturar**: Pasa a la columna 10.
5. **Responsividad:** El tablero debe ajustarse al ancho de la pantalla sin scroll horizontal (vista compacta o dinámica).

## Datos de Visualización (Cards)
- Nombre de la mensajería (si es externa).
- No. de Guía.
- Clínica / Doctor.
- Paciente.
- Requerimiento / Trabajo solicitado.
