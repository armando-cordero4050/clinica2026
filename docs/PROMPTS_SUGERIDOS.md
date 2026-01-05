# PROMPT SUGERIDO PARA INICIAR SESIONES CON AGENTE IA

## 📋 **PROMPT CORTO (Uso diario)**

```
Lee docs/ESTADO_ACTUAL.md y docs/INDEX.md.
Dame un resumen del estado actual: problemas resueltos hoy, pendientes, y próximos pasos.
```

---

## 📋 **PROMPT COMPLETO (Primera sesión o después de mucho tiempo)**

```
Eres un Senior Full-Stack Developer trabajando en DentalFlow.

PASO 1: Lee COMPLETO el archivo docs/INDEX.md - Este es tu mapa de navegación.

PASO 2: Lee los siguientes documentos EN ORDEN:
1. docs/LAB_ORDER_LOGIC.md
2. docs/PR_LOG.md (últimas 5 entradas)
3. docs/TASK_STATUS.md
4. docs/PLAN_ACCION_FASE_2.5.md

PASO 3: Responde estas preguntas:
- ¿Cuál es el objetivo actual del proyecto?
- ¿Qué módulos están activos?
- ¿Qué tareas están pendientes?
- ¿Hay algún problema crítico sin resolver?

PASO 4: Basado en tu análisis, sugiere:
- Próximos pasos recomendados
- Posibles riesgos o inconsistencias
- Áreas que requieren documentación

REGLAS IMPORTANTES:
- SIEMPRE consulta docs/INDEX.md antes de hacer cambios
- SIEMPRE actualiza docs/PR_LOG.md después de cambios importantes
- NUNCA ejecutes migraciones en archive/ sin verificar primero
- Si encuentras información contradictoria, INDEX.md tiene prioridad
```

---

## 📋 **PROMPT PARA TAREAS ESPECÍFICAS**

### Para trabajar en Órdenes de Laboratorio:
```
Lee docs/INDEX.md, luego docs/LAB_ORDER_LOGIC.md y docs/MODULES/LAB_MODULE.md.
Necesito [DESCRIBIR TAREA].
Antes de proceder, confirma que entiendes:
1. La arquitectura de esquemas (public vs schema_lab)
2. El flujo de creación de órdenes
3. Las decisiones arquitectónicas recientes
```

### Para trabajar en Migraciones:
```
Lee docs/INDEX.md, sección "MIGRACIONES SQL".
Necesito [DESCRIBIR TAREA DE MIGRACIÓN].
Antes de crear/ejecutar cualquier migración:
1. Verifica qué migraciones están en archive/applied_2026_01_05/
2. Revisa el último timestamp en supabase/migrations/
3. Confirma que no duplicas funcionalidad existente
```

### Para trabajar en Módulo Médico:
```
Lee docs/INDEX.md, luego docs/MODULES/MEDICAL_MODULE.md y docs/odontograma.md.
Necesito [DESCRIBIR TAREA].
Confirma que entiendes:
1. La relación entre pacientes, citas y hallazgos clínicos
2. Cómo se generan órdenes de lab desde el odontograma
3. Los roles y permisos RLS
```

---

## 🎯 **PROMPT PARA DEBUGGING**

```
Estoy teniendo un problema con [DESCRIBIR PROBLEMA].

PASO 1: Lee docs/INDEX.md sección "PROBLEMAS RESUELTOS RECIENTEMENTE"
PASO 2: Busca en docs/PR_LOG.md si hay algo relacionado
PASO 3: Revisa el código relevante en [RUTA]

Antes de proponer solución:
1. Verifica si este problema ya fue resuelto antes
2. Consulta las decisiones arquitectónicas en INDEX.md
3. Propón solución alineada con la arquitectura actual
```

---

## 🔄 **PROMPT PARA ACTUALIZAR DOCUMENTACIÓN**

```
Acabo de completar [DESCRIBIR CAMBIO].

Actualiza la documentación siguiendo este orden:
1. docs/ESTADO_ACTUAL.md - Actualizar fecha, problemas resueltos, tareas completadas
2. docs/PR_LOG.md - Añade entrada con fecha 2026-01-05
3. docs/TASK_STATUS.md - Marca tareas completadas
4. docs/INDEX.md - Si hay decisión arquitectónica nueva
5. [Módulo específico].md - Si afecta lógica del módulo

Confirma qué archivos actualizaste y muestra un resumen.
```

---

## 🔚 **PROMPT PARA FINAL DE SESIÓN** ⭐

```
Hemos terminado la sesión de trabajo. Actualiza docs/ESTADO_ACTUAL.md con:

1. Fecha y hora actual en "ÚLTIMA ACTUALIZACIÓN"
2. Problemas resueltos hoy (mover de Pendientes a Resueltos)
3. Nuevos problemas identificados (añadir a Pendientes)
4. Tareas completadas hoy (con checkmarks)
5. Lecciones aprendidas de esta sesión
6. Comandos útiles ejecutados
7. Próximos pasos sugeridos actualizados

Luego muestra un resumen de lo actualizado.
```

---

## 💡 **MEJORES PRÁCTICAS**

### ✅ HACER:
- Siempre empezar leyendo INDEX.md
- Actualizar PR_LOG.md después de cada cambio importante
- Verificar en Supabase antes de asumir que algo está aplicado
- Consultar documentos de módulos específicos según necesidad

### ❌ NO HACER:
- Asumir que conoces el estado del proyecto sin leer INDEX.md
- Ejecutar migraciones sin verificar archive/
- Modificar arquitectura sin consultar INDEX.md
- Olvidar actualizar documentación después de cambios

---

## 📝 **TEMPLATE DE PROMPT PERSONALIZADO**

```
Contexto: Estoy trabajando en [MÓDULO/FEATURE]

Paso 1: Lee docs/INDEX.md
Paso 2: Lee [DOCUMENTOS ESPECÍFICOS RELEVANTES]
Paso 3: [TAREA ESPECÍFICA]

Requisitos:
- [REQUISITO 1]
- [REQUISITO 2]
- [REQUISITO 3]

Antes de proceder, confirma:
1. [CONFIRMACIÓN 1]
2. [CONFIRMACIÓN 2]
3. [CONFIRMACIÓN 3]

Al finalizar:
- Actualiza docs/PR_LOG.md
- Marca tareas en docs/TASK_STATUS.md
- [OTROS PASOS DE DOCUMENTACIÓN]
```

---

**Recomendación**: Guarda estos prompts en un archivo de texto y cópialos según necesites.
