-- Create competitors table
create table if not exists public.competitors (
  id uuid not null default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  competitor_name text not null,
  competitor_price numeric not null check (competitor_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint competitors_pkey primary key (id)
);

-- Index for foreign key lookups
create index if not exists competitors_preset_id_idx on public.competitors (preset_id);

-- Enable Row Level Security
alter table public.competitors enable row level security;

-- RLS Policies
-- Users can view/modify competitors if they own the parent preset
create policy "Users can manage competitors for their own presets"
  on public.competitors
  using (
    exists (
      select 1 from public.presets
      where presets.id = competitors.preset_id
      and presets.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.presets
      where presets.id = competitors.preset_id
      and presets.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updating updated_at
create trigger handle_updated_at
  before update on public.competitors
  for each row
  execute function public.handle_updated_at();

-- Function to enforce max 5 competitors per preset with concurrency safety
create or replace function public.check_competitor_limit()
returns trigger as $$
declare
  current_count integer;
begin
  -- Lock the parent preset row to serialize inserts for this preset
  -- This prevents race conditions where two concurrent transactions both see count=4
  perform 1 from public.presets where id = new.preset_id for update;
  
  select count(*) into current_count
  from public.competitors
  where preset_id = new.preset_id;

  if current_count >= 5 then
    raise exception 'Maximum of 5 competitors allowed per preset.';
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Trigger to enforce the limit
create trigger enforce_competitor_limit
  before insert on public.competitors
  for each row
  execute function public.check_competitor_limit();
