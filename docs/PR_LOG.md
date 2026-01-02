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

## PR #2: Appointment Logic & Service Mapping
- **Date:** 2026-02-02
- **Description:** 
  - Enhance `createAppointment` logic.
  - Create table `appointment_services` to map appointments to `schema_lab.services`.
  - Implement Overlap Check for doctors (prevent double booking).
  - Connect Frontend "Guardar" to pass `service_id`.
  - Migration: `20260202000001_appointment_logic.sql` (Applied via RPC `exec_sql`).
- **Status:** **Completed & Verified** (Commit: `feat(pr-2): implement appointment creation...`)

## PR #3: Agenda View improvements & Status Management (In Progress)
- **Date:** 2026-02-02
- **Description:** 
  - **Calendar View**: Color-coded events based on status (Scheduled=Blue, Confirmed=Green, Cancelled=Red, Completed=Gray).
  - **Edit Modal**: Added transitions for Confirm, Complete, and Cancel actions.
  - **Backend**: Added `updateAppointmentStatus` server action.
- **Status:** In Review
