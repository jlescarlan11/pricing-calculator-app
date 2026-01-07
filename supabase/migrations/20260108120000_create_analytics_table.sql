-- Create analytics table
create table if not exists public.analytics (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preset_id uuid not null references public.presets(id) on delete cascade,
  event_type text not null, -- e.g., 'view', 'click', 'export'
  metadata jsonb default '{}'::jsonb,
  clicked_at timestamptz not null default now(),
  
  constraint analytics_pkey primary key (id)
);

-- Indexes for performance
create index if not exists analytics_user_id_clicked_at_idx on public.analytics(user_id, clicked_at);
create index if not exists analytics_clicked_at_desc_idx on public.analytics(clicked_at desc);

-- Enable Row Level Security
alter table public.analytics enable row level security;

-- RLS Policies
create policy "Users can insert their own analytics"
  on public.analytics for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own analytics"
  on public.analytics for select
  using (auth.uid() = user_id);
