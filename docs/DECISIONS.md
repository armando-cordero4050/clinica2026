# Architectural & Design Decisions

## 2026-02-02: Patient-Guardian Relationship
- **Context:** Patients (minors/elderly) need guardians.
- **Decision:** 
  - Store guardian as a `Patient` record.
  - Add self-referencing `guardian_id` FK.
  - Enforce lowercase `id_type`.

## 2026-02-02: Appointment Services & Scheduling
- **Context:** Appointments are created with a specific "Service" (Reason).
- **Decision:** 
  - Create `appointment_services` join table to link `appointments` and `lab_services`.
  - Though currently only 1 service is selected in UI, this table supports future N services per appointment.
  - Store `price` snapshot in `appointment_services` to preserve historical pricing.
  - Implement Doctor Availability Check (Overlap) inside the `create_appointment_rpc` for atomicity.
  - `status` defaults to 'scheduled'.
