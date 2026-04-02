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
            <CreateGameForm />
            <GameList games={games} />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
