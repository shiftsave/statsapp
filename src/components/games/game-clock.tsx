"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Pause, Play } from "lucide-react";

import type { GameClock as GameClockType } from "@/types/app";

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  const persist = useCallback(
    async (update: { status?: "running" | "stopped"; elapsed_seconds?: number }) => {
      await fetch(`/api/games/${gameId}/clock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
    },
    [gameId],
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);

      // Persist every 10 seconds while running
      const syncInterval = setInterval(() => {
        void persist({ elapsed_seconds: elapsedRef.current });
      }, 10_000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearInterval(syncInterval);
        // Persist on unmount (leaving page) while running
        void persist({ elapsed_seconds: elapsedRef.current });
      };
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, persist]);

  function toggle() {
    const next = !running;
    setRunning(next);
    void persist({ status: next ? "running" : "stopped", elapsed_seconds: elapsed });
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="min-w-[4.5ch] font-mono text-2xl font-bold tabular-nums text-white sm:text-3xl">
        {formatTime(elapsed)}
      </span>
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
