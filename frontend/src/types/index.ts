// src/types/index.ts — All TypeScript interfaces

export interface TeamsResponse { teams: string[]; venues: string[]; }

export interface PredictRequest {
  team1: string; team2: string; venue: string;
  toss_winner: string; toss_decision: "bat" | "field";
}

export interface PredictResponse {
  team1: string; team2: string;
  team1_win_prob: number; team2_win_prob: number;
  predicted_winner: string;
}

export interface H2HResponse {
  team1: string; team2: string;
  team1_wins: number; team2_wins: number; total_matches: number;
}

export interface VenueStatsData {
  avg_first_innings: number; chasing_win_pct: number;
  best_team: string; total_matches: number;
}

export interface MatchConditionsData {
  weather: "clear" | "cloudy" | "dew" | "rain";
  pitch:   "batting" | "balanced" | "bowling";
  timeOfDay: "day" | "day-night" | "night";
}

export interface LiveMatchState {
  score: number; overs: number; wickets: number; target: number;
}

export interface PlayerData { name: string; impact: number; active: boolean; }

export interface SeasonWins { season: number; t1: number; t2: number; }

export interface PastPrediction {
  id: string; date: string; team1: string; team2: string;
  venue: string; predicted_winner: string;
  team1_prob: number; team2_prob: number;
}

export interface PointsEntry {
  team: string; played: number; won: number;
  lost: number; nr: number; nrr: number; points: number;
}

export interface ApiError { error: string; }

export interface BacktestChartItem {
  match_no: number;
  accuracy: number;
}

export interface BacktestResponse {
  status: "success" | "no_data" | "error";
  message?: string;
  total_matches?: number;
  correct_predictions?: number;
  overall_accuracy?: number;
  high_confidence_accuracy?: number;
  low_confidence_accuracy?: number;
  high_confidence_count?: number;
  low_confidence_count?: number;
  chart_data?: BacktestChartItem[];
}
