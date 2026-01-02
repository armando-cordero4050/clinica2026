# Task Checklist - DentalFlow 2026 (Sprint Zero)

**Version:** 5.0 (Blueprint 2026)
**Stack:** Next.js 15, Supabase (Schema Isolated), React Native.

## Phase 0: Sprint Zero - The Foundation (Week 1)
- [ ] **Step 1: Project Reset & Architecture** <!-- id: 100 -->
    - [x] Archive Old V4 code to `app_old` <!-- id: 101 -->
    - [x] Initialize Next.js 15 Project (Web) <!-- id: 102 -->
    - [ ] Initialize React Native Project (Mobile) (Pending) <!-- id: 103 -->
    - [ ] Setup Monorepo Structure (or Hybrid) <!-- id: 104 -->

- [ ] **Step 2: Database Schemas (Supabase Isolation)** <!-- id: 200 -->
    - [x] Create `schema_core` (Auth, Modules) (`supabase/migrations/2026...sql`) <!-- id: 201 -->
    - [x] Create `schema_lab` (Production, Inventory) <!-- id: 202 -->
    - [x] Create `schema_medical` (Patients, Odontogram) <!-- id: 203 -->
    - [x] Create `schema_logistics` (Tracking) <!-- id: 204 -->

- [ ] **Step 3: Core Module Implementation** <!-- id: 300 -->
    - [x] Auth System Foundation (Supabase Client + Middleware) <!-- id: 301 -->
    - [x] Login UI (Shadcn + Supabase Auth) <!-- id: 301b -->
    - [x] Module Installer GUI (Schema Core) <!-- id: 302 -->
    - [x] Odoo Connector (Basic Read) (Full Success: Auth + Data) <!-- id: 303 -->
    - [x] User Management (Admin) (Create/Update Users with Roles) <!-- id: 304 -->
    - [x] Documentation Migration (Move artifacts to docs/) <!-- id: 305 -->

## Phase 1: Lab Backbone (Week 2)
- [x] Kanban Board (Dynamic) <!-- id: 400 -->
    - [x] Schema & RPC Definition <!-- id: 400a -->
    - [x] UI Implementation (DnD) <!-- id: 400b -->
- [x] KPI Timers Logic (Play/Pause/Persist) <!-- id: 401 -->

## Phase 2: Medical Base (Week 3)
- [x] Patient EMR <!-- id: 500 -->
    - [x] Schema & RPC Definition <!-- id: 500a -->
    - [x] UI: Patient List & Create <!-- id: 500b -->
- [x] Appointments (Calendar) <!-- id: 502 -->
- [x] Odontogram 2.0 (Interactive) <!-- id: 501 -->
- [x] Architecture Integration (Dynamic Nav) <!-- id: 999 -->

## Archived (V4 Progress)
- [x] All V4 tasks archived in `app_old`.
