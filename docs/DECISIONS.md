# Architectural & Design Decisions

## 2026-02-02: Patient-Guardian Relationship
- **Context:** Patients (minors/elderly) need guardians.
- **Decision:** 
  - Store guardian as a `Patient` record in `patients` table.
  - Add self-referencing `guardian_id` FK to `patients` table.
  - Use `guardian_relationship` field to describe the link (Mother, Father, etc).
  - Enforce `id_type` as lowercase ('dpi', 'passport') for consistency.
- **Consequences:** 
  - Allows guardians to be patients themselves later.
  - Requires recursive queries if looking up deep trees (though only 1 level needed now).
