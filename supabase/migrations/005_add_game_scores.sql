alter table public.games
add column if not exists team_score integer check (team_score >= 0),
add column if not exists opponent_score integer check (opponent_score >= 0);
