import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PlayerReportBrowser } from "@/components/reports/player-report-browser";
import { SetupCallout } from "@/components/shared/setup-callout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGameWithStats } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";
import { formatGameDate } from "@/lib/format";

export default async function GameReportPage({
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
            <CardTitle className="text-3xl">
              Post-game reports {game.opponent ? `vs ${game.opponent}` : ""}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              {formatGameDate(game.game_date)}
              {game.location ? ` • ${game.location}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-6 text-slate-600">
            Players can select their name to view their own stat line, 1-5 assessment, and quick
            summary for this game.
          </CardContent>
        </Card>
        <PlayerReportBrowser stats={stats} />
      </div>
    </AppShell>
  );
}
