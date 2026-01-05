# Tareas de Mejora - Módulo Core/Admin/Lab

Este documento detalla las tareas de refinamiento para los módulos administrativos y de laboratorio, basadas en la auditoría visual y funcional post-reset.

## 1. Módulo: Modules Control (Admin)

- [ ] **Mejora Visual**: Rediseñar la vista para que sea más amigable e informativa.
- [ ] **Contenido Visual**: Agregar elementos gráficos que realmente informen sobre el estado de los módulos.

## 2. Lab Dashboard
- [ ] **Datos Reales**: Asegurar que todos los gráficos y tarjetas estén conectados a la base de datos (incluso si muestran 0).
- [ ] **SLA Global**: Eliminar el dato mock del 94.2% y mostrar 0 o el valor real calculado.
- [ ] **Validación**: Revisar que el código esté listo para recibir información real sin errores.

## 3. KAMBA (Anteriormente KAMBRA)
- [ ] **Renombrado**: Cambiar "KAMBRA" por "KAMBA" en todo el código fuente y base de datos.
- [ ] **Layout**: Eliminar la barra de desplazamiento horizontal.
- [ ] **Vista de Tabla**: Implementar una vista alternativa en formato de tabla.
- [ ] **Detalle por Etapa**: Mostrar cuántas órdenes hay en cada paso y permitir ver el detalle de cada paso.
- [ ] **UI Kanban**: Aumentar el tamaño de las tarjetas para que no se vean tan pequeñas.
- [ ] **Interacción**: Mantener la lógica de clic para ver detalles de la orden.

## 4. Rendimiento (Performance)
- [ ] **Datos Reales**: Validar que el código esté preparado para mostrar datos reales en todos los gráficos y tablas.

## 5. Tiempos (SLA)
- [ ] **Eliminar Mock Data**: Limpiar los datos falsos actuales.
- [ ] **Selector de Tiempo**: Implementar un selector simple de Horas y Minutos (preferiblemente con un icono de reloj o algo intuitivo).

## 6. Servicios
- [ ] **Botón Sincronizar**: Validar su funcionamiento.
- [ ] **Configuración SLA**: Asegurar que soporte configuración por Días, Horas y Minutos.
- [ ] **Diferenciación**: Mantener la distinción entre SLA de servicios y SLA de laboratorio.

## 7. Odoo Sync
- [ ] **Formulario**: Validar el formulario de configuración de la conexión.
- [ ] **Botón Probar**: Asegurar que el botón "Probar Conexión" esté siempre disponible.
- [ ] **Botón Único**: Implementar un solo botón para "Sincronizar Todo" (Ventas, Clientes, etc.) en lugar de botones individuales.
- [ ] **Notificaciones**: Agregar toasts de confirmación para cada acción.

## 8. Gestión de Clínicas (Admin)
- [ ] **Tarjetas de Resumen**: Agregar tarjetas para ver Clínicas Activas, Total de Pacientes y Total de Órdenes.
- [ ] **Servicios de Clínica**: Crear una vista específica para ver los servicios adicionales agregados por cada clínica, incluyendo información del creador (clínica).

## 9. Órdenes (Settings/Admin)
- [ ] **Reubicación**: Mover el menú de Órdenes a "Configuración Lab" dentro de Settings.
- [ ] **Validación**: Asegurar que los datos sean reales.

## 10. Evolución Integración Odoo (Fase 2) - COMPLETADA (Lógica)

### Crédito y Finanzas
- [x] Obtener `property_payment_term_id` de todos los clientes.
- [x] Definir lógica de bloqueo de despacho: `Cash` (bloqueado hasta pago) vs `Credit` (despacho permitido).

### Sincronización Masiva (Contactos y Productos)
- [x] Consultar el 100% de los campos disponibles en Odoo para `res.partner` y `product.product`.
- [x] Implementar middleware de normalización: transformar `false/null` de Odoo en `0` o `""` en DentalFlow.
- [x] Almacenar el objeto íntegro en la columna `raw_data` (JSONB).

### Control de Visualización Dinámico
- [ ] Usar `odoo_field_mappings` para gestionar qué campos del `raw_data` se visualizan en la UI.
- [ ] Permitir al Super Admin marcar cuáles campos se sincronizan con las tablas operativas (`clinics`, `services`) y cuáles son solo informativos.

## 11. Agenda Médica / Citas
- [x] **Selección de Doctor**: Permitir ver todos los doctores para Super Admin (RPC fix).
- [x] **Modal Responsivo**: Ajustar altura y scroll para evitar cortes en pantallas pequeñas.
- [x] **UX**: Corregir doble botón de cierre en modal.
- [ ] **Creación Citas (Super Admin)**: Permitir crear citas sin estar vinculado a una clínica específica (usar primera disponible o selector).
