# 🚀 Release Notes v1.0.0 - Clinica2026 Launch

**Fecha:** 2026-01-05
**Repository:** clinica2026
**Branch:** main

---

## 🌟 Resumen Ejecutivo

Esta versión (v1.0.0) establece la base sólida para el sistema **DentalFlow (Clinica2026)**. Incluye la arquitectura completa Multi-tenant, el módulo médico con odontograma interactivo, y el módulo de laboratorio con un Wizard avanzado de órdenes que soporta SLA estricto y órdenes Express.

---

## 📦 Módulos Entregados

### 1. **Core & Arquitectura**
- **Multi-tenancy:** Implementado via `clinic_id` en todas las tablas críticas.
- **Seguridad:** RLS (Row Level Security) activo y configurado.
- **Roles:** Sistema de roles (admin, doctor, lab_staff) funcional.
- **Stack:** Next.js 14+, Tailwind, Supabase, Shadcn/ui.

### 2. **Módulo Médico**
- **Pacientes:** CRUD completo con expedientes.
- **Odontograma:**
  - Visualización SVG interactiva (Adulto/Infantil).
  - Registro de hallazgos clínicos y de laboratorio.
  - Generación automática de presupuestos.
- **Integración:** Botón directo "CREAR ORDEN DE LAB" desde hallazgos.

### 3. **Módulo Laboratorio (Nuevo)**
- **Catálogo de Materiales (Admin):**
  - Gestión de Materiales (Zirconio, PMMA, etc.).
  - Configuraciones/Variantes con precios y SLA.
  - Integración preparada par Odoo.
- **Wizard de Órdenes (v3):**
  - **Paso 1:** Selección dinámica desde DB.
  - **Paso 2:**
    - **SLA Automático:** Cálculo de fecha de entrega saltando fines de semana.
    - **Modo Express:** Checkbox que habilita fecha manual con advertencias.
    - **Validación:** Control estricto de campos requeridos.
  - **Paso 3:** Revisión y confirmación (Pendiente de UI final de review).
- **Kanban:** Tablero de seguimiento de órdenes.

---

## 🔧 Cambios Técnicos Recientes

### **Base de Datos**
- Nuevas tablas: `lab_materials`, `lab_configurations`, `lab_prices`.
- Enum: `lab_price_type`.
- Políticas RLS actualizadas para lectura pública (auth) y escritura admin.

### **Frontend Components**
- `OrderWizard`: Modal responsivo y compacto.
- `ItemsConfiguration`: Lógica de negocio para SLA y Express.
- `ShadeMapSelector`: Selector de color VITA funcional.

---

## 📝 Documentación Actualizada
Los siguientes archivos constituyen la fuente de verdad del proyecto:
1. `README.md`: Guía de instalación y estructura.
2. `docs/ARCHITECTURE.md`: Definiciones arquitectónicas.
3. `docs/WIZARD_FINAL_CORRECCIONES.md`: Manual técnico del Wizard.
4. `docs/PLAN_CALENDARIO_LABORATORIO.md`: Roadmap para el calendario de capacidad.
5. `docs/PR_LOG.md`: Historial atómico de cambios.

---

## 🚀 Instrucciones de Despliegue
1. Clonar repositorio `clinica2026`.
2. Configurar variables de entorno (`.env.local`).
3. Ejecutar `npm install`.
4. Sincronizar DB: `supabase db push`.
5. Deploy en Vercel/Netlify.
