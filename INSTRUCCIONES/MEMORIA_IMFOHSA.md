# MEMORIA: Análisis Sistema IMFOHSA Lab

**Fecha de Inicio:** 2026-01-03  
**Estado:** EN PROGRESO - PENDIENTE CAPTURA MANUAL  
**Prioridad:** ALTA

---

## 🎯 OBJETIVO PRINCIPAL

Analizar y documentar COMPLETAMENTE el sistema de pedidos de IMFOHSA Lab para replicar su lógica en el módulo de Odontograma de DentalFlow.

---

## 📋 INSTRUCCIÓN ORIGINAL DEL USUARIO

> Navega en esta URL https://imfohsalab.genbri.com/home  
> Usa este usuario: asesorcomercial@sitintegrados.com  
> Contraseña: Abc123  
> 
> Ingresa a REALIZAR PEDIDO: https://imfohsalab.genbri.com/pages/orden  
> 
> Lee TODO EL FORMULARIO PASO A PASO, captura TODOS LOS DATOS en un archivo que se llame servicios.md  
> 
> Esa LÓGICA será la que deberemos utilizar en el odontograma del módulo clínica para realizar el pedido.  
> 
> Vamos a implementarlo en una página DEMO de odontograma, vas a copiar el odontograma actual toda la página o módulo si es posible pero AISLADO y sobre ese haremos pruebas.  
> 
> Vas a crear una lista COMPLETA y EXHAUSTIVA de toda esta URL que es la que el cliente reemplazará con nuestra aplicación.

---

## 🔄 CONTEXTO PERDIDO

**IMPORTANTE:** Durante el cambio de modelo de IA (Checkpoint 67), se perdió TODO el análisis previo que incluía:

- ❌ Navegación completa del sitio IMFOHSA
- ❌ Análisis detallado del formulario de pedidos
- ❌ Archivo `servicios.md` completo con toda la documentación
- ❌ Capturas de pantalla del sistema
- ❌ Mapeo de campos y lógica de negocio

**Esto significa que debemos empezar desde CERO.**

---

## 🛠️ INTENTOS REALIZADOS

### Intento 1: Browser Subagent (FALLIDO)
- **Error:** 429 Too Many Requests
- **Causa:** Límite de tasa del servicio de navegación
- **Estado:** No disponible temporalmente

### Intento 2: Script Playwright Automatizado (PARCIALMENTE EXITOSO)
- **Archivo creado:** `scripts/capture_imfohsa.js`
- **Progreso:**
  - ✅ Instalación de Playwright
  - ✅ Descarga de Chromium
  - ✅ Navegación a la URL
  - ✅ Ingreso de credenciales
  - ❌ Login falló (botón submit no funcionó correctamente)
- **Archivos generados:**
  - `screenshots/01_login_page.png`
  - `screenshots/error.png`

---

## 📊 INFORMACIÓN QUE NECESITAMOS CAPTURAR

### 1. Estructura General del Sistema
- [ ] Menú principal y navegación
- [ ] Opciones disponibles después del login
- [ ] Flujo de usuario completo

### 2. Formulario de Pedido (CRÍTICO)
Para CADA campo del formulario necesitamos:

#### Campos de Texto
- [ ] Nombre del campo
- [ ] Tipo (text, email, number, etc.)
- [ ] Placeholder
- [ ] ¿Es obligatorio?
- [ ] Validaciones

#### Selectores/Dropdowns
- [ ] Nombre del campo
- [ ] TODAS las opciones disponibles
- [ ] Valor por defecto
- [ ] ¿Es obligatorio?

#### Checkboxes/Radios
- [ ] Nombre del campo
- [ ] Opciones disponibles
- [ ] ¿Es obligatorio?

#### Áreas de Texto
- [ ] Nombre del campo
- [ ] Placeholder
- [ ] ¿Es obligatorio?
- [ ] Límite de caracteres

#### Botones y Acciones
- [ ] Texto del botón
- [ ] Acción que ejecuta
- [ ] Validaciones previas

