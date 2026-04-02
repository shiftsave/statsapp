import { calculateAssessment } from "@/lib/assessment";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import type {
  DashboardData,
  Game,
  GameReportData,
  GameWithStats,
  Player,
  PlayerGameStat,
  ReflectionAnswer,
  ReflectionHistoryEntry,
  ReflectionNote,
  ReflectionQuestion,
} from "@/types/app";

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
  | "missed_free_throws"
>;

function normalizeStatLine(statLine: PlayerGameStat): PlayerGameStat {
  return {
    ...statLine,
    offensive_rebounds: statLine.offensive_rebounds ?? 0,
    defensive_rebounds: statLine.defensive_rebounds ?? 0,
    steals: statLine.steals ?? 0,
    turnovers: statLine.turnovers ?? 0,
    made_baskets: statLine.made_baskets ?? 0,
    made_free_throws: statLine.made_free_throws ?? 0,
    missed_free_throws: statLine.missed_free_throws ?? 0,
  };
}

type ReflectionAnswerInput = {
  question_id: string;
  response_value: 1 | 2 | 3 | 4;
  response_note?: string;
};

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
    stats: (stats as PlayerGameStat[])
      .map(normalizeStatLine)
      .sort((left, right) => (left.player?.name ?? "").localeCompare(right.player?.name ?? "")),
  };
}

export async function getGameReportData(gameId: string): Promise<GameReportData | null> {
  if (!hasSupabaseEnv) {
    return null;
  }

  const gameData = await getGameWithStats(gameId);

  if (!gameData) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const playerIds = gameData.stats.map((statLine) => statLine.player_id);

  const [{ data: questions, error: questionsError }, { data: answers, error: answersError }, { data: notes, error: notesError }] =
    await Promise.all([
      supabase
        .from("reflection_questions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("player_reflection_answers")
        .select("*")
        .eq("game_id", gameId),
      supabase
        .from("player_reflection_notes")
        .select("*")
        .eq("game_id", gameId),
    ]);

  if (questionsError) {
    throw questionsError;
  }

  if (answersError) {
    throw answersError;
  }

  if (notesError) {
    throw notesError;
  }

  const historyByPlayer = await getReflectionHistoryByPlayer(playerIds, gameId);

  return {
    game: gameData.game,
    stats: gameData.stats,
    questions: (questions ?? []) as ReflectionQuestion[],
    answers: (answers ?? []) as ReflectionAnswer[],
    notes: (notes ?? []) as ReflectionNote[],
    historyByPlayer,
  };
}

async function getReflectionHistoryByPlayer(playerIds: string[], currentGameId: string) {
  if (playerIds.length === 0) {
    return {} as Record<string, ReflectionHistoryEntry[]>;
  }

  const supabase = createSupabaseServerClient();
  const [{ data: answerRows, error: answersError }, { data: noteRows, error: notesError }, { data: gameRows, error: gamesError }] =
    await Promise.all([
      supabase
        .from("player_reflection_answers")
        .select("*, game:games(id, game_date, opponent, location)")
        .in("player_id", playerIds)
        .neq("game_id", currentGameId),
      supabase
        .from("player_reflection_notes")
        .select("*, game:games(id, game_date, opponent, location)")
        .in("player_id", playerIds)
        .neq("game_id", currentGameId),
      supabase
        .from("games")
        .select("id, game_date, opponent, location")
        .neq("id", currentGameId),
    ]);

  if (answersError) {
    throw answersError;
  }

  if (notesError) {
    throw notesError;
  }

  if (gamesError) {
    throw gamesError;
  }

  const gameLookup = new Map(
    (gameRows ?? []).map((game) => [game.id as string, game as Pick<Game, "id" | "game_date" | "opponent" | "location">]),
  );

  const historyByPlayer: Record<string, ReflectionHistoryEntry[]> = {};

  for (const playerId of playerIds) {
    historyByPlayer[playerId] = [];
  }

  const grouped = new Map<string, ReflectionHistoryEntry>();

  for (const answer of (answerRows ?? []) as ReflectionAnswer[]) {
    const game = gameLookup.get(answer.game_id);
    if (!game) {
      continue;
    }

    const key = `${answer.player_id}:${answer.game_id}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.answers.push(answer);
      continue;
    }

    grouped.set(key, {
      game_id: answer.game_id,
      game_date: game.game_date,
      opponent: game.opponent,
      location: game.location,
      answers: [answer],
      note: null,
    });
  }

  for (const note of (noteRows ?? []) as ReflectionNote[]) {
    const game = gameLookup.get(note.game_id);
    if (!game) {
      continue;
    }

    const key = `${note.player_id}:${note.game_id}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.note = note;
      continue;
    }

    grouped.set(key, {
      game_id: note.game_id,
      game_date: game.game_date,
      opponent: game.opponent,
      location: game.location,
      answers: [],
      note,
    });
  }

  for (const [key, entry] of grouped) {
    const [playerId] = key.split(":");
    historyByPlayer[playerId] ??= [];
    historyByPlayer[playerId].push(entry);
  }

  for (const playerId of Object.keys(historyByPlayer)) {
    historyByPlayer[playerId].sort((left, right) => right.game_date.localeCompare(left.game_date));
  }

  return historyByPlayer;
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

export async function completeGame(
  gameId: string,
  scores: { teamScore: number; opponentScore: number },
) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("games")
    .update({
      status: "completed",
      team_score: scores.teamScore,
      opponent_score: scores.opponentScore,
    })
    .eq("id", gameId);

  if (error) {
    throw error;
  }
}

export async function savePlayerReflection(input: {
  gameId: string;
  playerId: string;
  answers: ReflectionAnswerInput[];
  nextGameGoal: string;
  favoriteThing: string;
}) {
  const supabase = createSupabaseServerClient();

  const { error: answersError } = await supabase.from("player_reflection_answers").upsert(
    input.answers.map((answer) => ({
      game_id: input.gameId,
      player_id: input.playerId,
      question_id: answer.question_id,
      response_value: answer.response_value,
      response_note: answer.response_note?.trim() || null,
    })),
    { onConflict: "game_id,player_id,question_id" },
  );

  if (answersError) {
    throw answersError;
  }

  const { error: notesError } = await supabase.from("player_reflection_notes").upsert(
    {
      game_id: input.gameId,
      player_id: input.playerId,
      next_game_goal: input.nextGameGoal.trim() || null,
      favorite_thing: input.favoriteThing.trim() || null,
    },
    { onConflict: "game_id,player_id" },
  );

  if (notesError) {
    throw notesError;
  }
}
