"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAssessment } from "@/lib/assessment";
import type { Game, PlayerGameStat } from "@/types/app";

type SaveState = "idle" | "saving" | "saved" | "error";

type StatKey =
  | "offensive_rebounds"
  | "defensive_rebounds"
  | "steals"
  | "turnovers"
  | "made_baskets"
  | "made_free_throws";

const statLabels: { key: StatKey; shortLabel: string; fullLabel: string }[] = [
  { key: "offensive_rebounds", shortLabel: "ORB", fullLabel: "Offensive rebounds" },
  { key: "defensive_rebounds", shortLabel: "DRB", fullLabel: "Defensive rebounds" },
  { key: "steals", shortLabel: "STL", fullLabel: "Steals" },
  { key: "turnovers", shortLabel: "TO", fullLabel: "Turnovers" },
  { key: "made_baskets", shortLabel: "FGM", fullLabel: "Made baskets" },
  { key: "made_free_throws", shortLabel: "FTM", fullLabel: "Made free throws" },
];

export function GameStatsBoard({
  game,
  initialStats,
}: {
  game: Game;
  initialStats: PlayerGameStat[];
}) {
  const [stats, setStats] = useState(initialStats);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const statusLabel = useMemo(() => {
    if (saveState === "saving") {
      return "Saving changes...";
    }
    if (saveState === "saved") {
      return "Saved to Supabase";
    }
    if (saveState === "error") {
      return "Save failed";
    }
    return game.status === "completed" ? "Game completed" : "Ready to update";
  }, [game.status, saveState]);

  function adjustStat(playerStatId: string, key: StatKey, delta: number) {
    setSaveState("idle");
    setStats((currentStats) =>
      currentStats.map((statLine) =>
        statLine.id !== playerStatId
          ? statLine
          : {
              ...statLine,
              [key]: Math.max(0, statLine[key] + delta),
            },
      ),
    );
  }

  async function saveStats() {
    setSaveState("saving");

    const payload = stats.map((statLine) => ({
      id: statLine.id,
      game_id: statLine.game_id,
      player_id: statLine.player_id,
      offensive_rebounds: statLine.offensive_rebounds,
      defensive_rebounds: statLine.defensive_rebounds,
      steals: statLine.steals,
      turnovers: statLine.turnovers,
      made_baskets: statLine.made_baskets,
      made_free_throws: statLine.made_free_throws,
    }));

    try {
      const response = await fetch(`/api/games/${game.id}/stats`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stats: payload }),
      });

      if (!response.ok) {
        throw new Error("Unable to save stats.");
      }

      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Stat entry</p>
          <p className="text-sm text-slate-600">
            Tap minus and plus during the game, then save before opening reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={saveState === "error" ? "destructive" : "secondary"}>{statusLabel}</Badge>
          <Button disabled={saveState === "saving"} onClick={saveStats}>
            Save stats
          </Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {stats.map((statLine) => {
          const assessment = calculateAssessment(statLine);

          return (
            <Card key={statLine.id} className="overflow-hidden border-slate-200">
              <CardHeader className="border-b bg-slate-50/80">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{statLine.player?.name ?? "Player"}</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {statLine.player?.jersey_number
                        ? `#${statLine.player.jersey_number}`
                        : "No jersey number"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">Score</p>
                    <p className="text-2xl font-semibold">{assessment.score}/5</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {statLabels.map((item) => (
                    <div key={item.key} className="rounded-2xl border bg-slate-50/80 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                        {item.shortLabel}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Button
                          onClick={() => adjustStat(statLine.id, item.key, -1)}
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          -
                        </Button>
                        <span className="min-w-8 text-center text-2xl font-semibold">
                          {statLine[item.key]}
                        </span>
                        <Button
                          onClick={() => adjustStat(statLine.id, item.key, 1)}
                          size="icon"
                          type="button"
                        >
                          +
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{item.fullLabel}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950">
                  {assessment.summary}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
