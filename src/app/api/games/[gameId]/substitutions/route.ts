import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { performSubstitution } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

export async function POST(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    if (!hasSupabaseEnv) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    const { gameId } = await params;
    const body = (await request.json()) as {
      playerInId?: string;
      playerOutId?: string;
      period?: number;
      elapsedSeconds?: number;
    };

    if (!body.playerInId || !body.playerOutId || !body.period || body.elapsedSeconds == null) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await performSubstitution({
      gameId,
      playerInId: body.playerInId,
      playerOutId: body.playerOutId,
      period: body.period,
      elapsedSeconds: body.elapsedSeconds,
    });

    revalidatePath(`/games/${gameId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to perform substitution." },
      { status: 500 },
    );
  }
}
