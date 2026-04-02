create table if not exists public.reflection_questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.player_reflection_answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  question_id uuid not null references public.reflection_questions(id) on delete cascade,
  response_value integer not null check (response_value between 1 and 4),
  created_at timestamptz not null default timezone('utc', now()),
  unique (game_id, player_id, question_id)
);

create table if not exists public.player_reflection_notes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  next_game_goal text,
  favorite_thing text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (game_id, player_id)
);

drop trigger if exists player_reflection_notes_set_updated_at on public.player_reflection_notes;

create trigger player_reflection_notes_set_updated_at
before update on public.player_reflection_notes
for each row
execute function public.set_updated_at();

alter table public.reflection_questions enable row level security;
alter table public.player_reflection_answers enable row level security;
alter table public.player_reflection_notes enable row level security;

drop policy if exists "Public reflection questions access" on public.reflection_questions;
create policy "Public reflection questions access"
on public.reflection_questions
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public reflection answers access" on public.player_reflection_answers;
create policy "Public reflection answers access"
on public.player_reflection_answers
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public reflection notes access" on public.player_reflection_notes;
create policy "Public reflection notes access"
on public.player_reflection_notes
for all
to anon, authenticated
using (true)
with check (true);

create index if not exists reflection_questions_sort_order_idx on public.reflection_questions (sort_order);
create index if not exists player_reflection_answers_player_id_idx on public.player_reflection_answers (player_id);
create index if not exists player_reflection_answers_game_id_idx on public.player_reflection_answers (game_id);
create index if not exists player_reflection_notes_player_id_idx on public.player_reflection_notes (player_id);
create index if not exists player_reflection_notes_game_id_idx on public.player_reflection_notes (game_id);

insert into public.reflection_questions (prompt, sort_order)
select prompt, sort_order
from (
  values
    ('I was prepared mentally and physically for the game', 1),
    ('I made an effort to lift my team''s spirits during our warm up (High Fives, Positive body language, uplifting words)', 2),
    ('I was focused and engaged during time outs and breaks', 3),
    ('I gave 100% effort and hustle on defence', 4),
    ('I remembered our plays and I felt confident on the court', 5),
    ('I boxed out and went after rebounds', 6),
    ('I helped our team to have the LOUDEST BENCH', 7)
) as seed(prompt, sort_order)
where not exists (
  select 1 from public.reflection_questions existing where existing.prompt = seed.prompt
);
