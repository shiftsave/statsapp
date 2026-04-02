import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PlayerReportBrowser } from "@/components/reports/player-report-browser";
import { SetupCallout } from "@/components/shared/setup-callout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGameReportData } from "@/lib/data";
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
  const gameData = await getGameReportData(gameId);

  if (!gameData) {
    notFound();
  }

  const { game, stats, questions, answers, notes, historyByPlayer } = gameData;

  return (
    <AppShell currentPath="/games">
      <div className="space-y-5">
        <Card className="northland-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-4xl font-bold uppercase tracking-tight text-white">
              Post-game reports {game.opponent ? `vs ${game.opponent}` : ""}
            </CardTitle>
            <CardDescription className="mt-2 text-base text-[#bdd0e7]">
              {formatGameDate(game.game_date)}
              {game.location ? ` • ${game.location}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0 text-sm leading-6 text-[#bdd0e7]">
            {game.team_score !== null && game.opponent_score !== null ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[#2e86ff]/35 bg-[#0d2137] p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#7fb2ff]">
                    Northland Phoenix U16
                  </p>
                  <p className="mt-3 text-5xl font-bold uppercase leading-none text-white">
                    {game.team_score}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-[#0d2137] p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#bdd0e7]">
                    {game.opponent || "Opponent"}
                  </p>
                  <p className="mt-3 text-5xl font-bold uppercase leading-none text-white">
                    {game.opponent_score}
                  </p>
                </div>
              </div>
            ) : null}
            <p>
              Players can select their name to review their game stats, complete their reflection,
              and revisit past reflections.
            </p>
          </CardContent>
        </Card>
        <PlayerReportBrowser
          answers={answers}
          gameId={gameId}
          historyByPlayer={historyByPlayer}
          notes={notes}
          questions={questions}
          stats={stats}
        />
      </div>
    </AppShell>
  );
}
