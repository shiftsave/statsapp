"use client";

import { useState } from "react";

import { createGameAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInputValue } from "@/lib/format";
import type { Player } from "@/types/app";

export function CreateGameForm({ players }: { players: Player[] }) {
  const [starterIds, setStarterIds] = useState<string[]>([]);

  function toggleStarter(playerId: string) {
    setStarterIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }
      if (prev.length >= 5) return prev;
      return [...prev, playerId];
    });
  }

  return (
    <Card className="northland-panel border-white/10">
      <CardHeader>
        <CardTitle className="text-3xl uppercase tracking-tight text-white">Create a game</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createGameAction} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="starter_ids" value={starterIds.join(",")} />
          <div className="grid gap-2">
            <Label className="text-[#d7b354]" htmlFor="game_date">Game date</Label>
            <Input
              className="min-h-14 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white"
              defaultValue={formatDateInputValue()}
              id="game_date"
              name="game_date"
              required
              type="date"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-[#d7b354]" htmlFor="opponent">Opponent</Label>
            <Input className="min-h-14 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white placeholder:text-[#6e89aa]" id="opponent" name="opponent" placeholder="Westbrook Wolves" />
          </div>
          <div className="grid gap-2">
            <Label className="text-[#d7b354]" htmlFor="location">Location</Label>
            <Input className="min-h-14 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white placeholder:text-[#6e89aa]" id="location" name="location" placeholder="Home court" />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <Label className="text-[#d7b354]" htmlFor="notes">Game notes</Label>
            <Textarea
              className="min-h-32 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white placeholder:text-[#6e89aa]"
              id="notes"
              name="notes"
              placeholder="Anything useful to remember before tip-off."
            />
          </div>

          {/* Starting 5 picker */}
          <div className="grid gap-3 lg:col-span-2">
            <Label className="text-[#d7b354]">
              Starting 5 <span className="text-slate-400">({starterIds.length}/5)</span>
            </Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {players.map((player) => {
                const selected = starterIds.includes(player.id);
                const disabled = !selected && starterIds.length >= 5;
                return (
                  <button
                    key={player.id}
                    className={`rounded-[1rem] border px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? "border-[#2e86ff] bg-[#2e86ff]/20 text-white"
                        : disabled
                          ? "border-white/5 bg-white/2 text-slate-600"
                          : "border-white/10 bg-[#0c1f34] text-white hover:border-white/20"
                    }`}
                    onClick={() => toggleStarter(player.id)}
                    type="button"
                  >
                    <span className="text-sm text-sky-600">
                      {player.jersey_number != null ? `#${player.jersey_number}` : "#"}
                    </span>
                    <p className="text-lg font-semibold leading-5">{player.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Button className="min-h-14 rounded-[1.25rem] bg-[#2e86ff] px-6 uppercase tracking-[0.16em]" type="submit">
              Create game
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
