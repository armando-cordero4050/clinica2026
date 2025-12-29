-- Migration: 20251224_000_enable_extensions.sql
-- Purpose: Enable required PostgreSQL extensions before other migrations
-- This must run FIRST before any other migrations

-- Enable pgcrypto for uuid_generate_v4()
create extension if not exists "pgcrypto";

-- Enable uuid-ossp as backup (provides uuid_generate_v4 as well)
create extension if not exists "uuid-ossp";
