-- Migration: Add versioning and tracking metadata to presets table
-- Created at: 2026-01-07

-- UP MIGRATION
ALTER TABLE public.presets
ADD COLUMN IF NOT EXISTS snapshot_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_tracked_version BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS version_number INTEGER,
ADD COLUMN IF NOT EXISTS parent_preset_id UUID REFERENCES public.presets(id) ON DELETE CASCADE;

-- Create index for parent_preset_id for performance lookup
CREATE INDEX IF NOT EXISTS presets_parent_preset_id_idx ON public.presets(parent_preset_id);

-- DOWN MIGRATION (Commented out for safety, uncomment to rollback)
/*
DROP INDEX IF EXISTS presets_parent_preset_id_idx;

ALTER TABLE public.presets
  DROP COLUMN IF EXISTS parent_preset_id,
  DROP COLUMN IF EXISTS version_number,
  DROP COLUMN IF EXISTS is_tracked_version,
  DROP COLUMN IF EXISTS snapshot_date;
*/
