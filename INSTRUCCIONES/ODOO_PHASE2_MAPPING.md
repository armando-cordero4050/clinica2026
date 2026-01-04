# Odoo Sync Phase 2: Productos, Ventas y Facturas

## 1. Productos (Services/Consumables)
**Odoo Model:** `product.template`
**Target Table:** `schema_lab.services` (y posible tabla futura para inventario)

### Mapeo de Campos
| Odoo Field | DentalFlow Field | Tipo | Notas |
|------------|------------------|------|-------|
| `id` | `odoo_id` | INT | Unique ID |
| `name` | `name` | TEXT | Nombre |
| `default_code` | `code` | TEXT | Si vacío → generar "ODOO-{id}" |
| `list_price` | `base_price` | DEC | Si vacío → 0.00 |
| `detailed_type` | `type` | TEXT | 'service', 'consu', 'product' |
| `categ_id`[1] | `category`* | TEXT | *Requiere mapeo manual o relax constraint |

**⚠️ Conflicto de Categoría:**
DB actual tiene CHECK: `('fija', 'removible', 'ortodoncia', 'implantes')`
Odoo tiene: "Laboratorio", "All", "Saleable", etc.
**Acción Planificada:** 
1. Añadir columna `odoo_category` a `services`.
2. Mapear por defecto a 'fija' si no coincide, o 'otros' si ampliamos el enum.

## 2. Ventas (Sales Orders)
**Odoo Model:** `sale.order`
**Target Table:** `schema_medical.clinic_invoices` (o nueva tabla `odoo_sales`)

### Mapeo de Campos
| Odoo Field | DentalFlow Field | Notas |
|------------|------------------|-------|
| `id` | `odoo_id` | PK de Odoo |
| `name` | `invoice_number` | Ej: S00001 |
| `partner_id` | `clinic_id` | Relacionar via `schema_medical.clinics.odoo_id` |
| `amount_total` | `total` | 0.0 si nulo |
| `state` | `status` | Map: draft→pending, sale→paid |
| `date_order` | `created_at` | |

## 3. Facturas (Invoices)
**Odoo Model:** `account.move` (move_type='out_invoice')
**Target Table:** `schema_medical.payments` o Visor separado

---

## 🧪 Estrategia de Implementación
1. **Productos Primero:** Es dependencia para ventas.
2. **Scripts TypeScript:**
   - Crear `sync-products.ts` separado de `sync.ts` actual para modularidad.
   - Usar `odoo-client.ts` existente.
3. **Migración SQL:**
   - Añadir columnas faltantes a `schema_lab.services` (`odoo_category`, `type`).
   - Relajar constraint de `category` o crear función de mapeo.
