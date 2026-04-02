import { calculateAssessment } from "@/lib/assessment";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import type { DashboardData, Game, GameWithStats, Player, PlayerGameStat } from "@/types/app";

type CreatePlayerInput = {
  name: string;
  jerseyNumber?: number | null;
};

type CreateGameInput = {
  gameDate: string;
  opponent?: string | null;
  location?: string | null;
  notes?: string | null;
};

type StatUpdateInput = Pick<
  PlayerGameStat,
  | "id"
  | "game_id"
  | "player_id"
  | "offensive_rebounds"
  | "defensive_rebounds"
  | "steals"
  | "turnovers"
  | "made_baskets"
  | "made_free_throws"
>;

export async function getDashboardData(): Promise<DashboardData | null> {
  if (!hasSupabaseEnv) {
    return null;
  }

  const [players, recentGames] = await Promise.all([getPlayers(), getGames(4)]);

  return { players, recentGames };
}

export async function getPlayers() {
  if (!hasSupabaseEnv) {
    return [] as Player[];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name");

  if (error) {
    throw error;
  }

  return data satisfies Player[];
}

export async function createPlayer(input: CreatePlayerInput) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("players").insert({
    name: input.name,
    jersey_number: input.jerseyNumber ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function togglePlayerActive(playerId: string, nextValue: boolean) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("players")
    .update({ is_active: nextValue })
    .eq("id", playerId);

  if (error) {
    throw error;
  }
}

export async function getGames(limit = 12) {
  if (!hasSupabaseEnv) {
    return [] as Game[];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("game_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data satisfies Game[];
}

export async function createGameWithRoster(input: CreateGameInput) {
  const supabase = createSupabaseServerClient();

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      game_date: input.gameDate,
      opponent: input.opponent ?? null,
      location: input.location ?? null,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();

  if (gameError) {
    throw gameError;
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id")
    .eq("is_active", true)
    .order("name");

  if (playersError) {
    throw playersError;
  }

  if (players.length > 0) {
    const { error: statsError } = await supabase.from("player_game_stats").insert(
      players.map((player) => ({
        game_id: game.id,
        player_id: player.id,
      })),
    );

    if (statsError) {
      throw statsError;
    }
  }

  return game.id as string;
}

export async function getGameWithStats(gameId: string): Promise<GameWithStats | null> {
  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameError) {
    if (gameError.code === "PGRST116") {
      return null;
    }
    throw gameError;
  }

  const { data: stats, error: statsError } = await supabase
    .from("player_game_stats")
    .select("*, player:players(*)")
    .eq("game_id", gameId)
    .order("created_at");

  if (statsError) {
    throw statsError;
  }

  return {
    game: game as Game,
    stats: (stats as PlayerGameStat[]).sort((left, right) =>
      (left.player?.name ?? "").localeCompare(right.player?.name ?? ""),
    ),
  };
}

export async function updateGameStats(statLines: StatUpdateInput[]) {
  const supabase = createSupabaseServerClient();
  const updates = statLines.map((statLine) => {
    const assessment = calculateAssessment(statLine);

    return {
      ...statLine,
      assessment_score: assessment.score,
      assessment_summary: assessment.summary,
    };
  });

  const { error } = await supabase
    .from("player_game_stats")
    .upsert(updates, { onConflict: "game_id,player_id" });

  if (error) {
    throw error;
  }
}

export async function completeGame(gameId: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("games")
    .update({ status: "completed" })
    .eq("id", gameId);

  if (error) {
    throw error;
  }
}
