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
      <Card className="northland-panel border-white/10">
        <CardHeader>
          <CardTitle className="text-3xl uppercase tracking-tight text-white">Active players</CardTitle>
          <CardDescription className="text-[#bdd0e7]">
            Active players are automatically included when a new game is created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activePlayers.length === 0 ? (
            <p className="text-sm text-[#9fb6d4]">No active players yet.</p>
          ) : (
            activePlayers.map((player) => (
              <div
                key={player.id}
                className="flex min-h-20 items-center justify-between rounded-[1.35rem] border border-white/10 bg-[#0d2137] px-4 py-4"
              >
                <div className="space-y-1">
                  <p className="text-2xl font-medium uppercase tracking-tight text-white">{player.name}</p>
                  <div className="flex items-center gap-2 text-sm text-[#9fb6d4]">
                    {player.jersey_number ? <span>#{player.jersey_number}</span> : null}
                    <Badge className="bg-[#173a27] text-[#9de189] hover:bg-[#173a27]">Active</Badge>
                  </div>
                </div>
                <form action={togglePlayerStatusAction}>
                  <input name="player_id" type="hidden" value={player.id} />
                  <input name="next_value" type="hidden" value="false" />
                  <Button className="min-h-12 rounded-[1rem] uppercase tracking-[0.14em]" type="submit" variant="secondary">
                    Archive
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card className="northland-panel border-white/10">
        <CardHeader>
          <CardTitle className="text-3xl uppercase tracking-tight text-white">Archived players</CardTitle>
          <CardDescription className="text-[#bdd0e7]">
            History stays intact, but archived players are hidden from new games.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {archivedPlayers.length === 0 ? (
            <p className="text-sm text-[#9fb6d4]">No archived players.</p>
          ) : (
            archivedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex min-h-20 items-center justify-between rounded-[1.35rem] border border-white/10 bg-[#0d2137] px-4 py-4"
              >
                <div className="space-y-1">
                  <p className="text-2xl font-medium uppercase tracking-tight text-white">{player.name}</p>
                  <div className="flex items-center gap-2 text-sm text-[#9fb6d4]">
                    {player.jersey_number ? <span>#{player.jersey_number}</span> : null}
                    <Badge className="bg-[#243244] text-[#bdd0e7] hover:bg-[#243244]" variant="outline">Archived</Badge>
                  </div>
                </div>
                <form action={togglePlayerStatusAction}>
                  <input name="player_id" type="hidden" value={player.id} />
                  <input name="next_value" type="hidden" value="true" />
                  <Button className="min-h-12 rounded-[1rem] uppercase tracking-[0.14em]" type="submit" variant="outline">
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
