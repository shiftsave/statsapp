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
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="northland-surface sticky top-4 z-20 p-3 sm:p-4">
          <nav className="flex w-full gap-3">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? currentPath === "/" : currentPath?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-14 flex-1 items-center justify-center rounded-[1.25rem] border px-5 py-3 text-center text-sm font-medium uppercase tracking-[0.18em] transition-colors",
                    isActive
                      ? "border-[#2e86ff] bg-[#2e86ff] text-white"
                      : "border-white/10 bg-[#0d2137] text-[#d3def0] hover:bg-[#153153]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1 py-5 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
