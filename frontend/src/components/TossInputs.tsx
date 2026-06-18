// src/components/TossInputs.tsx
import CustomDropdown from "./CustomDropdown";

interface Props {
  teams: string[];
  team1: string;
  team2: string;
  tossWinner: string;
  tossDecision: "bat" | "field" | "";
  onChange: (field: "tossWinner" | "tossDecision", value: string) => void;
}

const TossInputs = ({ team1, team2, tossWinner, tossDecision, onChange }: Props) => {
  const tossTeams = [team1, team2].filter(Boolean);
  const ready = tossTeams.length === 2;

  const tossOptions = tossTeams.map((t) => ({ value: t, label: t, showDot: true }));

  return (
    <div className="card">
      <p className="card-title">Toss details</p>

      <div className="form-group">
        <label className="form-label" htmlFor="toss-winner-dropdown">🪙 Toss winner</label>
        <CustomDropdown
          id="toss-winner-dropdown"
          value={tossWinner}
          placeholder={ready ? "Who won the toss?" : "Select both teams first"}
          options={tossOptions}
          onChange={(v) => onChange("tossWinner", v)}
          disabled={!ready}
        />
      </div>

      <div className="form-group">
        <label className="form-label">🎯 Toss decision</label>
        <div className="radio-group">
          <label className={`radio-option ${tossDecision === "bat" ? "active" : ""}`}>
            <input
              type="radio"
              name="tossDecision"
              value="bat"
              checked={tossDecision === "bat"}
              onChange={(e) => onChange("tossDecision", e.target.value)}
            />
            <span className="radio-icon">🏏</span>
            Bat first
          </label>
          <label className={`radio-option ${tossDecision === "field" ? "active" : ""}`}>
            <input
              type="radio"
              name="tossDecision"
              value="field"
              checked={tossDecision === "field"}
              onChange={(e) => onChange("tossDecision", e.target.value)}
            />
            <span className="radio-icon">🧤</span>
            Field first
          </label>
        </div>
      </div>
    </div>
  );
};

export default TossInputs;
