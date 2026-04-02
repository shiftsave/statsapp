"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calculateAssessment } from "@/lib/assessment";
import type { Game, PlayerGameStat } from "@/types/app";

type SaveState = "idle" | "saving" | "saved" | "error";

type StatKey =
  | "offensive_rebounds"
  | "defensive_rebounds"
  | "steals"
  | "turnovers"
  | "made_baskets"
  | "made_free_throws"
  | "missed_free_throws";

type StatStyle = {
  cardClassName: string;
  shortLabelClassName: string;
  helperClassName: string;
};

const statLabels: {
  key: StatKey;
  shortLabel: string;
  fullLabel: string;
  style: StatStyle;
}[] = [
  {
    key: "offensive_rebounds",
    shortLabel: "ORB",
    fullLabel: "Offensive rebounds",
    style: {
      cardClassName: "border-emerald-200 bg-emerald-50/90",
      shortLabelClassName: "text-emerald-700",
      helperClassName: "text-emerald-700/80",
    },
  },
  {
    key: "defensive_rebounds",
    shortLabel: "DRB",
    fullLabel: "Defensive rebounds",
    style: {
      cardClassName: "border-amber-200 bg-amber-50/95",
      shortLabelClassName: "text-amber-700",
      helperClassName: "text-amber-700/80",
    },
  },
  {
    key: "steals",
    shortLabel: "STL",
    fullLabel: "Steals",
    style: {
      cardClassName: "border-amber-200 bg-amber-50/95",
      shortLabelClassName: "text-amber-700",
      helperClassName: "text-amber-700/80",
    },
  },
  {
    key: "turnovers",
    shortLabel: "TO",
    fullLabel: "Turnovers",
    style: {
      cardClassName: "border-rose-200 bg-rose-50/95",
      shortLabelClassName: "text-rose-700",
      helperClassName: "text-rose-700/80",
    },
  },
  {
    key: "made_baskets",
    shortLabel: "FGM",
    fullLabel: "Made baskets",
    style: {
      cardClassName: "border-emerald-200 bg-emerald-50/90",
      shortLabelClassName: "text-emerald-700",
      helperClassName: "text-emerald-700/80",
    },
  },
];

const freeThrowStyle: StatStyle = {
  cardClassName: "border-emerald-200 bg-emerald-50/90",
  shortLabelClassName: "text-emerald-700",
  helperClassName: "text-emerald-700/80",
};

const legendItems = [
  {
    label: "Offense",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    label: "Defense",
    className: "border border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    label: "Turnovers",
    className: "border border-rose-200 bg-rose-50 text-rose-700",
  },
];

