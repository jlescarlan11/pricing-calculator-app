-- Migration: Fix preset_type check constraint
-- Created at: 2026-01-08
-- Description: Updates the check constraint to allow 'default' and 'variant' values, resolving the violation error.

-- 1. Drop the existing constraint if it exists (it might be named differently, so we try the standard name)
ALTER TABLE public.presets DROP CONSTRAINT IF EXISTS presets_preset_type_check;

-- 2. Add the correct constraint allowing both 'default' and 'variant'
ALTER TABLE public.presets ADD CONSTRAINT presets_preset_type_check 
  CHECK (preset_type IN ('default', 'variant'));

-- 3. Force schema cache reload
NOTIFY pgrst, 'reload schema';
