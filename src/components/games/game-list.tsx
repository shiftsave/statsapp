import Link from "next/link";

import { deleteGameAction } from "@/app/actions";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGameDate } from "@/lib/format";
import type { Game } from "@/types/app";

const primaryLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

const outlineLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

export function GameList({ games }: { games: Game[] }) {
  return (
    <Card className="northland-panel border-white/10">
      <CardHeader>
        <CardTitle className="text-3xl uppercase tracking-tight text-white">Recent games</CardTitle>
        <CardDescription className="text-[#bdd0e7]">
          Jump back into stat entry or open a finished report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {games.length === 0 ? (
          <p className="text-sm text-[#9fb6d4]">No games yet. Create your first one above.</p>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-[#0d2137] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="text-2xl font-medium uppercase tracking-tight text-white">
                  {game.opponent ? `vs ${game.opponent}` : "Game session"}
                </p>
                <p className="text-sm text-[#9fb6d4]">
                  {formatGameDate(game.game_date)}
                  {game.location ? ` • ${game.location}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={
                    game.status === "completed"
                      ? "bg-[#173a27] text-[#9de189] hover:bg-[#173a27]"
                      : "bg-[#12345e] text-[#9ac7ff] hover:bg-[#12345e]"
                  }
                  variant={game.status === "completed" ? "secondary" : "default"}
                >
                  {game.status === "completed" ? "Completed" : "In progress"}
                </Badge>
                <Link className={`${outlineLinkClass} min-h-12 rounded-[1rem] border-white/10 bg-[#102844] text-white hover:bg-[#153153]`} href={`/games/${game.id}`}>
                  Open game
                </Link>
                {game.status === "completed" ? (
                  <Link className={`${primaryLinkClass} min-h-12 rounded-[1rem] bg-[#2e86ff] text-white hover:bg-[#4b97ff]`} href={`/games/${game.id}/report`}>
                    View report
                  </Link>
                ) : null}
                <ConfirmDelete
                  action={deleteGameAction}
                  title="Delete game?"
                  description="This will permanently delete this game and all associated stats, substitutions, and reflections."
                  hiddenFields={{ game_id: game.id }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
