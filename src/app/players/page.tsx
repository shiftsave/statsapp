import { AppShell } from "@/components/layout/app-shell";
import { PlayerForm } from "@/components/players/player-form";
import { PlayerList } from "@/components/players/player-list";
import { SetupCallout } from "@/components/shared/setup-callout";
import { getPlayers } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

export default async function PlayersPage() {
  const players = hasSupabaseEnv ? await getPlayers() : [];

  return (
    <AppShell currentPath="/players">
      <div className="space-y-5">
        {!hasSupabaseEnv ? <SetupCallout /> : null}
        {hasSupabaseEnv ? (
          <>
            <PlayerForm />
            <PlayerList players={players} />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
