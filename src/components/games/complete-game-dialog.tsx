"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompleteGameDialog({
  gameId,
  opponentName,
}: {
  gameId: string;
  opponentName: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [teamScore, setTeamScore] = useState("");
  const [opponentScore, setOpponentScore] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/games/${gameId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamScore: Number(teamScore),
          opponentScore: Number(opponentScore),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to complete game.");
      }

      setOpen(false);
      router.push(`/games/${gameId}/report`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to complete game right now.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        className="min-h-12 rounded-[1rem] bg-[#2e86ff] px-5 uppercase tracking-[0.14em]"
        onClick={() => setOpen(true)}
        type="button"
      >
        Complete game
      </Button>
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogHeader className="flex-row items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-3xl uppercase tracking-tight text-white">
              Final score
            </DialogTitle>
            <DialogDescription className="mt-2 text-base text-[#bdd0e7]">
              Enter the final score for both teams before moving into the post-game report.
            </DialogDescription>
          </div>
          <DialogClose className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl leading-none text-white transition-colors hover:bg-white/10">
            <span aria-hidden="true">&times;</span>
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-[1.6rem] border border-[#2e86ff]/35 bg-[#10233b] p-5">
              <Label className="text-sm uppercase tracking-[0.18em] text-[#7fb2ff]" htmlFor="team_score">
                Northland Phoenix U16
              </Label>
              <Input
                className="h-20 rounded-[1.2rem] border-white/10 bg-[#0b1a2b] px-5 text-center text-4xl font-bold text-white"
                id="team_score"
                inputMode="numeric"
                min="0"
                onChange={(event) => setTeamScore(event.target.value)}
                placeholder="0"
                required
                type="number"
                value={teamScore}
              />
            </div>
            <div className="space-y-3 rounded-[1.6rem] border border-white/10 bg-[#10233b] p-5">
              <Label className="text-sm uppercase tracking-[0.18em] text-[#bdd0e7]" htmlFor="opponent_score">
                {opponentName || "Opponent"}
              </Label>
              <Input
                className="h-20 rounded-[1.2rem] border-white/10 bg-[#0b1a2b] px-5 text-center text-4xl font-bold text-white"
                id="opponent_score"
                inputMode="numeric"
                min="0"
                onChange={(event) => setOpponentScore(event.target.value)}
                placeholder="0"
                required
                type="number"
                value={opponentScore}
              />
            </div>
          </div>
          {errorMessage ? <p className="text-sm font-medium text-rose-400">{errorMessage}</p> : null}
          <Button
            className="min-h-14 rounded-[1rem] bg-[#2e86ff] px-5 text-base uppercase tracking-[0.14em]"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving score..." : "Submit final score"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
