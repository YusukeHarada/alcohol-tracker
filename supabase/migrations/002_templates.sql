create table drink_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  items jsonb not null default '[]',
  created_at timestamptz default now()
);

alter table drink_templates enable row level security;

create policy "own templates only"
  on drink_templates for all using (auth.uid() = user_id);
