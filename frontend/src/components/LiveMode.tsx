// src/components/LiveMode.tsx
import type { LiveMatchState } from "../types";

interface Props {
  data: LiveMatchState;
  onChange: (d: LiveMatchState) => void;
  team1: string;
  team2: string;
}

const LiveMode = ({ data, onChange, team1, team2: _team2 }: Props) => {
  const set = <K extends keyof LiveMatchState>(k: K, v: number) =>
    onChange({ ...data, [k]: v });

  const parse = (v: string) => parseFloat(v) || 0;

  return (
    <div className="card card-full live-mode-card fade-in">
      <p className="card-title">
        <span className="live-dot-badge" />
        Live match inputs
      </p>

      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
        {team1 || "Team 1"} batting · Update values to recalculate live win probability
      </p>

      <div className="live-inputs-grid">
        <div className="form-group">
          <label className="form-label">🏏 Current score</label>
          <input type="number" className="form-select live-input" min="0" max="300"
            value={data.score || ""}
            onChange={e => set("score", parse(e.target.value))}
            placeholder="e.g. 85"
          />
        </div>

        <div className="form-group">
          <label className="form-label">⏱️ Overs completed</label>
          <input type="number" className="form-select live-input" min="0" max="20" step="0.1"
            value={data.overs || ""}
            onChange={e => set("overs", parse(e.target.value))}
            placeholder="e.g. 10.2"
          />
        </div>

        <div className="form-group">
          <label className="form-label">❌ Wickets fallen</label>
          <input type="number" className="form-select live-input" min="0" max="10"
            value={data.wickets || ""}
            onChange={e => set("wickets", parse(e.target.value))}
            placeholder="e.g. 3"
          />
        </div>

        <div className="form-group">
          <label className="form-label">🎯 Target (if chasing)</label>
          <input type="number" className="form-select live-input" min="0" max="300"
            value={data.target || ""}
            onChange={e => set("target", parse(e.target.value))}
            placeholder="e.g. 172"
          />
        </div>
      </div>

      {data.overs > 0 && data.score >= 0 && (
        <div className="live-crr-row">
          <span>CRR: <strong>{data.overs > 0 ? (data.score / data.overs).toFixed(2) : "—"}</strong></span>
          {data.target > 0 && data.overs > 0 && (
            <span>RRR: <strong>
              {data.target > data.score
                ? ((data.target - data.score) / (20 - data.overs)).toFixed(2)
                : "—"}
            </strong></span>
          )}
          <span>Balls left: <strong>{Math.round((20 - data.overs) * 6)}</strong></span>
        </div>
      )}
    </div>
  );
};

export default LiveMode;
