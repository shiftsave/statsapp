"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Game, GameClock, PlayerGameStat } from "@/types/app";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SaveState = "idle" | "saving" | "saved" | "error";
type UndoAction = { playerStatId: string; key: StatKey; delta: number };

type StatKey =
  | "offensive_rebounds"
  | "defensive_rebounds"
  | "steals"
  | "turnovers"
  | "made_baskets"
  | "made_free_throws"
  | "missed_free_throws";

type StatStyle = { cardClassName: string; shortLabelClassName: string };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statLabels: { key: StatKey; shortLabel: string; fullLabel: string; style: StatStyle }[] = [
  {
    key: "offensive_rebounds",
    shortLabel: "ORB",
    fullLabel: "Offensive rebounds",
    style: { cardClassName: "border-emerald-200 bg-emerald-50/90", shortLabelClassName: "text-emerald-700" },
  },
  {
    key: "defensive_rebounds",
    shortLabel: "DRB",
    fullLabel: "Defensive rebounds",
    style: { cardClassName: "border-amber-200 bg-amber-50/95", shortLabelClassName: "text-amber-700" },
  },
  {
    key: "steals",
    shortLabel: "STL",
    fullLabel: "Steals",
    style: { cardClassName: "border-amber-200 bg-amber-50/95", shortLabelClassName: "text-amber-700" },
  },
  {
    key: "turnovers",
    shortLabel: "TO",
    fullLabel: "Turnovers",
    style: { cardClassName: "border-rose-200 bg-rose-50/95", shortLabelClassName: "text-rose-700" },
  },
  {
    key: "made_baskets",
    shortLabel: "FGM",
    fullLabel: "Made baskets",
    style: { cardClassName: "border-emerald-200 bg-emerald-50/90", shortLabelClassName: "text-emerald-700" },
  },
];

