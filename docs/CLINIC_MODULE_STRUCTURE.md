# 📋 Estructura Final del Módulo de Clínica - DentalFlow

**Fecha:** 2025-12-31
**Decisión:** Usar sidebar vertical (NO horizontal) para mantener consistencia

---

## ✅ **Menú del Módulo de Clínica (Sidebar)**

### **1. Clínica (Principal)**
- **Dashboard** → `/dashboard/medical`
- **Agenda** → `/dashboard/medical/appointments` (Calendario de citas)
- **Pacientes** → `/dashboard/medical/patients`

### **2. Caja (Gestión Financiera)**
- **Cobrar** → `/dashboard/medical/cashier` (Cobro a pacientes)
- **Proveedores** → `/dashboard/medical/suppliers`
- **Cuentas por Pagar** → `/dashboard/medical/accounts-payable`
- **Cuentas por Cobrar** → `/dashboard/medical/accounts-receivable`
- **SAT / Facturación** → `/dashboard/medical/invoicing` (FEL)
- **Pasarela de Pago** → `/dashboard/medical/payment-gateway` (Recurrente)

### **3. Servicios**
- **Servicios** → `/dashboard/medical/services` (Sincronizados de Odoo)
- **Farmacia** → `/dashboard/medical/pharmacy` (Medicamentos)

### **4. Análisis**
- **Productividad** → `/dashboard/medical/productivity` (KPIs)
- **Reportes** → `/dashboard/medical/reportes`

### **5. Laboratorios**
- **Órdenes de Lab** → `/dashboard/medical/lab-orders` (Órdenes médicas)

---

## 🔑 **Reglas de Negocio Clave**

### **Caja (NO usa Odoo)**
- ✅ Cobros directos a pacientes
- ✅ Gestión de proveedores locales
- ✅ Cuentas por pagar/cobrar
- ✅ Facturación electrónica (FEL/SAT)
- ✅ Pasarela de pago (Recurrente)
- ❌ **NO se sincroniza con Odoo**

### **Servicios (SÍ usa Odoo)**
- ✅ Sincronizados desde Odoo
- ✅ Muestra: nombre, precio, foto (si existe)
- ✅ Permite agregar servicios de otros proveedores

### **Farmacia (NO usa Odoo)**
- ✅ Gestión de medicamentos
- ✅ Inventario de farmacia
- ✅ Control de stock
- ❌ **NO se sincroniza con Odoo**

### **Laboratorios (Mixto)**
- ✅ Órdenes de laboratorio médico
- ✅ Servicios de Odoo disponibles
- ✅ Permite agregar servicios de otros proveedores
- ✅ Seguimiento de órdenes

---

## 📊 **Base de Datos - Schemas**

### **Tablas en Supabase:**

#### **Schema: `schema_medical`**
```sql
-- Pacientes
schema_medical.patients
schema_medical.clinical_findings
schema_medical.evolution_notes

-- Citas
schema_medical.appointments

-- Caja (NO Odoo)
schema_medical.cashier_transactions
schema_medical.suppliers
schema_medical.accounts_payable
schema_medical.accounts_receivable
schema_medical.invoices
schema_medical.payment_gateway_config

-- Farmacia (NO Odoo)
schema_medical.pharmacy_products
schema_medical.pharmacy_inventory
schema_medical.pharmacy_sales

-- Laboratorios
schema_medical.lab_orders
schema_medical.lab_providers
```

#### **Schema: `schema_lab` (Odoo)**
```sql
-- Servicios sincronizados de Odoo
schema_lab.services
schema_lab.orders
```

---

## 🚀 **Próximos Pasos (Prioridades)**

### **Alta Prioridad:**
1. ✅ Dashboard de clínica (vista general)
2. ✅ Agenda/Calendario (ya existe)
3. ✅ Pacientes (ya funciona)
4. ❌ **Caja - Cobrar** (crear módulo)
5. ❌ **Servicios** (mostrar desde Odoo)

### **Media Prioridad:**
6. ❌ Farmacia
7. ❌ Proveedores
8. ❌ Cuentas por pagar/cobrar

### **Baja Prioridad:**
9. ❌ SAT/Facturación
10. ❌ Pasarela de pago
11. ❌ Productividad
12. ❌ Reportes

---

## ⚠️ **Decisiones Importantes**

### **1. NO usar navegación horizontal**
- ❌ Se descartó el diseño horizontal de Doctocliq
- ✅ Se mantiene sidebar vertical para consistencia
- ✅ Todos los módulos (Lab, Core, Medical) comparten el mismo layout

### **2. Independencia de Módulos**
- ✅ Cada módulo tiene sus propias tablas
- ✅ Cada módulo tiene sus propios componentes
- ✅ Cambios en un módulo NO afectan a otros
- ✅ Comparten: UI components, Supabase client, utilidades

### **3. Integración con Odoo**
- ✅ **Servicios:** Sincronizados de Odoo
- ❌ **Caja:** NO usa Odoo
- ❌ **Farmacia:** NO usa Odoo
- ✅ **Laboratorios:** Mixto (Odoo + otros proveedores)

---

## 📝 **Notas Técnicas**

### **Supabase:**
- Todas las tablas del módulo de clínica están en `schema_medical`
- RLS habilitado en todas las tablas
- Multi-tenancy con `clinic_id`

### **Frontend:**
- React 18 + Next.js 15 + TypeScript
- TailwindCSS + shadcn/ui
- Server Actions para queries
- Sidebar compartido en `/dashboard/layout.tsx`

---

**Última actualización:** 2025-12-31 13:56
**Estado:** Estructura de menús completa, pendiente implementación de módulos
