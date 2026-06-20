// src/App.tsx — Full IPL Win Predictor with all features
import { useState, useEffect, useCallback } from "react";
import { fetchTeams, fetchPrediction, fetchH2H } from "./api/iplApi";
import type {
  PredictResponse, H2HResponse,
  MatchConditionsData, LiveMatchState,
  PlayerData, PastPrediction,
} from "./types";
import { TEAM_PLAYERS } from "./mockData";

import TeamSelector      from "./components/TeamSelector";
import TossInputs        from "./components/TossInputs";
import PredictButton     from "./components/PredictButton";
import WinProbabilityCard from "./components/WinProbabilityCard";
import WinProbabilityChart from "./components/WinProbabilityChart";
import HeadToHead        from "./components/HeadToHead";
import VenueStats        from "./components/VenueStats";
import MatchConditions   from "./components/MatchConditions";
import PlayerImpact      from "./components/PlayerImpact";
import LiveMode          from "./components/LiveMode";
import ShareCard         from "./components/ShareCard";
import PredictionLog     from "./components/PredictionLog";
import PointsTable       from "./components/PointsTable";
import ModelPerformance  from "./components/ModelPerformance";
import LoadingSpinner    from "./components/LoadingSpinner";
import ErrorBanner       from "./components/ErrorBanner";

// ── Helpers ───────────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function round1(v: number) { return Math.round(v * 10) / 10; }

function applyAdjustments(
  base: PredictResponse,
  t1Players: PlayerData[],
  t2Players: PlayerData[],
  cond: MatchConditionsData,
): PredictResponse {
  let adj = 0;
  t1Players.forEach(p => { if (!p.active) adj -= p.impact; });
  t2Players.forEach(p => { if (!p.active) adj += p.impact; });

  // Conditions
  if (cond.weather === "dew")      adj -= 3;  // dew helps chasing (team2)
  if (cond.weather === "rain")     adj -= 1;
  if (cond.pitch === "bowling")    adj -= 1;
  if (cond.pitch === "batting")    adj += 1;
  if (cond.timeOfDay === "night")  adj += 1;

  const p1 = clamp(round1(base.team1_win_prob + adj), 5, 95);
  const p2 = round1(100 - p1);
  return {
    ...base,
    team1_win_prob: p1,
    team2_win_prob: p2,
    predicted_winner: p1 >= p2 ? base.team1 : base.team2,
  };
}

