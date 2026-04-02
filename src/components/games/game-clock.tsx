"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Pause, Play } from "lucide-react";

import type { GameClock as GameClockType } from "@/types/app";

const PERIOD_LABELS = ["Q1", "Q2", "Q3", "Q4"];

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function GameClock({
  gameId,
  initialClock,
}: {
  gameId: string;
  initialClock: GameClockType | null;
}) {
  const [running, setRunning] = useState(initialClock?.status === "running");
  const [elapsed, setElapsed] = useState(initialClock?.elapsed_seconds ?? 0);
  const [period, setPeriod] = useState(initialClock?.current_period ?? 1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const persist = useCallback(
    async (update: { status?: "running" | "stopped"; elapsed_seconds?: number; current_period?: number }) => {
      await fetch(`/api/games/${gameId}/clock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
    },
    [gameId],
  );

  function toggle() {
    const next = !running;
    setRunning(next);
    void persist({ status: next ? "running" : "stopped", elapsed_seconds: elapsed });
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Period pills */}
      <div className="hidden items-center gap-1 sm:flex">
        {PERIOD_LABELS.map((label, i) => (
          <button
            key={label}
            className={`min-h-9 rounded-full px-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              period === i + 1
                ? "bg-[#2e86ff] text-white"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => {
              setPeriod(i + 1);
              void persist({ current_period: i + 1 });
            }}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mobile: just show current period */}
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">
        {PERIOD_LABELS[period - 1]}
      </span>

      {/* Clock display */}
      <span className="min-w-[4.5ch] font-mono text-2xl font-bold tabular-nums text-white sm:text-3xl">
        {formatTime(elapsed)}
      </span>

      {/* Play / Pause */}
      <button
        className={`inline-flex size-10 items-center justify-center rounded-full transition-colors sm:size-12 ${
          running ? "bg-amber-500/20 text-amber-400" : "bg-[#2e86ff]/20 text-[#2e86ff]"
        }`}
        onClick={toggle}
        type="button"
      >
        {running ? <Pause className="size-4 sm:size-5" /> : <Play className="size-4 sm:size-5" />}
      </button>

    </div>
  );
}
