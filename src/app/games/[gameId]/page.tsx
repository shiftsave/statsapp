import Link from "next/link";
import { notFound } from "next/navigation";

import { completeGameAction } from "@/app/actions";
import { GameStatsBoard } from "@/components/games/game-stats-board";
import { SetupCallout } from "@/components/shared/setup-callout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGameWithStats } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

const outlineLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  if (!hasSupabaseEnv) {
    return <SetupCallout />;
  }

  const { gameId } = await params;
  const gameData = await getGameWithStats(gameId);

  if (!gameData) {
    notFound();
  }

  const { game, stats } = gameData;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <Link className={outlineLinkClass} href="/games">
              Back to games
            </Link>
            <Badge variant={game.status === "completed" ? "secondary" : "default"}>
              {game.status === "completed" ? "Completed" : "In progress"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link className={outlineLinkClass} href={`/games/${game.id}/report`}>
              Player reports
            </Link>
            {game.status !== "completed" ? (
              <form action={completeGameAction}>
                <input name="game_id" type="hidden" value={game.id} />
                <Button type="submit">Complete game</Button>
              </form>
            ) : null}
          </div>
        </div>
        <GameStatsBoard game={game} initialStats={stats} />
      </div>
    </div>
  );
}
