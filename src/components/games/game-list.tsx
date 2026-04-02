import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGameDate } from "@/lib/format";
import type { Game } from "@/types/app";

const primaryLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

const outlineLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

export function GameList({ games }: { games: Game[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent games</CardTitle>
        <CardDescription>Jump back into stat entry or open a finished report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {games.length === 0 ? (
          <p className="text-sm text-muted-foreground">No games yet. Create your first one above.</p>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              className="flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium text-slate-950">
                  {game.opponent ? `vs ${game.opponent}` : "Game session"}
                </p>
                <p className="text-sm text-slate-500">
                  {formatGameDate(game.game_date)}
                  {game.location ? ` • ${game.location}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={game.status === "completed" ? "secondary" : "default"}>
                  {game.status === "completed" ? "Completed" : "In progress"}
                </Badge>
                <Link className={outlineLinkClass} href={`/games/${game.id}`}>
                  Open game
                </Link>
                {game.status === "completed" ? (
                  <Link className={primaryLinkClass} href={`/games/${game.id}/report`}>
                    View report
                  </Link>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
