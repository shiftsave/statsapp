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
            <section className="northland-panel p-5 sm:p-6">
              <p className="northland-kicker">Roster management</p>
              <h2 className="mt-4 text-4xl font-bold uppercase leading-[0.88] tracking-tight text-white">
                Build the squad card by card.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#bdd0e7]">
                Keep names, numbers, and active status clean so game creation stays frictionless on
                mobile.
              </p>
            </section>
            <PlayerForm />
            <PlayerList players={players} />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
