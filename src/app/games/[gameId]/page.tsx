import Link from "next/link";
import { notFound } from "next/navigation";

import { completeGameAction } from "@/app/actions";
import { GameStatsBoard } from "@/components/games/game-stats-board";
import { AppShell } from "@/components/layout/app-shell";
import { SetupCallout } from "@/components/shared/setup-callout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGameWithStats } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";
import { formatGameDate } from "@/lib/format";

const outlineLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  if (!hasSupabaseEnv) {
    return (
      <AppShell currentPath="/games">
        <SetupCallout />
      </AppShell>
    );
  }

  const { gameId } = await params;
  const gameData = await getGameWithStats(gameId);

  if (!gameData) {
    notFound();
  }

  const { game, stats } = gameData;

  return (
    <AppShell currentPath="/games">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-3xl">
                  {game.opponent ? `vs ${game.opponent}` : "Game session"}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {formatGameDate(game.game_date)}
                  {game.location ? ` • ${game.location}` : ""}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={game.status === "completed" ? "secondary" : "default"}>
                  {game.status === "completed" ? "Completed" : "In progress"}
                </Badge>
                <Link className={outlineLinkClass} href={`/games/${game.id}/report`}>
                  Open player reports
                </Link>
                {game.status !== "completed" ? (
                  <form action={completeGameAction}>
                    <input name="game_id" type="hidden" value={game.id} />
                    <Button type="submit">Complete game</Button>
                  </form>
                ) : null}
              </div>
            </div>
          </CardHeader>
          {game.notes ? (
            <CardContent className="pt-0 text-sm leading-6 text-slate-600">{game.notes}</CardContent>
          ) : null}
        </Card>
        <GameStatsBoard game={game} initialStats={stats} />
      </div>
    </AppShell>
  );
}
