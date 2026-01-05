# Corrección: Campo "Express" Removido del Módulo Admin

**Fecha:** 2026-01-04 22:21  
**Tipo:** Corrección de diseño

---

## 🔧 Cambio Realizado

### **Antes:**
El formulario de configuración en el módulo admin incluía un checkbox "Permitir Orden Express" y la tabla mostraba una columna "Express".

### **Después:**
- ✅ Checkbox "Permitir Orden Express" **removido** del formulario
- ✅ Columna "Express" **removida** de la tabla de configuraciones
- ✅ Campo `is_express_allowed` permanece en DB con valor por defecto `true`

---

## 📝 Justificación

El campo `is_express_allowed` **NO** es una configuración del material, sino una **opción de la clínica** al momento de crear la orden en el **Wizard**.

### **Flujo Correcto:**

1. **Admin configura material:**
   - Nombre: "Zirconio Alemán"
   - Precio: Q890
   - SLA: 5 días (estándar)

2. **Clínica crea orden en Wizard:**
   - Selecciona material
   - **Decide si quiere Express o Normal**
   - Si elige Express:
     - SLA se reduce (a definir)
     - Costo adicional (a definir)
     - Advertencia: "Consulte a su asesor"

---

## 🗄️ Estado de la Base de Datos

El campo `is_express_allowed` **permanece en la tabla** `lab_configurations` pero:
- Siempre se crea con valor `true` por defecto
- No es editable desde el módulo admin
- Se usará en el futuro para deshabilitar Express en ciertos materiales si es necesario

---

## 📋 Archivos Modificados

1. **`configuration-form.tsx`**
   - Removido checkbox de Express
   - Removido campo del estado del formulario
   - Actualizado texto de ayuda de SLA

2. **`page.tsx`**
   - Removida columna "Express" de TableHeader
   - Removida celda "Express" de TableRow

---

## ✅ Resultado

El módulo admin ahora solo gestiona:
- ✅ Nombre del material
- ✅ Descripción
- ✅ Configuraciones (variantes)
- ✅ Precio base
- ✅ SLA estándar
- ✅ Código Odoo

La lógica de **"Orden Express"** se implementará en el **Wizard** (Fase 2.5 pendiente).

---

**Corrección aplicada por:** Antigravity AI  
**Aprobado por:** Usuario
