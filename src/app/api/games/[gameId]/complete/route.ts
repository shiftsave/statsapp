import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { completeGame } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

export async function PUT(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    if (!hasSupabaseEnv) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    const { gameId } = await params;
    const body = (await request.json()) as {
      teamScore?: number;
      opponentScore?: number;
    };

    if (!Number.isFinite(body.teamScore) || (body.teamScore ?? -1) < 0) {
      return NextResponse.json({ error: "Your team score is required." }, { status: 400 });
    }

    if (!Number.isFinite(body.opponentScore) || (body.opponentScore ?? -1) < 0) {
      return NextResponse.json({ error: "Opponent score is required." }, { status: 400 });
    }

    await completeGame(gameId, {
      teamScore: body.teamScore!,
      opponentScore: body.opponentScore!,
    });

    revalidatePath(`/games/${gameId}`);
    revalidatePath(`/games/${gameId}/report`);
    revalidatePath("/games");
    revalidatePath("/");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Something went wrong while completing the game.",
      },
      { status: 500 },
    );
  }
}