function getPlayerNameParts(name?: string | null) {
  const trimmedName = name?.trim() ?? "";

  if (!trimmedName) {
    return {
      firstName: "Player",
      lastName: "",
    };
  }

  const [firstName, ...rest] = trimmedName.split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

function getSafeStatValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function GameStatsBoard({
  game,
  initialStats,
}: {
  game: Game;
  initialStats: PlayerGameStat[];
}) {
  const [stats, setStats] = useState(initialStats);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1024, height: 900 });
  const [saveMessage, setSaveMessage] = useState("");

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

  const selectedStat = stats.find((statLine) => statLine.player_id === selectedPlayerId) ?? null;

  useEffect(() => {
    function updateViewportSize() {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  const rosterLayout = useMemo(() => {
    const playerCount = Math.max(stats.length, 1);
    const isPhone = viewportSize.width < 640;
    const isTablet = viewportSize.width >= 640 && viewportSize.width < 1024;
    const chromeHeight = isPhone ? 360 : isTablet ? 390 : 430;
    const minCardWidth = isPhone ? 148 : isTablet ? 172 : 205;
    const availableWidth = Math.max(viewportSize.width - (isPhone ? 24 : 72), minCardWidth);
    const columns = Math.max(1, Math.min(playerCount, Math.floor(availableWidth / minCardWidth)));
    const rows = Math.max(1, Math.ceil(playerCount / columns));
    const availableHeight = Math.max(viewportSize.height - chromeHeight, isPhone ? 280 : 360);
    const rowHeight = Math.max(78, Math.min(availableHeight / rows, 180));

    return {
      columns,
      rowHeight,
      compact: rowHeight < 115,
      ultraCompact: rowHeight < 92,
    };
  }, [stats.length, viewportSize]);

  function adjustStat(playerStatId: string, key: StatKey, delta: number) {
    setSaveState("idle");
    setSaveMessage("");
    setStats((currentStats) =>
      currentStats.map((statLine) =>
        statLine.id !== playerStatId
          ? statLine
          : {
              ...statLine,
              [key]: Math.max(0, getSafeStatValue(statLine[key]) + delta),
            },
      ),
    );
    setSelectedPlayerId(null);
  }

  async function saveStats() {
    setSaveState("saving");
    setSaveMessage("");

    const payload = stats.map((statLine) => ({
      id: statLine.id,
      game_id: statLine.game_id,
      player_id: statLine.player_id,
      offensive_rebounds: statLine.offensive_rebounds,
      defensive_rebounds: statLine.defensive_rebounds,
      steals: statLine.steals,
      turnovers: statLine.turnovers,
      made_baskets: statLine.made_baskets,
      made_free_throws: getSafeStatValue(statLine.made_free_throws),
      missed_free_throws: getSafeStatValue(statLine.missed_free_throws),
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
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to save stats.");
      }

      setSaveState("saved");
      setSaveMessage("Stats saved.");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error ? error.message : "Something went wrong while saving stats.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Player picker</p>
          <p className="text-sm text-slate-600">
            Tap a player name to open their stat editor, make the changes you need, then save.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {legendItems.map((item) => (
              <span
                key={item.label}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${item.className}`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={saveState === "error" ? "destructive" : "secondary"}>{statusLabel}</Badge>
          <Button disabled={saveState === "saving"} onClick={saveStats}>
            Save stats
          </Button>
        </div>
      </div>
      {saveMessage ? (
        <p
          className={`text-sm font-medium ${
            saveState === "error" ? "text-rose-700" : "text-emerald-700"
          }`}
        >
          {saveMessage}
        </p>
      ) : null}
      <div
        className="grid gap-3 sm:gap-4"
        style={{
          gridTemplateColumns: `repeat(${rosterLayout.columns}, minmax(0, 1fr))`,
          gridAutoRows: `${rosterLayout.rowHeight}px`,
        }}
      >
        {stats.map((statLine) => {
          const nameParts = getPlayerNameParts(statLine.player?.name);

          return (
            <button
              key={statLine.id}
              className={`h-full rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
                rosterLayout.ultraCompact ? "p-3" : rosterLayout.compact ? "p-4" : "p-5"
              }`}
              onClick={() => setSelectedPlayerId(statLine.player_id)}
              type="button"
            >
              <div className="flex h-full items-center">
                <div className="min-w-0">
                  <p
                    className={`font-semibold tracking-tight text-sky-700 ${
                      rosterLayout.ultraCompact
                        ? "text-lg leading-5"
                        : rosterLayout.compact
                          ? "text-xl leading-6"
                          : "text-3xl leading-8"
                    }`}
                  >
                    {statLine.player?.jersey_number ? `#${statLine.player.jersey_number}` : "#"}
                  </p>
                  <p
                    className={`mt-1 font-semibold tracking-tight text-slate-950 ${
                      rosterLayout.ultraCompact
                        ? "text-lg leading-5"
                        : rosterLayout.compact
                          ? "text-xl leading-6"
                          : "text-3xl leading-8"
                    }`}
                  >
                    {nameParts.firstName}
                  </p>
                  <p
                    className={`mt-2 text-slate-500 ${
                      rosterLayout.ultraCompact ? "text-xs" : "text-sm"
                    }`}
                  >
                    {nameParts.lastName || "Tap to update stats"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <Dialog open={Boolean(selectedStat)} onOpenChange={(open) => setSelectedPlayerId(open ? selectedPlayerId : null)}>
        {selectedStat ? (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedStat.player?.name ?? "Player"}
              </DialogTitle>
              <DialogDescription>
                Update this player&apos;s in-game stats, then tap save on the main screen when
                you&apos;re ready.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950">
                {calculateAssessment(selectedStat).summary}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {statLabels.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-2xl border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${item.style.cardClassName}`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${item.style.shortLabelClassName}`}
                    >
                      {item.shortLabel}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{item.fullLabel}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Button
                        onClick={() => adjustStat(selectedStat.id, item.key, -1)}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        -
                      </Button>
                      <span className="min-w-8 text-center text-2xl font-semibold text-slate-950">
                        {selectedStat[item.key]}
                      </span>
                      <Button
                        onClick={() => adjustStat(selectedStat.id, item.key, 1)}
                        size="icon"
                        type="button"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
                <div
                  className={`rounded-2xl border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${freeThrowStyle.cardClassName}`}
                >
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${freeThrowStyle.shortLabelClassName}`}
                  >
                    FT
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">Free throw</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => adjustStat(selectedStat.id, "made_free_throws", 1)}
                      type="button"
                    >
                      Made
                    </Button>
                    <Button
                      onClick={() => adjustStat(selectedStat.id, "missed_free_throws", 1)}
                      type="button"
                      variant="outline"
                    >
                      Miss
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Made {getSafeStatValue(selectedStat.made_free_throws)}</span>
                    <span>Miss {getSafeStatValue(selectedStat.missed_free_throws)}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
