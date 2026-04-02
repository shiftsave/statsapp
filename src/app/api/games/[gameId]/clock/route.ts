import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { updateGameClock } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

export async function PUT(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    if (!hasSupabaseEnv) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    const { gameId } = await params;
    const body = (await request.json()) as {
      status?: "running" | "stopped";
      elapsed_seconds?: number;
      current_period?: number;
      started_at?: string | null;
    };

    await updateGameClock(gameId, body);

    revalidatePath(`/games/${gameId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update game clock." },
      { status: 500 },
    );
  }
}
