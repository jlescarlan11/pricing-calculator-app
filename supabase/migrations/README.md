# Database Migrations

This directory contains the SQL migration files for the Pricing Calculator App.

## Phase 3: Schema Migrations

The following migrations were implemented for Phase 3 to support versioning, competitor tracking, and analytics.

### Migration Order

1.  `20260107120000_add_presets_versioning.sql`
    *   **Description**: Extends the `presets` table with versioning metadata.
    *   **Changes**: Adds `snapshot_date`, `is_tracked_version`, `version_number`, `parent_preset_id`.
2.  `20260107130000_add_competitors_table.sql`
    *   **Description**: Creates the `competitors` table.
    *   **Changes**: Adds table with fields for competitor analysis and constraints (max 5 competitors).
3.  `20260108120000_create_analytics_table.sql`
    *   **Description**: Creates the `analytics` table.
    *   **Changes**: Adds table for tracking user interactions with optimized indexes.

## Rollback Procedures

To rollback changes, execute the following SQL commands in **reverse order** (Analytics → Competitors → Presets).

### 1. Rollback Analytics Table
*File: `20260108120000_create_analytics_table.sql`*

```sql
DROP TABLE IF EXISTS public.analytics;
```

### 2. Rollback Competitors Table
*File: `20260107130000_add_competitors_table.sql`*

```sql
DROP TABLE IF EXISTS public.competitors;
```

### 3. Rollback Presets Extension
*File: `20260107120000_add_presets_versioning.sql`*

```sql
-- Remove the index
DROP INDEX IF EXISTS presets_parent_preset_id_idx;

-- Remove the columns
ALTER TABLE public.presets
  DROP COLUMN IF EXISTS parent_preset_id,
  DROP COLUMN IF EXISTS version_number,
  DROP COLUMN IF EXISTS is_tracked_version,
  DROP COLUMN IF EXISTS snapshot_date;
```
