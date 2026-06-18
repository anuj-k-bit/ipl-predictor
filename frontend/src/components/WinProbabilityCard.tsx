// src/components/WinProbabilityCard.tsx
import type { PredictResponse } from "../types";
import { getTeamColor } from "../teamColors";

interface Props {
  result: PredictResponse | null;
}

// Trophy outline SVG
const TrophyIcon = ({ color = "#fff" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4a2 2 0 0 1-2-2V5h4"/>
    <path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/>
    <path d="M6 5h12v5a6 6 0 0 1-12 0V5z"/>
    <path d="M12 16v3"/>
    <path d="M8 19h8"/>
  </svg>
);

const WinProbabilityCard = ({ result }: Props) => {
  if (!result) {
    return (
      <div className="card fade-in">
        <p className="card-title" style={{ textAlign: "center" }}>Win probability</p>
        <div className="prob-empty" style={{ padding: "40px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏆</div>
          <p style={{ fontSize: "15px", fontWeight: 500 }}>Set up the match and click Predict</p>
        </div>
      </div>
    );
  }

  const c1 = getTeamColor(result.team1);
  const c2 = getTeamColor(result.team2);
  const p1 = result.team1_win_prob;
  const p2 = result.team2_win_prob;
  const winnerColor = getTeamColor(result.predicted_winner);

  return (
    <div className="card fade-in win-probability-hero">
      <p className="card-title">Win probability</p>

      {/* Hero display for teams and percentage */}
      <div className="hero-split-container">
        <div className="hero-team-block">
          <span className="hero-team-name">{result.team1}</span>
          <span className="hero-pct" style={{ color: c1 }}>{p1}%</span>
        </div>
        <div className="hero-split-vs">VS</div>
        <div className="hero-team-block">
          <span className="hero-team-name">{result.team2}</span>
          <span className="hero-pct" style={{ color: c2 }}>{p2}%</span>
        </div>
      </div>

      {/* Thick proportional split bar */}
      <div className="hero-bar-track">
        <div
          className="hero-bar-seg"
          style={{ width: `${p1}%`, background: c1 }}
        />
        <div
          className="hero-bar-seg"
          style={{ width: `${p2}%`, background: c2 }}
        />
      </div>

      {/* Dynamic winner banner */}
      <div 
        className="winner-banner" 
        style={{ 
          background: `linear-gradient(135deg, ${winnerColor}, ${winnerColor}dd)`, 
          color: '#ffffff',
          border: 'none',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <TrophyIcon color="#ffffff" />
        <span>
          Predicted winner: <strong>{result.predicted_winner}</strong>
        </span>
      </div>
    </div>
  );
};

export default WinProbabilityCard;
