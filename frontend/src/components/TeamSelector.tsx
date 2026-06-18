// src/components/TeamSelector.tsx
import CustomDropdown from "./CustomDropdown";
import { RECENT_FORM } from "../mockData";

interface Props {
  teams: string[];
  venues: string[];
  team1: string;
  team2: string;
  venue: string;
  onChange: (field: "team1" | "team2" | "venue", value: string) => void;
}

const FormStrip = ({ team }: { team: string }) => {
  const form = RECENT_FORM[team];
  if (!team || !form) return null;
  return (
    <div className="form-strip">
      <span className="form-strip-label">Last 5:</span>
      {form.map((r, i) => (
        <span key={i} className={`form-bubble form-bubble-${r === "W" ? "win" : "loss"}`}>
          {r}
        </span>
      ))}
    </div>
  );
};

const TeamSelector = ({ teams, venues, team1, team2, venue, onChange }: Props) => {
  const teamOptions = (excludeTeam: string) =>
    teams.map((t) => ({ value: t, label: t, disabled: t === excludeTeam, showDot: true }));

  const venueOptions = venues.map((v) => ({ value: v, label: v, showDot: false }));

  return (
    <div className="card">
      <p className="card-title">Match setup</p>

      <div className="form-group">
        <label className="form-label" htmlFor="team1-dropdown">🏏 Team 1</label>
        <CustomDropdown
          id="team1-dropdown"
          value={team1}
          placeholder="Select Team 1"
          options={teamOptions(team2)}
          onChange={(v) => onChange("team1", v)}
        />
        <FormStrip team={team1} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="team2-dropdown">🏏 Team 2</label>
        <CustomDropdown
          id="team2-dropdown"
          value={team2}
          placeholder="Select Team 2"
          options={teamOptions(team1)}
          onChange={(v) => onChange("team2", v)}
        />
        <FormStrip team={team2} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="venue-dropdown">🏟️ Venue</label>
        <CustomDropdown
          id="venue-dropdown"
          value={venue}
          placeholder="Select venue"
          options={venueOptions}
          onChange={(v) => onChange("venue", v)}
        />
      </div>
    </div>
  );
};

export default TeamSelector;
