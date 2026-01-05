-- Enable RLS
alter table if exists public.presets enable row level security;

-- Create presets table
create table if not exists public.presets (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  preset_type text not null default 'default',
  base_recipe jsonb not null default '{}'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  pricing_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_synced_at timestamptz,
  
  constraint presets_pkey primary key (id)
);

-- Policies
create policy "Users can view their own presets"
  on public.presets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own presets"
  on public.presets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own presets"
  on public.presets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own presets"
  on public.presets for delete
  using (auth.uid() = user_id);

-- Optional: Create an index on user_id for faster lookups
create index if not exists presets_user_id_idx on public.presets (user_id);
