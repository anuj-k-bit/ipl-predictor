// src/components/PredictionLog.tsx
import type { PastPrediction } from "../types";
import { getTeamColor } from "../teamColors";

interface Props {
  open: boolean;
  onClose: () => void;
  predictions: PastPrediction[];
  onClear: () => void;
}

const PredictionLog = ({ open, onClose, predictions, onClear }: Props) => {
  if (!open) return null;

  const accuracy = 68; // Model accuracy badge value

  return (
    <div className="pred-log-overlay">
      <div className="pred-log-panel fade-in">
        <div className="pred-log-header">
          <div>
            <h2 style={{ fontFamily: "Outfit", fontSize: "1.1rem", fontWeight: 700 }}>
              Past predictions
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Model accuracy: <strong style={{ color: "var(--green)" }}>{accuracy}%</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {predictions.length > 0 && (
              <button className="chip" onClick={onClear} style={{ fontSize: "0.72rem" }}>
                Clear
              </button>
            )}
            <button className="pred-log-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {predictions.length === 0 ? (
          <div className="h2h-empty">
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📋</div>
            <p>No predictions yet — make your first prediction!</p>
          </div>
        ) : (
          <div className="pred-log-list">
            <table className="pts-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th style={{ textAlign: "left" }}>Match</th>
                  <th>Prediction</th>
                  <th>Prob</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map(p => {
                  const c = getTeamColor(p.predicted_winner);
                  return (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                        {p.date}
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem" }}>
                          {p.team1.split(" ").pop()} vs {p.team2.split(" ").pop()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="team-dot" style={{ background: c }} />
                          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: c }}>
                            {p.predicted_winner.split(" ").slice(-2).join(" ")}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: "Outfit", fontWeight: 600, fontSize: "0.88rem" }}>
                        {p.predicted_winner === p.team1 ? p.team1_prob : p.team2_prob}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionLog;
