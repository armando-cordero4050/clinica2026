# Implementation Plan - Blueprint 2026 (Sprint Zero)

**Goal**: Establish the foundational architecture for DentalFlow 2026 using Next.js 15, React Native, and Isolated Supabase Schemas.

## User Review Required
> [!IMPORTANT]
> **Architecture Shift**: We are moving from a Single-Tenant / Single-Schema approach to a **Multi-Schema (Core/Medical/Lab/Logistics)** approach. This requires completely fresh database migrations.
> **Stack**: Next.js 15 (App Router) is now the core web framework.

## Proposed Changes

### 1. New Project Structure (Web)
- **Framework**: Next.js 15 (App Router).
- **Location**: `src/app`, `src/components`, `src/lib`.
- **UI System**: Shadcn/UI (Radix + Tailwind).

### 2. Database Modernization (Supabase)
We will implement 4 distinct schemas to ensure strict data governance.

#### `schema_core` (Governance)
- `users` (RBAC)
- `modules` (Feature Flags)
- `global_configuration`

#### `schema_lab` (Production)
- `orders` (Kanban)
- `order_items`
- `services` (Synced from Odoo)

#### `schema_medical` (Clinical)
- `patients`: UUID, Name, DOB, Phone, Email, Address, Allergies (JSONB).
- `odontograms`: Link to patient, status JSONB (teeth state).
- `appointments`: Start/End, Doctor, Patient, Status (Scheduled, Confirmed, Cancelled).
- `clinical_history`: Time-series of visits/notes.

### 4. Phase 2: Medical Base
- **Goal**: Functional Patient Directory and EMR.
- **Pages**:
    - `/dashboard/medical/patients` (List)
    - `/dashboard/medical/patients/[id](Odontogram)`
    - `/dashboard/medical/appointments` (Calendar)
- **Actions**: `createPatient`, `getPatients`, `saveOdontogram`.

#### `schema_logistics` (Delivery)
- `courier_tracking`
- `delivery_routes`

### 3. Integrations (Stubs & Core)
- **Odoo Connector**: XML-RPC client to fetch products/partners.
- **Supabase Auth**: Configured to work with the new `schema_core.users`.

## Verification Plan

### Automated Tests
- `npm run build`: Verify Next.js build passes.
- `npm run lint`: Verify ESLint compliance.

### Manual Verification
- **DB Check**: Verify schemas are created in Supabase Dashboard (or via SQL query).
- **Frontend**: Verify Landing Page / Dashboard loads.
- **Auth**: Verify Login maps to a user in `schema_core`.
