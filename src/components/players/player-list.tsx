import { togglePlayerStatusAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Player } from "@/types/app";

export function PlayerList({ players }: { players: Player[] }) {
  const activePlayers = players.filter((player) => player.is_active);
  const archivedPlayers = players.filter((player) => !player.is_active);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Active players</CardTitle>
          <CardDescription>
            Active players are automatically included when a new game is created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activePlayers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active players yet.</p>
          ) : (
            activePlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-2xl border bg-slate-50/60 px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="font-medium text-slate-950">{player.name}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    {player.jersey_number ? <span>#{player.jersey_number}</span> : null}
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
                <form action={togglePlayerStatusAction}>
                  <input name="player_id" type="hidden" value={player.id} />
                  <input name="next_value" type="hidden" value="false" />
                  <Button type="submit" variant="secondary">
                    Archive
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Archived players</CardTitle>
          <CardDescription>
            History stays intact, but archived players are hidden from new games.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {archivedPlayers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No archived players.</p>
          ) : (
            archivedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-2xl border px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="font-medium">{player.name}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    {player.jersey_number ? <span>#{player.jersey_number}</span> : null}
                    <Badge variant="outline">Archived</Badge>
                  </div>
                </div>
                <form action={togglePlayerStatusAction}>
                  <input name="player_id" type="hidden" value={player.id} />
                  <input name="next_value" type="hidden" value="true" />
                  <Button type="submit" variant="outline">
                    Restore
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
