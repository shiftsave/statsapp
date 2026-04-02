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
  assessment_score: number | null;
  assessment_summary: string | null;
  updated_at: string;
  player?: Player;
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
