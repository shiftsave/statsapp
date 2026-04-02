export type Player = {
  id: string;
  name: string;
  jersey_number: number | null;
  is_active: boolean;
  created_at: string;
};

export type Game = {
  id: string;
  game_date: string;
  opponent: string | null;
  location: string | null;
  team_score: number | null;
  opponent_score: number | null;
  status: "in_progress" | "completed";
  notes: string | null;
  created_at: string;
};

export type PlayerGameStat = {
  id: string;
  game_id: string;
  player_id: string;
  offensive_rebounds: number;
  defensive_rebounds: number;
  steals: number;
  turnovers: number;
  made_baskets: number;
  made_free_throws: number;
  missed_free_throws: number;
  assessment_score: number | null;
  assessment_summary: string | null;
  updated_at: string;
  player?: Player;
};

export type ReflectionQuestion = {
  id: string;
  prompt: string;
  sort_order: number;
  is_active: boolean;
};

export type ReflectionAnswer = {
  id: string;
  game_id: string;
  player_id: string;
  question_id: string;
  response_value: 1 | 2 | 3 | 4;
  response_note?: string | null;
};

export type ReflectionNote = {
  id: string;
  game_id: string;
  player_id: string;
  next_game_goal: string | null;
  favorite_thing: string | null;
};

export type ReflectionHistoryEntry = {
  game_id: string;
  game_date: string;
  opponent: string | null;
  location: string | null;
  answers: ReflectionAnswer[];
  note: ReflectionNote | null;
};

export type AssessmentResult = {
  score: number;
  summary: string;
  weightedTotal: number;
};

export type DashboardData = {
  players: Player[];
  recentGames: Game[];
};

export type GameWithStats = {
  game: Game;
  stats: PlayerGameStat[];
};

export type GameReportData = {
  game: Game;
  stats: PlayerGameStat[];
  questions: ReflectionQuestion[];
  answers: ReflectionAnswer[];
  notes: ReflectionNote[];
  historyByPlayer: Record<string, ReflectionHistoryEntry[]>;
};
