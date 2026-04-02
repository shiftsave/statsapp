import Link from "next/link";
import { notFound } from "next/navigation";

import { CompleteGameDialog } from "@/components/games/complete-game-dialog";
import { GameStatsBoard } from "@/components/games/game-stats-board";
import { SetupCallout } from "@/components/shared/setup-callout";
import { Badge } from "@/components/ui/badge";
import { getGameWithStats } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

const outlineLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-[1rem] border border-white/10 bg-[#102844] px-4 py-2 text-sm font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#153153]";

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
    <div className="h-screen overflow-hidden">
      <div className="mx-auto flex h-screen max-w-7xl flex-col px-4 py-3 sm:px-6 sm:py-4">
        <div className="northland-surface mb-3 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link className={outlineLinkClass} href="/games">
              Back to games
            </Link>
            <Badge
              className={
                game.status === "completed"
                  ? "bg-[#173a27] text-[#9de189] hover:bg-[#173a27]"
                  : "bg-[#12345e] text-[#9ac7ff] hover:bg-[#12345e]"
              }
              variant={game.status === "completed" ? "secondary" : "default"}
            >
              {game.status === "completed" ? "Completed" : "In progress"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link className={outlineLinkClass} href={`/games/${game.id}/report`}>
              Player reports
            </Link>
            {game.status !== "completed" ? (
              <CompleteGameDialog gameId={game.id} opponentName={game.opponent} />
            ) : null}
          </div>
        </div>
        <GameStatsBoard game={game} initialStats={stats} />
      </div>
    </div>
  );
}
