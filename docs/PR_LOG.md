# PR Log

## PR #1: Appointment Modal Refinement and Guardian Support
- **Date:** 2026-02-02
- **Description:** 
  - Redesigned appointment modal (`new-appointment-modal.tsx`) to match DoctoCLIQ specs.
  - Added inline patient creation with Document Type (DPI/PASSPORT) and validation.
  - Implemented guardian support:
    - New/Existing guardian tabs.
    - Dynamic guardian search.
    - Linked guardian to patient via `guardian_id`.
  - Added `RadioGroup` component.
  - Updated `actions.ts` to handle atomic patient+guardian creation and lowercase ID types.
  - Created migration `20260202000000_add_guardian_id.sql`.
- **Status:** Ready for Review
