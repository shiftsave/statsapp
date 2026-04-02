import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { SetupCallout } from "@/components/shared/setup-callout";
import { getDashboardData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";
import { formatGameDate } from "@/lib/format";

const featureCards = [
  {
    title: "Players",
    value: "Roster control",
    description: "Add names, numbers, and keep active players ready for the next tip-off.",
    href: "/players",
    accent: "text-[#79cf62]",
  },
  {
    title: "Games",
    value: "Live entry",
    description: "Start a game fast and move straight into large-card stat recording.",
    href: "/games",
    accent: "text-[#2e86ff]",
  },
  {
    title: "Reports",
    value: "Reflection flow",
    description: "Players review stats, complete reflections, and revisit earlier notes.",
    href: "/games",
    accent: "text-[#d7b354]",
  },
];

const actionClass =
  "flex min-h-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-[#0d2137] px-5 py-3 text-center text-sm font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#153153]";

export default async function Home() {
  const dashboardData = hasSupabaseEnv ? await getDashboardData() : null;

  return (
    <AppShell currentPath="/">
      <div className="space-y-5">
        {!hasSupabaseEnv ? <SetupCallout /> : null}
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="northland-panel overflow-hidden p-5 sm:p-7">
            <p className="northland-kicker">Game day dashboard</p>
            <h2 className="mt-4 text-5xl font-bold uppercase leading-[0.85] tracking-tight text-white sm:text-6xl">
              Built for fast hands on iPhone and iPad.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#bdd0e7]">
              Big cards, large touch targets, quick stat updates, and post-game player reflections
              all tuned for sideline use.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link className={`${actionClass} bg-[#2e86ff] hover:bg-[#4b97ff]`} href="/players">
                Set roster
              </Link>
              <Link className={actionClass} href="/games">
                Start game flow
              </Link>
            </div>
          </section>
          <section className="northland-panel p-5 sm:p-6">
            <p className="northland-kicker">Northland priorities</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[1.5rem] border border-[#2e86ff]/35 bg-[#0c1f34] p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-[#7fb2ff]">Touch first</p>
                <p className="mt-2 text-3xl font-bold uppercase leading-none text-white">56pt actions</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#79cf62]/30 bg-[#0c1f34] p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-[#9de189]">Card stack layout</p>
                <p className="mt-2 text-3xl font-bold uppercase leading-none text-white">Phone to iPad</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#d7b354]/30 bg-[#0c1f34] p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-[#efcf7f]">Reflection history</p>
                <p className="mt-2 text-3xl font-bold uppercase leading-none text-white">Per player</p>
              </div>
            </div>
          </section>
        </div>

        <section className="northland-card-grid">
          {featureCards.map((card) => (
            <article key={card.title} className="northland-panel p-5 sm:p-6">
              <p className="northland-kicker">{card.title}</p>
              <p className={`mt-4 text-4xl font-bold uppercase leading-[0.9] ${card.accent}`}>
                {card.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#b4c8e2]">{card.description}</p>
              <Link className={`${actionClass} mt-5`} href={card.href}>
                Open {card.title}
              </Link>
            </article>
          ))}
        </section>

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
