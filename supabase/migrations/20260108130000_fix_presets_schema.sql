-- Migration: Fix missing columns in presets table
-- Created at: 2026-01-08
-- Description: Ensures critical JSONB columns exist. This fixes the "Could not find the base_recipe column" error.

-- UP MIGRATION
ALTER TABLE public.presets
ADD COLUMN IF NOT EXISTS base_recipe jsonb not null default '{}'::jsonb,
ADD COLUMN IF NOT EXISTS variants jsonb not null default '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_config jsonb not null default '{}'::jsonb;

-- Force schema cache reload for PostgREST
NOTIFY pgrst, 'reload schema';
