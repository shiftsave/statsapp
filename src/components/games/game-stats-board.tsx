"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Game, PlayerGameStat } from "@/types/app";

type SaveState = "idle" | "saving" | "saved" | "error";
type UndoAction = {
  playerStatId: string;
  key: StatKey;
  delta: number;
};

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

function getToastMessage(statLine: PlayerGameStat, key: StatKey, delta: number) {
  const playerName = getPlayerNameParts(statLine.player?.name).firstName;

  if (key === "made_free_throws") {
    return `${playerName}: free throw made saved`;
  }

  if (key === "missed_free_throws") {
    return `${playerName}: free throw miss saved`;
  }

  const label = statLabels.find((item) => item.key === key)?.fullLabel.toLowerCase() ?? "stat";

  return delta > 0
    ? `${playerName}: ${label} saved`
    : `${playerName}: ${label} updated`;
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
  const [toastMessage, setToastMessage] = useState("");
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  const selectedStat = stats.find((statLine) => statLine.player_id === selectedPlayerId) ?? null;

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage("");
      setUndoAction(null);
    }, 2600);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

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
    const isTablet = viewportSize.width >= 640 && viewportSize.width < 1180;
    const chromeHeight = isPhone ? 170 : isTablet ? 200 : 220;
    const targetColumns = isPhone ? 2 : isTablet ? 2 : 3;
    const columns = Math.max(1, Math.min(playerCount, targetColumns));
    const rows = Math.max(1, Math.ceil(playerCount / columns));
    const availableHeight = Math.max(viewportSize.height - chromeHeight, isPhone ? 420 : 620);
    const rowHeight = Math.max(
      isPhone ? 132 : 170,
      Math.min(availableHeight / rows, isPhone ? 220 : 280),
    );

    return {
      columns,
      rowHeight,
      compact: rowHeight < 115,
      ultraCompact: rowHeight < 92,
    };
  }, [stats.length, viewportSize]);

  async function persistStats(nextStats: PlayerGameStat[], successMessage?: string) {
    setSaveState("saving");
    setSaveMessage("");

    const payload = nextStats.map((statLine) => ({
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
      if (successMessage) {
        setToastMessage(successMessage);
      }
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error ? error.message : "Something went wrong while saving stats.",
      );
    }
  }

  function adjustStat(playerStatId: string, key: StatKey, delta: number) {
    setSaveState("idle");
    setSaveMessage("");
    const currentPlayer = stats.find((statLine) => statLine.id === playerStatId);
    const nextStats = stats.map((statLine) =>
        statLine.id !== playerStatId
          ? statLine
          : {
              ...statLine,
              [key]: Math.max(0, getSafeStatValue(statLine[key]) + delta),
            },
      );
    setStats(nextStats);
    setSelectedPlayerId(null);
    if (currentPlayer) {
      setUndoAction({ playerStatId, key, delta });
      void persistStats(nextStats, getToastMessage(currentPlayer, key, delta));
    }
  }

  function undoLastAction() {
    if (!undoAction) {
      return;
    }

    const currentPlayer = stats.find((statLine) => statLine.id === undoAction.playerStatId);
    const nextStats = stats.map((statLine) =>
      statLine.id !== undoAction.playerStatId
        ? statLine
        : {
            ...statLine,
            [undoAction.key]: Math.max(
              0,
              getSafeStatValue(statLine[undoAction.key]) - undoAction.delta,
            ),
          },
    );

    setStats(nextStats);
    setToastMessage("");
    setUndoAction(null);

    if (currentPlayer) {
      void persistStats(
        nextStats,
        `${getPlayerNameParts(currentPlayer.player?.name).firstName}: action undone`,
      );
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      {saveMessage && saveState === "error" ? (
        <p
          className="text-sm font-medium text-rose-700"
        >
          {saveMessage}
        </p>
      ) : null}
      {toastMessage ? (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 px-4">
          <div className="flex items-center gap-3 rounded-full border border-[#79cf62]/40 bg-[#10233b] px-4 py-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(0,0,0,0.34)]">
            <span>{toastMessage}</span>
            {undoAction ? (
              <button
                className="min-h-10 rounded-full bg-[#173a27] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#9de189]"
                onClick={undoLastAction}
                type="button"
              >
                Undo
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div
        className="grid flex-1 gap-3 overflow-hidden sm:gap-4"
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
              className={`h-full rounded-[1.75rem] border border-white/10 bg-[#10233b]/92 text-left shadow-[0_20px_60px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#153153] ${
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
                    className={`mt-1 font-semibold tracking-tight text-white ${
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
          <DialogContent
            className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
            showCloseButton={false}
          >
            <DialogHeader className="flex-row items-start justify-between gap-4">
              <DialogTitle className="text-2xl sm:text-3xl">
                {selectedStat.player?.jersey_number
                  ? `#${selectedStat.player.jersey_number} ${selectedStat.player?.name ?? "Player"}`
                  : selectedStat.player?.name ?? "Player"}
              </DialogTitle>
              <DialogClose
                className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl leading-none text-white transition-colors hover:bg-white/10"
              >
                <span aria-hidden="true">&times;</span>
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogHeader>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {statLabels.map((item) => (
                  <div
                    key={item.key}
                    className={`flex min-h-[220px] flex-col rounded-[1.8rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${item.style.cardClassName}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${item.style.shortLabelClassName}`}
                        >
                          {item.shortLabel}
                        </p>
                        <p className="mt-3 text-3xl font-medium leading-[1.02] tracking-tight text-slate-900">
                          {item.fullLabel}
                        </p>
                      </div>
                      <span className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                        {selectedStat[item.key]}
                      </span>
                    </div>
                    <div className="mt-auto pt-6">
                      <Button
                        className="min-h-16 w-full rounded-[1.3rem] bg-[#4a80f0] text-3xl font-medium text-white hover:bg-[#4a80f0]"
                        onClick={() => adjustStat(selectedStat.id, item.key, 1)}
                        type="button"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
                <div
                  className={`flex min-h-[220px] flex-col rounded-[1.8rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${freeThrowStyle.cardClassName}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${freeThrowStyle.shortLabelClassName}`}
                      >
                        FT
                      </p>
                      <p className="mt-3 text-3xl font-medium leading-[1.02] tracking-tight text-slate-900">
                        Free throw
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                      M {getSafeStatValue(selectedStat.made_free_throws)} X{" "}
                      {getSafeStatValue(selectedStat.missed_free_throws)}
                    </div>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                    <Button
                      className="min-h-16 rounded-[1.3rem] bg-[#4a80f0] text-3xl font-medium text-white hover:bg-[#4a80f0]"
                      onClick={() => adjustStat(selectedStat.id, "made_free_throws", 1)}
                      type="button"
                    >
                      Made
                    </Button>
                    <Button
                      className="min-h-16 rounded-[1.3rem] bg-[#071422] text-3xl font-medium text-white hover:bg-[#071422]"
                      onClick={() => adjustStat(selectedStat.id, "missed_free_throws", 1)}
                      type="button"
                      variant="outline"
                    >
                      Miss
                    </Button>
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