const freeThrowStyle: StatStyle = {
  cardClassName: "border-emerald-200 bg-emerald-50/90",
  shortLabelClassName: "text-emerald-700",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPlayerNameParts(name?: string | null) {
  const trimmed = name?.trim() ?? "";
  if (!trimmed) return { firstName: "Player", lastName: "" };
  const [firstName, ...rest] = trimmed.split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

function getSafeStatValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getToastMessage(statLine: PlayerGameStat, key: StatKey, delta: number) {
  const playerName = getPlayerNameParts(statLine.player?.name).firstName;
  if (key === "made_free_throws") return `${playerName}: free throw made saved`;
  if (key === "missed_free_throws") return `${playerName}: free throw miss saved`;
  const label = statLabels.find((item) => item.key === key)?.fullLabel.toLowerCase() ?? "stat";
  return delta > 0 ? `${playerName}: ${label} saved` : `${playerName}: ${label} updated`;
}

// ---------------------------------------------------------------------------
// Draggable bench player card
// ---------------------------------------------------------------------------

function BenchCard({
  statLine,
  onTap,
}: {
  statLine: PlayerGameStat;
  onTap: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `bench-${statLine.player_id}`,
    data: { playerId: statLine.player_id },
  });

  const nameParts = getPlayerNameParts(statLine.player?.name);

  return (
    <button
      ref={setNodeRef}
      className={`min-h-0 rounded-[1.75rem] border border-white/10 bg-[#10233b]/92 px-4 py-3 text-left shadow-[0_20px_60px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#153153] ${
        isDragging ? "opacity-40" : ""
      }`}
      onClick={onTap}
      type="button"
      {...listeners}
      {...attributes}
    >
      <div className="flex h-full items-center">
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-5 text-white">
            <span className="text-sky-700">
              {statLine.player?.jersey_number ? `#${statLine.player.jersey_number}` : "#"}
            </span>{" "}
            {nameParts.firstName} {nameParts.lastName}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatTime(statLine.total_time_played_seconds)} played
          </p>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Droppable court player card
// ---------------------------------------------------------------------------

function CourtCard({
  statLine,
  onTap,
}: {
  statLine: PlayerGameStat;
  onTap: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `court-${statLine.player_id}`,
    data: { playerId: statLine.player_id },
  });

  const nameParts = getPlayerNameParts(statLine.player?.name);

  return (
    <button
      ref={setNodeRef}
      className={`min-h-0 rounded-[1.75rem] border p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#153153] ${
        isOver
          ? "border-[#2e86ff] bg-[#2e86ff]/20 ring-2 ring-[#2e86ff]/50"
          : "border-white/10 bg-[#10233b]/92"
      }`}
      onClick={onTap}
      type="button"
    >
      <div className="flex h-full items-center">
        <div className="min-w-0">
          <p className="text-xl font-semibold leading-6 tracking-tight text-sky-700">
            {statLine.player?.jersey_number ? `#${statLine.player.jersey_number}` : "#"}
          </p>
          <p className="mt-1 text-3xl font-semibold leading-8 tracking-tight text-white">
            {nameParts.firstName}
          </p>
          <p className="mt-1 text-xl text-slate-500">
            {nameParts.lastName || "Tap to update stats"}
          </p>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Droppable empty court slot
// ---------------------------------------------------------------------------

function EmptyCourtSlot({ index }: { index: number }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `empty-${index}`,
    data: { empty: true },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center justify-center rounded-[1.75rem] border border-dashed text-lg transition-colors ${
        isOver
          ? "border-[#2e86ff] bg-[#2e86ff]/20 text-[#2e86ff]"
          : "border-white/10 text-slate-600"
      }`}
    >
      Drop player here
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drag overlay (follows finger/pointer)
// ---------------------------------------------------------------------------

function DragOverlayCard({ statLine }: { statLine: PlayerGameStat }) {
  const nameParts = getPlayerNameParts(statLine.player?.name);

  return (
    <div className="rounded-[1.75rem] border border-[#2e86ff] bg-[#10233b] px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      <p className="text-lg font-semibold leading-5 text-white">
        <span className="text-sky-700">
          {statLine.player?.jersey_number ? `#${statLine.player.jersey_number}` : "#"}
        </span>{" "}
        {nameParts.firstName} {nameParts.lastName}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function GameStatsBoard({
  game,
  initialStats,
  initialClock,
}: {
  game: Game;
  initialStats: PlayerGameStat[];
  initialClock: GameClock | null;
}) {
  const [stats, setStats] = useState(initialStats);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  const currentPeriod = initialClock?.current_period ?? 1;
  const elapsedSeconds = initialClock?.elapsed_seconds ?? 0;

  // Drag state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const selectedStat = stats.find((s) => s.player_id === selectedPlayerId) ?? null;
  const onCourt = useMemo(() => stats.filter((s) => s.is_on_court), [stats]);
  const bench = useMemo(() => stats.filter((s) => !s.is_on_court), [stats]);

  // dnd-kit sensors: pointer (mouse) + touch with a small activation distance
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const activeDragStat = useMemo(() => {
    if (!activeDragId) return null;
    const playerId = activeDragId.replace("bench-", "");
    return stats.find((s) => s.player_id === playerId) ?? null;
  }, [activeDragId, stats]);

  // ---------- Toast auto-dismiss ----------

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => {
      setToastMessage("");
      setUndoAction(null);
    }, 2600);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  // ---------- Stats persistence ----------

  async function persistStats(nextStats: PlayerGameStat[], successMessage?: string) {
    setSaveState("saving");
    setSaveMessage("");

    const payload = nextStats.map((s) => ({
      id: s.id,
      game_id: s.game_id,
      player_id: s.player_id,
      offensive_rebounds: s.offensive_rebounds,
      defensive_rebounds: s.defensive_rebounds,
      steals: s.steals,
      turnovers: s.turnovers,
      made_baskets: s.made_baskets,
      made_free_throws: getSafeStatValue(s.made_free_throws),
      missed_free_throws: getSafeStatValue(s.missed_free_throws),
    }));

    try {
      const res = await fetch(`/api/games/${game.id}/stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats: payload }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to save stats.");
      }

      setSaveState("saved");
      setSaveMessage("Stats saved.");
      if (successMessage) setToastMessage(successMessage);
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : "Something went wrong while saving stats.");
    }
  }

  function adjustStat(playerStatId: string, key: StatKey, delta: number) {
    setSaveState("idle");
    setSaveMessage("");
    const currentPlayer = stats.find((s) => s.id === playerStatId);
    const nextStats = stats.map((s) =>
      s.id !== playerStatId ? s : { ...s, [key]: Math.max(0, getSafeStatValue(s[key]) + delta) },
    );
    setStats(nextStats);
    setSelectedPlayerId(null);
    if (currentPlayer) {
      setUndoAction({ playerStatId, key, delta });
      void persistStats(nextStats, getToastMessage(currentPlayer, key, delta));
    }
  }

  function undoLastAction() {
    if (!undoAction) return;
    const currentPlayer = stats.find((s) => s.id === undoAction.playerStatId);
    const nextStats = stats.map((s) =>
      s.id !== undoAction.playerStatId
        ? s
        : { ...s, [undoAction.key]: Math.max(0, getSafeStatValue(s[undoAction.key]) - undoAction.delta) },
    );
    setStats(nextStats);
    setToastMessage("");
    setUndoAction(null);
    if (currentPlayer) {
      void persistStats(nextStats, `${getPlayerNameParts(currentPlayer.player?.name).firstName}: action undone`);
    }
  }

  // ---------- Substitution ----------

  async function performSub(benchPlayerId: string, courtPlayerId: string) {
    setStats((prev) =>
      prev.map((s) => {
        if (s.player_id === benchPlayerId) return { ...s, is_on_court: true };
        if (s.player_id === courtPlayerId) return { ...s, is_on_court: false };
        return s;
      }),
    );

    const benchPlayer = stats.find((s) => s.player_id === benchPlayerId);
    const courtPlayer = stats.find((s) => s.player_id === courtPlayerId);

    setToastMessage(
      `${getPlayerNameParts(benchPlayer?.player?.name).firstName} in for ${getPlayerNameParts(courtPlayer?.player?.name).firstName}`,
    );

    try {
      const res = await fetch(`/api/games/${game.id}/substitutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerInId: benchPlayerId,
          playerOutId: courtPlayerId,
          period: currentPeriod,
          elapsedSeconds,
        }),
      });

      if (!res.ok) {
        setStats((prev) =>
          prev.map((s) => {
            if (s.player_id === benchPlayerId) return { ...s, is_on_court: false };
            if (s.player_id === courtPlayerId) return { ...s, is_on_court: true };
            return s;
          }),
        );
        setToastMessage("Substitution failed");
      }
    } catch {
      setStats((prev) =>
        prev.map((s) => {
          if (s.player_id === benchPlayerId) return { ...s, is_on_court: false };
          if (s.player_id === courtPlayerId) return { ...s, is_on_court: true };
          return s;
        }),
      );
      setToastMessage("Substitution failed");
    }
  }

  async function putOnCourt(benchPlayerId: string) {
    setStats((prev) =>
      prev.map((s) => (s.player_id === benchPlayerId ? { ...s, is_on_court: true } : s)),
    );

    const player = stats.find((s) => s.player_id === benchPlayerId);
    setToastMessage(`${getPlayerNameParts(player?.player?.name).firstName} added to court`);

    const nextStats = stats.map((s) =>
      s.player_id === benchPlayerId ? { ...s, is_on_court: true } : s,
    );
    void persistStats(nextStats);
  }

  // ---------- dnd-kit handlers ----------

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);

    const { active, over } = event;
    if (!over) return;

    const benchPlayerId = (active.data.current as { playerId: string }).playerId;
    const overData = over.data.current as { playerId?: string; empty?: boolean } | undefined;

    if (overData?.empty && onCourt.length < 5) {
      void putOnCourt(benchPlayerId);
    } else if (overData?.playerId) {
      void performSub(benchPlayerId, overData.playerId);
    }
  }

  // ---------- Render ----------

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        {/* Error banner */}
        {saveMessage && saveState === "error" ? (
          <p className="text-sm font-medium text-rose-700">{saveMessage}</p>
        ) : null}

        {/* Toast */}
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

        {/* Active 5 — fills available height */}
        <div
          className="grid min-h-0 flex-1 grid-cols-5 gap-3"
          style={{ gridTemplateRows: "1fr" }}
        >
          {onCourt.map((statLine) => (
            <CourtCard
              key={statLine.id}
              statLine={statLine}
              onTap={() => setSelectedPlayerId(statLine.player_id)}
            />
          ))}
          {Array.from({ length: Math.max(0, 5 - onCourt.length) }).map((_, i) => (
            <EmptyCourtSlot key={`empty-${i}`} index={i} />
          ))}
        </div>

        {/* Bench */}
        {bench.length > 0 ? (
          <div className="shrink-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bench</p>
            <div className="grid max-h-48 grid-cols-2 content-start gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
              {bench.map((statLine) => (
                <BenchCard
                  key={statLine.id}
                  statLine={statLine}
                  onTap={() => setSelectedPlayerId(statLine.player_id)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Drag overlay — follows the pointer/finger */}
        <DragOverlay>
          {activeDragStat ? <DragOverlayCard statLine={activeDragStat} /> : null}
        </DragOverlay>

        {/* Stat entry dialog */}
        <Dialog
          open={Boolean(selectedStat)}
          onOpenChange={(open) => setSelectedPlayerId(open ? selectedPlayerId : null)}
        >
          {selectedStat ? (
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl md:max-w-4xl" showCloseButton={false}>
              <DialogHeader className="flex-row items-start justify-between gap-4">
                <DialogTitle className="text-2xl sm:text-3xl">
                  {selectedStat.player?.jersey_number
                    ? `#${selectedStat.player.jersey_number} ${selectedStat.player?.name ?? "Player"}`
                    : selectedStat.player?.name ?? "Player"}
                </DialogTitle>
                <DialogClose className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl leading-none text-white transition-colors hover:bg-white/10">
                  <span aria-hidden="true">&times;</span>
                  <span className="sr-only">Close</span>
                </DialogClose>
              </DialogHeader>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {statLabels.map((item) => (
                    <div
                      key={item.key}
                      className={`flex min-h-[220px] flex-col rounded-[1.8rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] md:min-h-[180px] md:p-3 ${item.style.cardClassName}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${item.style.shortLabelClassName}`}>
                            {item.shortLabel}
                          </p>
                          <p className="mt-3 text-3xl font-medium leading-[1.02] tracking-tight text-slate-900 md:text-2xl">
                            {item.fullLabel}
                          </p>
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                          {selectedStat[item.key]}
                        </span>
                      </div>
                      <div className="mt-auto pt-6 md:pt-4">
                        <Button
                          className="min-h-16 w-full rounded-[1.3rem] bg-[#4a80f0] text-3xl font-medium text-white hover:bg-[#4a80f0] md:min-h-14 md:text-2xl"
                          onClick={() => adjustStat(selectedStat.id, item.key, 1)}
                          type="button"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div
                    className={`flex min-h-[220px] flex-col rounded-[1.8rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] md:min-h-[180px] md:p-3 ${freeThrowStyle.cardClassName}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${freeThrowStyle.shortLabelClassName}`}>
                          FT
                        </p>
                        <p className="mt-3 text-3xl font-medium leading-[1.02] tracking-tight text-slate-900 md:text-2xl">
                          Free throw
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                        M {getSafeStatValue(selectedStat.made_free_throws)} X{" "}
                        {getSafeStatValue(selectedStat.missed_free_throws)}
                      </div>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-6 md:pt-4">
                      <Button
                        className="min-h-16 rounded-[1.3rem] bg-[#4a80f0] text-3xl font-medium text-white hover:bg-[#4a80f0] md:min-h-14 md:text-2xl"
                        onClick={() => adjustStat(selectedStat.id, "made_free_throws", 1)}
                        type="button"
                      >
                        Made
                      </Button>
                      <Button
                        className="min-h-16 rounded-[1.3rem] bg-[#071422] text-3xl font-medium text-white hover:bg-[#071422] md:min-h-14 md:text-2xl"
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
    </DndContext>
  );
}
