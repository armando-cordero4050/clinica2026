# Supabase Schema Snapshot

**Generated:** 2026-01-05T03:54:03.377Z

**Method:** Direct table inspection via Supabase client

---

## ✅ Table: `clinics`

- **Row Count:** 3
- **Status:** Accessible

### Sample Columns

```json
[
  "id",
  "name",
  "address",
  "city",
  "country",
  "phone",
  "email",
  "nit",
  "website",
  "is_active",
  "created_at",
  "updated_at",
  "odoo_partner_id",
  "odoo_raw_data",
  "last_synced_from_odoo"
]
```

---

## ✅ Table: `users`

- **Row Count:** 3
- **Status:** Accessible

### Sample Columns

```json
[
  "id",
  "email",
  "name",
  "role",
  "is_pending_activation",
  "created_at",
  "updated_at"
]
```

---

## ✅ Table: `patients`

- **Row Count:** 1
- **Status:** Accessible

### Sample Columns

```json
[
  "id",
  "clinic_id",
  "full_name",
  "date_of_birth",
  "phone",
  "email",
  "address",
  "allergies",
  "medical_conditions",
  "created_at",
  "updated_at",
  "id_type",
  "id_number",
  "first_name",
  "last_name",
  "gender",
  "mobile",
  "city",
  "state",
  "country",
  "zip_code",
  "guardian_name",
  "guardian_relationship",
  "guardian_phone",
  "blood_type",
  "current_medications",
  "chronic_conditions",
  "emergency_contact_name",
  "emergency_contact_phone",
  "emergency_contact_relationship",
  "patient_code",
  "insurance_provider",
  "insurance_policy_number",
  "acquisition_source",
  "acquisition_source_detail",
  "tags",
  "patient_rating",
  "administrative_notes",
  "odoo_partner_id",
  "odoo_raw_data",
  "last_synced_to_odoo",
  "is_active",
  "created_by",
  "guardian_id"
]
```

---

## ✅ Table: `appointments`

- **Row Count:** 0
- **Status:** Accessible

---

## ✅ Table: `lab_orders`

- **Row Count:** 0
- **Status:** Accessible

---

## ✅ Table: `lab_order_items`

- **Row Count:** 0
- **Status:** Accessible

---

## ✅ Table: `lab_stages`

- **Row Count:** 0
- **Status:** Accessible

---

## ✅ Table: `lab_services`

- **Row Count:** 0
- **Status:** Accessible

---

## ✅ Table: `dental_chart`

- **Row Count:** 0
- **Status:** Accessible

---

## ✅ Table: `budgets`

- **Row Count:** 0
- **Status:** Accessible

---

## ✅ Table: `budget_items`

- **Row Count:** 0
- **Status:** Accessible

---

## ✅ Table: `odoo_customers`

- **Row Count:** 3
- **Status:** Accessible

### Sample Columns

```json
[
  "id",
  "odoo_partner_id",
  "name",
  "email",
  "phone",
  "vat",
  "street",
  "city",
  "country",
  "is_company",
  "raw_data",
  "last_synced",
  "created_at"
]
```

---

## ✅ Table: `odoo_products`

- **Row Count:** 1
- **Status:** Accessible

### Sample Columns

```json
[
  "id",
  "odoo_product_id",
  "name",
  "default_code",
  "list_price",
  "standard_price",
  "type",
  "categ_id",
  "uom_id",
  "raw_data",
  "last_synced",
  "created_at"
]
```

---

## ✅ Table: `settings`

- **Row Count:** 0
- **Status:** Accessible

---

