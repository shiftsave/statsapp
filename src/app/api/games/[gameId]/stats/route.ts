import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { updateGameStats } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

export async function PUT(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { gameId } = await params;
  const body = (await request.json()) as {
    stats?: Array<{
      id: string;
      game_id: string;
      player_id: string;
      offensive_rebounds: number;
      defensive_rebounds: number;
      steals: number;
      turnovers: number;
      made_baskets: number;
      made_free_throws: number;
    }>;
  };

  if (!body.stats || !Array.isArray(body.stats)) {
    return NextResponse.json({ error: "Stats payload is required." }, { status: 400 });
  }

  await updateGameStats(body.stats);

  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/report`);
  revalidatePath("/games");

  return NextResponse.json({ ok: true });
}
