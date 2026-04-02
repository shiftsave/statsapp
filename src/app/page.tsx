import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { SetupCallout } from "@/components/shared/setup-callout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";
import { formatGameDate } from "@/lib/format";

const primaryLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

const outlineLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

const featureCards = [
  {
    title: "Manage players",
    description: "Create player records in the UI and keep future game rosters in sync.",
    href: "/players",
  },
  {
    title: "Track game stats",
    description: "Open a game and update rebounds, steals, turnovers, baskets, and free throws.",
    href: "/games",
  },
  {
    title: "Open player reports",
    description: "After the final whistle, let each player click their name for a simple assessment.",
    href: "/games",
  },
];

export default async function Home() {
  const dashboardData = hasSupabaseEnv ? await getDashboardData() : null;

  return (
    <AppShell currentPath="/">
      <div className="space-y-5">
        {!hasSupabaseEnv ? <SetupCallout /> : null}
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <Badge className="w-fit bg-sky-300 text-slate-950 hover:bg-sky-300">
                Simple game-day workflow
              </Badge>
              <CardTitle className="mt-4 text-4xl leading-tight sm:text-5xl">
                A clean MVP for player-by-player basketball reports.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-slate-300">
                The app is designed for fast use on the sideline: create players, start a game,
                track the stat line, and finish with an automatic 1-5 assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link className={`${primaryLinkClass} h-11 px-5`} href="/players">
                Set up players
              </Link>
              <Link className={`${outlineLinkClass} h-11 px-5`} href="/games">
                Create a game
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>MVP defaults</CardTitle>
              <CardDescription>The app currently follows the agreed first-release choices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>One stat row per player per game.</p>
              <p>Combined field goals in a single made baskets field.</p>
              <p>Automatic 1-5 assessment, derived from the stat line.</p>
              <p>Game-specific reports only.</p>
              <p>Archive players instead of deleting history.</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {featureCards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link className={outlineLinkClass} href={card.href}>
                  Open
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        {dashboardData ? (
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Current roster</CardTitle>
                <CardDescription>
                  {dashboardData.players.filter((player) => player.is_active).length} active players
                  ready for the next game.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.players.slice(0, 6).map((player) => (
                  <div key={player.id} className="flex items-center justify-between rounded-2xl border px-4 py-3">
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-slate-500">
                        {player.jersey_number ? `#${player.jersey_number}` : "No jersey number"}
                      </p>
                    </div>
                    <Badge variant={player.is_active ? "secondary" : "outline"}>
                      {player.is_active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent games</CardTitle>
                <CardDescription>Continue stat entry or open a finished report.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentGames.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No games yet.</p>
                ) : (
                  dashboardData.recentGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{game.opponent ? `vs ${game.opponent}` : "Game session"}</p>
                        <p className="text-sm text-slate-500">
                          {formatGameDate(game.game_date)}
                          {game.location ? ` • ${game.location}` : ""}
                        </p>
                      </div>
                      <Link className={outlineLinkClass} href={`/games/${game.id}`}>
                        Open
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
