// src/components/MatchConditions.tsx
import type { MatchConditionsData } from "../types";

interface Props {
  open: boolean;
  onToggle: () => void;
  conditions: MatchConditionsData;
  onChange: (c: MatchConditionsData) => void;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const MatchConditions = ({ open, onToggle, conditions, onChange }: Props) => {
  const set = <K extends keyof MatchConditionsData>(k: K, v: MatchConditionsData[K]) =>
    onChange({ ...conditions, [k]: v });

  return (
    <div className="card card-full">
      <button className="collapsible-toggle" onClick={onToggle}>
        <span className="card-title" style={{ marginBottom: 0 }}>Match conditions</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="conditions-body fade-in">
          {/* Weather */}
          <div className="form-group" style={{ marginTop: "16px" }}>
            <label className="form-label">🌤️ Weather</label>
            <div className="chip-group">
              {(["clear","cloudy","dew","rain"] as const).map(w => (
                <button key={w}
                  className={`chip${conditions.weather === w ? " chip-active" : ""}`}
                  onClick={() => set("weather", w)}
                >
                  {{ clear:"☀️ Clear", cloudy:"☁️ Cloudy", dew:"💧 Dew expected", rain:"🌧️ Rain risk" }[w]}
                </button>
              ))}
            </div>
          </div>

          {/* Pitch */}
          <div className="form-group">
            <label className="form-label">🏟️ Pitch type</label>
            <div className="chip-group">
              {(["batting","balanced","bowling"] as const).map(p => (
                <button key={p}
                  className={`chip${conditions.pitch === p ? " chip-active" : ""}`}
                  onClick={() => set("pitch", p)}
                >
                  {{ batting:"🏏 Batting-friendly", balanced:"⚖️ Balanced", bowling:"🎳 Bowling-friendly" }[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Time of match */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">🕐 Time of match</label>
            <div className="chip-group">
              {(["day","day-night","night"] as const).map(t => (
                <button key={t}
                  className={`chip${conditions.timeOfDay === t ? " chip-active" : ""}`}
                  onClick={() => set("timeOfDay", t)}
                >
                  {{ day:"🌅 Day", "day-night":"🌇 Day-Night", night:"🌙 Night" }[t]}
                </button>
              ))}
            </div>
          </div>

          <p className="conditions-hint">
            Conditions subtly influence the win probability calculation.
          </p>
        </div>
      )}
    </div>
  );
};

export default MatchConditions;
