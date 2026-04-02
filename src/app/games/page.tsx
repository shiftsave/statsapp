import { AppShell } from "@/components/layout/app-shell";
import { CreateGameForm } from "@/components/games/create-game-form";
import { GameList } from "@/components/games/game-list";
import { SetupCallout } from "@/components/shared/setup-callout";
import { getGames } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

export default async function GamesPage() {
  const games = hasSupabaseEnv ? await getGames() : [];

  return (
    <AppShell currentPath="/games">
      <div className="space-y-5">
        {!hasSupabaseEnv ? <SetupCallout /> : null}
        {hasSupabaseEnv ? (
          <>
            <section className="northland-panel p-5 sm:p-6">
              <p className="northland-kicker">Live workflow</p>
              <h2 className="mt-4 text-4xl font-bold uppercase leading-[0.88] tracking-tight text-white">
                Start a game fast and stay in the cards.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#bdd0e7]">
                Create the session, jump into player-first stat entry, and hand the device straight
                into post-game reflections.
              </p>
            </section>
            <CreateGameForm />
            <GameList games={games} />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
