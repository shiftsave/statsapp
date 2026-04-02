"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { completeGame, createGameWithRoster, createPlayer, togglePlayerActive } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";

function ensureSupabase() {
  if (!hasSupabaseEnv) {
    throw new Error("Supabase is not configured yet.");
  }
}

export async function addPlayerAction(formData: FormData) {
  ensureSupabase();

  const name = String(formData.get("name") ?? "").trim();
  const jersey = String(formData.get("jersey_number") ?? "").trim();

  if (!name) {
    throw new Error("Player name is required.");
  }

  await createPlayer({
    name,
    jerseyNumber: jersey ? Number(jersey) : null,
  });

  revalidatePath("/");
  revalidatePath("/players");
  revalidatePath("/games");
}

export async function togglePlayerStatusAction(formData: FormData) {
  ensureSupabase();

  const playerId = String(formData.get("player_id") ?? "");
  const nextValue = String(formData.get("next_value") ?? "") === "true";

  if (!playerId) {
    throw new Error("Player id is required.");
  }

  await togglePlayerActive(playerId, nextValue);
  revalidatePath("/players");
  revalidatePath("/games");
}

export async function createGameAction(formData: FormData) {
  ensureSupabase();

  const gameDate = String(formData.get("game_date") ?? "");

  if (!gameDate) {
    throw new Error("Game date is required.");
  }

  const gameId = await createGameWithRoster({
    gameDate,
    opponent: String(formData.get("opponent") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath("/");
  revalidatePath("/games");
  redirect(`/games/${gameId}`);
}

export async function completeGameAction(formData: FormData) {
  ensureSupabase();

  const gameId = String(formData.get("game_id") ?? "");
  const teamScore = Number(formData.get("team_score"));
  const opponentScore = Number(formData.get("opponent_score"));

  if (!gameId) {
    throw new Error("Game id is required.");
  }

  if (!Number.isFinite(teamScore) || teamScore < 0) {
    throw new Error("Your team score is required.");
  }

  if (!Number.isFinite(opponentScore) || opponentScore < 0) {
    throw new Error("Opponent score is required.");
  }

  await completeGame(gameId, { teamScore, opponentScore });
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/report`);
  revalidatePath("/games");
  revalidatePath("/");
  redirect(`/games/${gameId}/report`);
}
