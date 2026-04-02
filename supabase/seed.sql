-- Players
insert into public.players (id, name, jersey_number) values
  ('a1000000-0000-0000-0000-000000000001', 'Mika Torres', 12),
  ('a1000000-0000-0000-0000-000000000002', 'Jordan Lee', 5),
  ('a1000000-0000-0000-0000-000000000003', 'Avery Chen', 23),
  ('a1000000-0000-0000-0000-000000000004', 'Riley Johnson', 8),
  ('a1000000-0000-0000-0000-000000000005', 'Sam Okafor', 11),
  ('a1000000-0000-0000-0000-000000000006', 'Casey Nguyen', 3),
  ('a1000000-0000-0000-0000-000000000007', 'Drew Patel', 15),
  ('a1000000-0000-0000-0000-000000000008', 'Alex Rivera', 7),
  ('a1000000-0000-0000-0000-000000000009', 'Taylor Kim', 20),
  ('a1000000-0000-0000-0000-000000000010', 'Morgan Blake', 30),
  ('a1000000-0000-0000-0000-000000000011', 'Kai Hernandez', 24),
  ('a1000000-0000-0000-0000-000000000012', 'Jamie Wu', 10);

-- Completed games
insert into public.games (id, game_date, opponent, location, status, team_score, opponent_score) values
  ('b1000000-0000-0000-0000-000000000001', '2026-03-08', 'Westside Wolves', 'Home', 'completed', 42, 36),
  ('b1000000-0000-0000-0000-000000000002', '2026-03-15', 'East Valley Eagles', 'Away', 'completed', 38, 45),
  ('b1000000-0000-0000-0000-000000000003', '2026-03-22', 'Central Cougars', 'Home', 'completed', 50, 48);

-- Open (in-progress) games
insert into public.games (id, game_date, opponent, location, status) values
  ('b1000000-0000-0000-0000-000000000004', '2026-04-03', 'North Ridge Ravens', 'Home', 'in_progress'),
  ('b1000000-0000-0000-0000-000000000005', '2026-04-10', 'Lakeside Lions', 'Away', 'in_progress');

-- Stats for completed game 1: vs Westside Wolves (W 42-36)
insert into public.player_game_stats (game_id, player_id, offensive_rebounds, defensive_rebounds, steals, turnovers, made_baskets, made_free_throws, missed_free_throws) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 2, 3, 1, 2, 4, 2, 1),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 1, 4, 3, 1, 5, 1, 0),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 3, 2, 0, 3, 3, 0, 2),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 0, 1, 2, 1, 2, 3, 1),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 1, 5, 1, 0, 3, 2, 0);

-- Stats for completed game 2: vs East Valley Eagles (L 38-45)
insert into public.player_game_stats (game_id, player_id, offensive_rebounds, defensive_rebounds, steals, turnovers, made_baskets, made_free_throws, missed_free_throws) values
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 1, 2, 0, 3, 3, 1, 2),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 0, 3, 2, 2, 4, 2, 1),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 2, 1, 1, 1, 2, 0, 0),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 1, 2, 0, 2, 3, 1, 1),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 0, 4, 3, 1, 2, 3, 0),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 1, 1, 1, 2, 1, 0, 1);

-- Stats for completed game 3: vs Central Cougars (W 50-48)
insert into public.player_game_stats (game_id, player_id, offensive_rebounds, defensive_rebounds, steals, turnovers, made_baskets, made_free_throws, missed_free_throws) values
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 3, 4, 2, 1, 6, 3, 1),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 1, 2, 1, 2, 4, 2, 0),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 2, 3, 0, 1, 3, 1, 2),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 0, 1, 3, 0, 2, 4, 1),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 1, 3, 1, 2, 5, 0, 0),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', 2, 2, 2, 1, 3, 2, 1),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 0, 1, 0, 3, 1, 0, 2);

-- Some stats for in-progress game 4 (today's game, partially tracked)
insert into public.player_game_stats (game_id, player_id, offensive_rebounds, defensive_rebounds, steals, turnovers, made_baskets, made_free_throws, missed_free_throws) values
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 1, 2, 1, 0, 3, 1, 0),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 0, 1, 0, 1, 2, 0, 1),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 1, 0, 2, 0, 1, 1, 0);
