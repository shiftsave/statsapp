import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { savePlayerReflection } from "@/lib/data";

export async function PUT(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { gameId } = await params;
  const body = (await request.json()) as {
    playerId?: string;
    answers?: Array<{
      question_id: string;
      response_value: 1 | 2 | 3 | 4;
      response_note?: string;
    }>;
    nextGameGoal?: string;
    favoriteThing?: string;
  };

  if (!body.playerId || !body.answers) {
    return NextResponse.json({ error: "Reflection payload is required." }, { status: 400 });
  }

  await savePlayerReflection({
    gameId,
    playerId: body.playerId,
    answers: body.answers,
    nextGameGoal: body.nextGameGoal ?? "",
    favoriteThing: body.favoriteThing ?? "",
  });

  revalidatePath(`/games/${gameId}/report`);

  return NextResponse.json({ ok: true });
}
