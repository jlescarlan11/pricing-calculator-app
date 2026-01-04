-- Create Presets Table
create table public.presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  preset_type text not null check (preset_type in ('single', 'variants')),
  
  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_synced_at timestamp with time zone default now(),

  -- Base Recipe
  batch_size numeric not null default 1,
  ingredients jsonb not null default '[]'::jsonb,
  labor_cost numeric not null default 0,
  overhead_cost numeric not null default 0,
  
  -- Single Pricing (Optional)
  pricing_strategy text check (pricing_strategy in ('markup', 'margin')),
  pricing_value numeric,
  current_selling_price numeric,
  
  -- Variants
  variants jsonb default '[]'::jsonb
);

-- Indexes
create index idx_presets_user_id on public.presets(user_id);
create index idx_presets_updated_at on public.presets(updated_at desc);
-- Full text search index on name
create index idx_presets_name_fts on public.presets using gin(to_tsvector('english', name));

-- RLS
alter table public.presets enable row level security;

create policy "Users can view own presets" on public.presets
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert own presets" on public.presets
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update own presets" on public.presets
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete own presets" on public.presets
  for delete using ((select auth.uid()) = user_id);

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_presets_updated
  before update on public.presets
  for each row execute procedure public.handle_updated_at();