### 3. Lógica de Negocio
- [ ] ¿Hay pasos múltiples en el formulario?
- [ ] ¿Qué campos dependen de otros?
- [ ] ¿Hay cálculos automáticos?
- [ ] ¿Cómo se manejan los precios?
- [ ] ¿Hay validaciones especiales?

### 4. Flujo Completo
- [ ] ¿Qué pasa al enviar el formulario?
- [ ] ¿Hay confirmación?
- [ ] ¿Se genera algún documento?
- [ ] ¿Hay notificaciones?

---

## 🎬 PRÓXIMOS PASOS

### Opción A: Captura Manual (RECOMENDADA - MÁS RÁPIDA)

**El usuario debe:**
1. Navegar a https://imfohsalab.genbri.com/home
2. Hacer login con las credenciales proporcionadas
3. Ir a "REALIZAR PEDIDO" (https://imfohsalab.genbri.com/pages/orden)
4. Tomar screenshots del formulario completo
5. Compartir los screenshots o el HTML de la página

**El agente hará:**
1. Analizar los screenshots/HTML
2. Documentar TODO en `servicios.md`
3. Crear la estructura de datos necesaria
4. Diseñar la implementación en DentalFlow

### Opción B: Mejorar Script Playwright

**Acciones:**
1. Analizar screenshots existentes para identificar selectores correctos
2. Ajustar el script con selectores más específicos
3. Agregar más tiempo de espera
4. Reintentar la automatización

### Opción C: Inspección Manual del Código

**El usuario debe:**
1. Navegar al formulario
2. Abrir DevTools (F12)
3. Copiar el HTML completo de la página
4. Pegar el HTML aquí

---

## 📁 ARCHIVOS RELACIONADOS

### Creados
- ✅ `INSTRUCCIONES/servicios.md` (vacío, esperando datos)
- ✅ `INSTRUCCIONES/MEMORIA_IMFOHSA.md` (este archivo)
- ✅ `scripts/capture_imfohsa.js` (script de automatización)
- ✅ `screenshots/01_login_page.png`
- ✅ `screenshots/error.png`

### Por Crear
- ⏳ `servicios.md` (completo con toda la documentación)
- ⏳ `src/app/debug/odontograma-demo/page.tsx` (página demo aislada)
- ⏳ Componentes necesarios para replicar la lógica

---

## 🔗 CREDENCIALES DE ACCESO

**URL:** https://imfohsalab.genbri.com/home  
**Usuario:** asesorcomercial@sitintegrados.com  
**Contraseña:** Abc123  
**URL Formulario:** https://imfohsalab.genbri.com/pages/orden

---

## ⚠️ BLOQUEADORES ACTUALES

1. **Browser Subagent:** Error 429 (límite de tasa)
2. **Script Playwright:** Login automático falló
3. **Falta información:** No podemos proceder sin acceso al formulario

**SOLUCIÓN:** Requiere intervención manual del usuario para capturar la información.

---

## 📝 NOTAS IMPORTANTES

- El cliente actual usa IMFOHSA Lab y quiere reemplazarlo con DentalFlow
- La lógica del odontograma debe ser IDÉNTICA a la de IMFOHSA
- Esto es CRÍTICO para la adopción del sistema
- Debemos documentar TODO, no solo lo visible

---

## ✅ CRITERIOS DE ÉXITO

El análisis estará completo cuando tengamos:

1. ✅ Documentación completa en `servicios.md` con:
   - Todos los campos del formulario
   - Todas las opciones de selectores
   - Toda la lógica de negocio
   - Flujo completo paso a paso

2. ✅ Screenshots de referencia de:
   - Página de login
   - Dashboard
   - Formulario completo de pedido
   - Resultado después de enviar

3. ✅ Página demo del odontograma creada y funcionando

4. ✅ Lógica implementada y probada

---

**Última actualización:** 2026-01-03 19:04  
**Estado:** ESPERANDO CAPTURA MANUAL DEL USUARIO
