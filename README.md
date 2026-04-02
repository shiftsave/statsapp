# Basketball Stats MVP

This project is a simple basketball stat-tracking MVP built with Next.js, Tailwind CSS, shadcn/ui, and Supabase.

## MVP Scope

- Add and archive players from the UI
- Create a game with all active players preloaded into the roster
- Track per-player game stats
- Generate a simple automatic 1-5 player assessment
- Let each player open their own post-game report

## Stack

- Next.js App Router
- Tailwind CSS v4
- shadcn/ui
- Supabase
- Vercel-ready deployment setup

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env.local
```

3. Add these values from your Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Run the SQL in `supabase/migrations/001_mvp_schema.sql` inside the Supabase SQL editor.

5. Start the app:

```bash
npm run dev
```

## Routes

- `/` overview dashboard
- `/players` player management
- `/games` create/select games
- `/games/[gameId]` stat entry
- `/games/[gameId]/report` post-game player reports

## Deployment

Deploy to Vercel and add the same Supabase environment variables in the project settings.
