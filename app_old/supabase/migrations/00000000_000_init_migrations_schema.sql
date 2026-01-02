-- Initialize Supabase migrations schema
-- This must be run FIRST before any migrations can be tracked

create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
    version text primary key,
    name text,
    statements text[]
);
