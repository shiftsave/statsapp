import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { SetupCallout } from "@/components/shared/setup-callout";
import { getDashboardData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";
import { formatGameDate } from "@/lib/format";

const actionClass =
  "flex min-h-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-[#0d2137] px-5 py-3 text-center text-sm font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#153153]";

export default async function Home() {
  const dashboardData = hasSupabaseEnv ? await getDashboardData() : null;

  return (
    <AppShell currentPath="/">
      <div className="space-y-5">
        {!hasSupabaseEnv ? <SetupCallout /> : null}
        <div className="grid gap-5">
          <section className="northland-panel overflow-hidden p-5 sm:p-7">
            <p className="northland-kicker">Game day dashboard</p>
            <h2 className="mt-4 text-5xl font-bold uppercase leading-[0.85] tracking-tight text-white sm:text-6xl">
              Northland Phoenix U16 Stats
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#bdd0e7]">
              Big cards, large touch targets, quick stat updates, and post-game player reflections
              all tuned for sideline use.
            </p>
          </section>
        </div>
        {dashboardData ? (
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="northland-panel p-5 sm:p-6">
              <p className="northland-kicker">Active roster</p>
              <div className="mt-5 space-y-3">
                {dashboardData.players.slice(0, 6).map((player) => (
                  <div
                    key={player.id}
                    className="flex min-h-16 items-center justify-between rounded-[1.25rem] border border-white/10 bg-[#0d2137] px-4 py-3"
                  >
                    <div>
                      <p className="text-2xl font-medium uppercase tracking-tight text-white">
                        {player.name}
                      </p>
                      <p className="mt-1 text-sm text-[#9fb6d4]">
                        {player.jersey_number ? `#${player.jersey_number}` : "No jersey number"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${
                        player.is_active
                          ? "bg-[#173a27] text-[#9de189]"
                          : "bg-[#243244] text-[#9fb6d4]"
                      }`}
                    >
                      {player.is_active ? "Active" : "Archived"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section className="northland-panel p-5 sm:p-6">
              <p className="northland-kicker">Recent games</p>
              <div className="mt-5 space-y-3">
                {dashboardData.recentGames.length === 0 ? (
                  <p className="text-sm text-[#9fb6d4]">No games yet.</p>
                ) : (
                  dashboardData.recentGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex flex-col gap-3 rounded-[1.25rem] border border-white/10 bg-[#0d2137] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-2xl font-medium uppercase tracking-tight text-white">
                          {game.opponent ? `vs ${game.opponent}` : "Game session"}
                        </p>
                        <p className="mt-1 text-sm text-[#9fb6d4]">
                          {formatGameDate(game.game_date)}
                          {game.location ? ` • ${game.location}` : ""}
                        </p>
                      </div>
                      <Link className={actionClass} href={`/games/${game.id}`}>
                        Open game
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
