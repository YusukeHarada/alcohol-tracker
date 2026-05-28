create table user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  daily_limit_g numeric not null default 40,
  weekly_rest_days integer not null default 2,
  weekly_limit_g numeric not null default 200,
  updated_at timestamptz default now()
);

alter table user_goals enable row level security;

create policy "own goal only"
  on user_goals for all using (auth.uid() = user_id);
