alter table public.player_game_stats
add column if not exists missed_free_throws integer not null default 0 check (missed_free_throws >= 0);
