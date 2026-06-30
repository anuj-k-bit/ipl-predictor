// src/api/iplApi.ts
// Typed Axios client for all Flask API endpoints

import axios from "axios";
import type {
  TeamsResponse,
  PredictRequest,
  PredictResponse,
  H2HResponse,
  BacktestResponse,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export const fetchTeams = async (): Promise<TeamsResponse> => {
  const { data } = await api.get<TeamsResponse>("/teams");
  return data;
};

export const fetchPrediction = async (
  payload: PredictRequest
): Promise<PredictResponse> => {
  const { data } = await api.post<PredictResponse>("/predict", payload);
  return data;
};

export const fetchH2H = async (
  team1: string,
  team2: string
): Promise<H2HResponse> => {
  const { data } = await api.get<H2HResponse>("/h2h", {
    params: { team1, team2 },
  });
  return data;
};

export const fetchBacktest = async (): Promise<BacktestResponse> => {
  const { data } = await api.get<BacktestResponse>("/backtest");
  return data;
};
