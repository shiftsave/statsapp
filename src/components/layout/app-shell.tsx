import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/players", label: "Players" },
  { href: "/games", label: "Games" },
];

export function AppShell({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath?: string;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#13203b_52%,_#eef2ff_52%,_#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/15 bg-white/10 px-5 py-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur sm:px-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                Basketball MVP
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Fast player stat tracking for game day.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
                Add players, start a game, update each stat line, and finish with a simple 1-5
                player assessment.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? currentPath === "/" : currentPath?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-white bg-white text-slate-950"
                        : "border-white/20 bg-white/5 text-slate-100 hover:bg-white/15",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  );
}
