# PR Log

## PR #1: Appointment Modal Refinement and Guardian Support
- **Date:** 2026-02-02
- **Description:** 
  - Redesigned appointment modal (`new-appointment-modal.tsx`).
  - Implemented guardian support (New/Existing, Tabs, Search).
  - Added `RadioGroup` component.
  - Linked patient to guardian via `guardian_id`.
  - Created migration `20260202000000_add_guardian_id.sql`.
- **Status:** **Completed & Verified** (Commit: `feat(pr-1): implement appointment modal...`)

## PR #2: Appointment Logic & Service Mapping (In Progress)
- **Date:** 2026-02-02
- **Description:** 
  - Enhance `createAppointment` logic.
  - Create table `appointment_services` to map appointments to `lab_services` (via `clinic_service_prices`).
  - Implement Overlap Check for doctors (prevent double booking).
  - Connect Frontend "Guardar" to pass `service_id`.
  - Migration: `20260202000001_appointment_logic.sql`.
- **Status:** In Review (Pending SQL Execution)
