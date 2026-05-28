create table drink_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  category text not null,
  volume_ml numeric not null,
  alcohol_percent numeric not null,
  pure_alcohol_g numeric not null,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  total_alcohol_g numeric not null default 0,
  is_rest_day boolean generated always as (total_alcohol_g = 0) stored,
  unique(user_id, date)
);

alter table drink_records enable row level security;
alter table daily_summaries enable row level security;

create policy "own records only"
  on drink_records for all using (auth.uid() = user_id);

create policy "own summaries only"
  on daily_summaries for all using (auth.uid() = user_id);
