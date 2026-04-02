-- Game clock state: tracks timer and current period per game
create table if not exists public.game_clock (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  status text not null default 'stopped' check (status in ('running', 'stopped')),
  current_period integer not null default 1 check (current_period between 1 and 4),
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  started_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (game_id)
);

drop trigger if exists game_clock_set_updated_at on public.game_clock;

create trigger game_clock_set_updated_at
before update on public.game_clock
for each row
execute function public.set_updated_at();

-- Substitution events log
create table if not exists public.player_substitutions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_in_id uuid not null references public.players(id) on delete cascade,
  player_out_id uuid not null references public.players(id) on delete cascade,
  period integer not null check (period between 1 and 4),
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

-- Add court status and playing time to existing stats table
alter table public.player_game_stats
add column if not exists is_on_court boolean not null default false,
add column if not exists total_time_played_seconds integer not null default 0 check (total_time_played_seconds >= 0);

-- RLS
alter table public.game_clock enable row level security;
alter table public.player_substitutions enable row level security;

drop policy if exists "Public game_clock access" on public.game_clock;
create policy "Public game_clock access"
on public.game_clock
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public substitutions access" on public.player_substitutions;
create policy "Public substitutions access"
on public.player_substitutions
for all
to anon, authenticated
using (true)
with check (true);

-- Indexes
create index if not exists game_clock_game_id_idx on public.game_clock (game_id);
create index if not exists player_substitutions_game_id_idx on public.player_substitutions (game_id);
create index if not exists player_game_stats_is_on_court_idx on public.player_game_stats (game_id, is_on_court);
