"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { calculateAssessment } from "@/lib/assessment";
import type { PlayerGameStat } from "@/types/app";

const statSummary = [
  { key: "offensive_rebounds", label: "Offensive rebounds" },
  { key: "defensive_rebounds", label: "Defensive rebounds" },
  { key: "steals", label: "Steals" },
  { key: "turnovers", label: "Turnovers" },
  { key: "made_baskets", label: "Made baskets" },
  { key: "made_free_throws", label: "Made free throws" },
] as const;

export function PlayerReportBrowser({ stats }: { stats: PlayerGameStat[] }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(stats[0]?.player_id ?? "");

  const selectedReport = stats.find((statLine) => statLine.player_id === selectedPlayerId) ?? stats[0];
  const assessment = selectedReport ? calculateAssessment(selectedReport) : null;

  if (!selectedReport || !assessment) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          No player stats are available for this game yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Choose a player</CardTitle>
          <CardDescription>Each player can open their own game report from this list.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map((statLine) => {
            const isSelected = statLine.player_id === selectedPlayerId;

            return (
              <button
                key={statLine.id}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
                onClick={() => setSelectedPlayerId(statLine.player_id)}
                type="button"
              >
                <p className="font-medium">{statLine.player?.name ?? "Player"}</p>
                <p className={`text-sm ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                  {statLine.player?.jersey_number
                    ? `#${statLine.player.jersey_number}`
                    : "No jersey number"}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-950 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">
                {selectedReport.player?.name ?? "Player report"}
              </CardTitle>
              <CardDescription className="mt-1 text-slate-300">
                Single-game assessment based on the tracked MVP stat line.
              </CardDescription>
            </div>
            <Badge className="bg-white text-slate-950 hover:bg-white">
              Assessment {assessment.score}/5
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="rounded-3xl bg-sky-50 p-5 text-sky-950">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Summary</p>
            <p className="mt-3 text-base leading-7">{assessment.summary}</p>
          </div>
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            {statSummary.map((item) => (
              <div key={item.key} className="rounded-2xl border bg-slate-50/70 px-4 py-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {selectedReport[item.key]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
