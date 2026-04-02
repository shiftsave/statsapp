import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CompleteGameDialog } from "@/components/games/complete-game-dialog";
import { GameClock } from "@/components/games/game-clock";
import { GameStatsBoard } from "@/components/games/game-stats-board";
import { SetupCallout } from "@/components/shared/setup-callout";
import { getGameWithStats } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

const outlineButtonClass =
  "inline-flex size-12 sm:size-auto sm:min-h-12 items-center justify-center rounded-[1rem] border border-white/10 bg-[#102844] sm:px-4 sm:py-2 text-lg font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#153153]";

const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-[1rem] bg-[#2e86ff] px-4 py-2 text-lg font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#2e86ff]/85";

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

  const { game, stats, clock } = gameData;

  return (
    <div className="h-screen overflow-hidden">
      <div className="mx-auto flex h-screen max-w-7xl flex-col px-4 py-3 sm:px-6 sm:py-4">
        <div className="northland-surface mb-3 flex items-center justify-between gap-3 px-4 py-3">
          <Link className={outlineButtonClass} href="/games">
            <ArrowLeft className="size-6 sm:hidden" strokeWidth={2.5} />
            <span className="hidden sm:inline">Back to games</span>
          </Link>
          {game.status !== "completed" ? (
            <>
              <GameClock gameId={game.id} initialClock={clock} />
              <CompleteGameDialog
                gameId={game.id}
                opponentName={game.opponent}
                triggerClassName={primaryButtonClass}
              />
            </>
          ) : (
            <Link className={outlineButtonClass} href={`/games/${game.id}/report`}>
              Player reports
            </Link>
          )}
        </div>
        <GameStatsBoard game={game} initialStats={stats} initialClock={clock} />
      </div>
    </div>
  );
}