function computeLivePrediction(
  base: PredictResponse,
  live: LiveMatchState,
): PredictResponse {
  const { score, overs, wickets, target } = live;
  if (overs <= 0 && score === 0) return base;

  let p1: number;
  if (target > 0 && overs > 0) {
    // Chasing (team2 batting)
    const remaining = target - score;
    const oversLeft = Math.max(0.1, 20 - overs);
    const rrr = remaining / oversLeft;
    const crr = score / overs;
    const rateDiff = crr - rrr;
    const wicketPenalty = (wickets / 10) * 25;
    const chasingProb = clamp(50 + rateDiff * 8 - wicketPenalty, 5, 95);
    p1 = round1(100 - chasingProb);
  } else {
    // Team1 batting first
    const runRate = overs > 0 ? score / overs : 0;
    const expectedFinal = runRate * 20;
    const excess = expectedFinal - 165;
    const wicketPenalty = (wickets / 10) * 20;
    p1 = clamp(round1(50 + excess * 0.3 - wicketPenalty + (overs / 20) * 10), 5, 95);
  }
  const p2 = round1(100 - p1);
  return {
    ...base,
    team1_win_prob: p1,
    team2_win_prob: p2,
    predicted_winner: p1 >= p2 ? base.team1 : base.team2,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
function App() {
  // ── Server data ────────────────────────────────────────────────────────────
  const [teams,  setTeams]  = useState<string[]>([]);
  const [venues, setVenues] = useState<string[]>([]);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [team1,        setTeam1]        = useState("");
  const [team2,        setTeam2]        = useState("");
  const [venue,        setVenue]        = useState("");
  const [tossWinner,   setTossWinner]   = useState("");
  const [tossDecision, setTossDecision] = useState<"bat" | "field" | "">("");

  // ── Results ────────────────────────────────────────────────────────────────
  const [baseResult, setBaseResult] = useState<PredictResponse | null>(null);
  const [h2h,        setH2h]        = useState<H2HResponse | null>(null);

  // ── Display prediction (adjusted for players + conditions + live) ───────────
  const [displayResult, setDisplayResult] = useState<PredictResponse | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(false);
  const [initLoad, setInitLoad] = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [mode,     setMode]     = useState<"mock" | "real" | null>(null);

  // ── App mode toggle ────────────────────────────────────────────────────────
  const [appMode, setAppMode] = useState<"prematch" | "live">("prematch");

  // ── Live match state ───────────────────────────────────────────────────────
  const [liveData, setLiveData] = useState<LiveMatchState>({
    score: 0, overs: 0, wickets: 0, target: 0,
  });

  // ── Match conditions ───────────────────────────────────────────────────────
  const [conditions, setConditions] = useState<MatchConditionsData>({
    weather: "clear", pitch: "balanced", timeOfDay: "day-night",
  });
  const [showConditions, setShowConditions] = useState(false);

  // ── Player impact ──────────────────────────────────────────────────────────
  const [team1Players, setTeam1Players] = useState<PlayerData[]>([]);
  const [team2Players, setTeam2Players] = useState<PlayerData[]>([]);
  const [showPlayerImpact, setShowPlayerImpact] = useState(false);

  // ── Points table ───────────────────────────────────────────────────────────
  const [showPointsTable, setShowPointsTable] = useState(false);

  // ── Model performance ──────────────────────────────────────────────────────
  const [showModelPerformance, setShowModelPerformance] = useState(false);

  // ── Prediction log ─────────────────────────────────────────────────────────
  const [showPredLog,  setShowPredLog]  = useState(false);
  const [pastPredictions, setPastPredictions] = useState<PastPrediction[]>([]);

  // ── Load teams on mount ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTeams();
        setTeams(data.teams);
        setVenues(data.venues);
      } catch {
        setError("Cannot reach Flask backend. Make sure it is running on port 5000.");
      } finally {
        setInitLoad(false);
      }
    })();
    fetch("/api/health")
      .then(r => r.json())
      .then(d => setMode(d.mode))
      .catch(() => {});

    // Load prediction log from localStorage
    try {
      const stored = localStorage.getItem("ipl_predictions");
      if (stored) setPastPredictions(JSON.parse(stored));
    } catch {}
  }, []);

  // ── Load player lists when teams change ───────────────────────────────────
  useEffect(() => {
    setTeam1Players(team1 ? (TEAM_PLAYERS[team1] ?? []).map(p => ({ ...p, active: true })) : []);
  }, [team1]);
  useEffect(() => {
    setTeam2Players(team2 ? (TEAM_PLAYERS[team2] ?? []).map(p => ({ ...p, active: true })) : []);
  }, [team2]);

  // ── Auto-fetch H2H ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!team1 || !team2 || team1 === team2) { setH2h(null); return; }
    fetchH2H(team1, team2).then(setH2h).catch(() => setH2h(null));
  }, [team1, team2]);

  // ── Reset toss winner when teams change ────────────────────────────────────
  useEffect(() => {
    if (tossWinner && tossWinner !== team1 && tossWinner !== team2) setTossWinner("");
  }, [team1, team2]);

  // ── Recompute display prediction on any adjustment ─────────────────────────
  useEffect(() => {
    if (!baseResult) { setDisplayResult(null); return; }
    let adjusted = applyAdjustments(baseResult, team1Players, team2Players, conditions);
    if (appMode === "live") adjusted = computeLivePrediction(adjusted, liveData);
    setDisplayResult(adjusted);
  }, [baseResult, team1Players, team2Players, conditions, appMode, liveData]);

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (field: "team1" | "team2" | "venue", value: string) => {
      if (field === "team1") setTeam1(value);
      if (field === "team2") setTeam2(value);
      if (field === "venue") setVenue(value);
      setBaseResult(null);
      setError(null);
    }, []
  );

  const handleTossChange = useCallback(
    (field: "tossWinner" | "tossDecision", value: string) => {
      if (field === "tossWinner")   setTossWinner(value);
      if (field === "tossDecision") setTossDecision(value as "bat" | "field");
      setBaseResult(null);
      setError(null);
    }, []
  );

  const handleTogglePlayer = (teamNum: 1 | 2, name: string) => {
    const toggle = (list: PlayerData[]) =>
      list.map(p => p.name === name ? { ...p, active: !p.active } : p);
    if (teamNum === 1) setTeam1Players(toggle);
    else               setTeam2Players(toggle);
  };

  // ── Predict ────────────────────────────────────────────────────────────────
  const handlePredict = async () => {
    if (!team1 || !team2 || !venue || !tossWinner || !tossDecision) {
      setError("Please fill in all fields before predicting.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPrediction({
        team1, team2, venue,
        toss_winner: tossWinner,
        toss_decision: tossDecision,
      });
      setBaseResult(result);

      // Save to prediction log
      const entry: PastPrediction = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        team1, team2, venue,
        predicted_winner: result.predicted_winner,
        team1_prob: result.team1_win_prob,
        team2_prob: result.team2_win_prob,
      };
      const updated = [entry, ...pastPredictions].slice(0, 20);
      setPastPredictions(updated);
      localStorage.setItem("ipl_predictions", JSON.stringify(updated));
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Prediction failed. Make sure Flask backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = !!team1 && !!team2 && !!venue && !!tossWinner && !!tossDecision;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {loading && <LoadingSpinner />}

      {/* Prediction log modal */}
      <PredictionLog
        open={showPredLog}
        onClose={() => setShowPredLog(false)}
        predictions={pastPredictions}
        onClear={() => {
          setPastPredictions([]);
          localStorage.removeItem("ipl_predictions");
        }}
      />

      <div className="app-wrapper" style={{ position: "relative" }}>
        {/* Floating Top-Right History Button */}
        <div className="history-btn-floating">
          <button className="history-btn" onClick={() => setShowPredLog(true)}>
            📋 Past predictions {pastPredictions.length > 0 ? `(${pastPredictions.length})` : ""}
          </button>
        </div>

        {/* ── Header ── */}
        <header className="app-header">
          <span className="cricket-deco">🏏</span>
          <div className="header-season-text">IPL 2024 Season</div>
          <h1 className="header-title">
            <span className="glow-text-gold">IPL</span>{" "}
            <span className="glow-text-blue">Win Predictor</span>
          </h1>
          <p className="header-subtitle">
            Predict match outcomes using machine learning trained on historical IPL data
          </p>

          {/* Mode badge + accuracy */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", flexWrap: "wrap", justifyContent: "center" }}>
            {mode && (
              <span className={`mode-badge ${mode}`}>
                {mode === "mock" ? "🔮 Demo Mode" : "🤖 ML Model"}
              </span>
            )}
            <span className="accuracy-badge">✓ Accuracy: 68%</span>
          </div>

          {/* App mode toggle */}
          <div className="app-mode-bar" style={{ marginTop: "18px" }}>
            <div className="mode-toggle">
              <button
                className={`mode-toggle-btn${appMode === "prematch" ? " active" : ""}`}
                onClick={() => setAppMode("prematch")}
              >
                📊 Pre-match
              </button>
              <button
                className={`mode-toggle-btn${appMode === "live" ? " active" : ""}`}
                onClick={() => setAppMode("live")}
              >
                <span className="live-dot-badge" />
                Live match
              </button>
            </div>
          </div>

          <div className="header-divider" />
        </header>

        {/* ── Init loading ── */}
        {initLoad && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }} />
            <p>Connecting to backend…</p>
          </div>
        )}

        {/* ── Global error ── */}
        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

        {!initLoad && (
          <>
            {/* ── Input row ── */}
            <div className="main-grid">
              {/* Left column: team selector + venue stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <TeamSelector
                  teams={teams} venues={venues}
                  team1={team1} team2={team2} venue={venue}
                  onChange={handleChange}
                />
                {venue && <VenueStats venue={venue} />}
              </div>

              {/* Right column: toss + conditions + predict */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <TossInputs
                  teams={teams} team1={team1} team2={team2}
                  tossWinner={tossWinner} tossDecision={tossDecision}
                  onChange={handleTossChange}
                />
                <MatchConditions
                  open={showConditions}
                  onToggle={() => setShowConditions(o => !o)}
                  conditions={conditions}
                  onChange={setConditions}
                />
                <PredictButton
                  onClick={handlePredict}
                  disabled={!isFormComplete}
                  loading={loading}
                />
              </div>
            </div>

            {/* ── Player impact (full-width, collapsible) ── */}
            {team1 && team2 && (
              <div style={{ marginTop: "20px" }}>
                <PlayerImpact
                  open={showPlayerImpact}
                  onToggle={() => setShowPlayerImpact(o => !o)}
                  team1={team1} team2={team2}
                  team1Players={team1Players}
                  team2Players={team2Players}
                  onTogglePlayer={handleTogglePlayer}
                />
              </div>
            )}

            {/* ── Live match inputs (shown in live mode) ── */}
            {appMode === "live" && team1 && team2 && (
              <div style={{ marginTop: "20px" }}>
                <LiveMode
                  data={liveData}
                  onChange={setLiveData}
                  team1={team1}
                  team2={team2}
                />
              </div>
            )}

            {/* ── Divider ── */}
            <div className="main-grid section-gap" style={{ marginTop: "24px" }}>
              <div className="section-divider" />
            </div>

            {/* ── Results row ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px" }}>
              {/* Win probability — show live badge when in live mode */}
              <div style={{ position: "relative", width: "100%" }}>
                {appMode === "live" && displayResult && (
                  <div style={{
                    position: "absolute", top: "20px", right: "20px", zIndex: 2,
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "99px", padding: "4px 10px",
                    fontSize: "0.75rem", color: "var(--red)", fontWeight: 700,
                    letterSpacing: "1px"
                  }}>
                    <span className="live-dot-badge" />
                    LIVE
                  </div>
                )}
                <WinProbabilityCard result={displayResult} />
              </div>

              {/* Secondary results columns */}
              <div className="main-grid" style={{ marginTop: 0 }}>
                {displayResult && (
                  <ShareCard result={displayResult} venue={venue} />
                )}
                <WinProbabilityChart result={displayResult} />
                <HeadToHead data={h2h} />
              </div>
            </div>

            {/* ── Points table (collapsible, full-width) ── */}
            <PointsTable
              open={showPointsTable}
              onToggle={() => setShowPointsTable(o => !o)}
            />

            {/* ── Model performance (collapsible, full-width) ── */}
            <ModelPerformance
              open={showModelPerformance}
              onToggle={() => setShowModelPerformance(o => !o)}
            />
          </>
        )}
      </div>
    </>
  );
}

export default App;
