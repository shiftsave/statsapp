create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  jersey_number integer,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  game_date date not null,
  opponent text,
  location text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.player_game_stats (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete restrict,
  offensive_rebounds integer not null default 0 check (offensive_rebounds >= 0),
  defensive_rebounds integer not null default 0 check (defensive_rebounds >= 0),
  steals integer not null default 0 check (steals >= 0),
  turnovers integer not null default 0 check (turnovers >= 0),
  made_baskets integer not null default 0 check (made_baskets >= 0),
  made_free_throws integer not null default 0 check (made_free_throws >= 0),
  assessment_score integer check (assessment_score between 1 and 5),
  assessment_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (game_id, player_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists player_game_stats_set_updated_at on public.player_game_stats;

create trigger player_game_stats_set_updated_at
before update on public.player_game_stats
for each row
execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.player_game_stats enable row level security;

drop policy if exists "Public players access" on public.players;
create policy "Public players access"
on public.players
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public games access" on public.games;
create policy "Public games access"
on public.games
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public stats access" on public.player_game_stats;
create policy "Public stats access"
on public.player_game_stats
for all
to anon, authenticated
using (true)
with check (true);

create index if not exists players_is_active_idx on public.players (is_active);
create index if not exists games_game_date_idx on public.games (game_date desc);
create index if not exists player_game_stats_game_id_idx on public.player_game_stats (game_id);
create index if not exists player_game_stats_player_id_idx on public.player_game_stats (player_id);
