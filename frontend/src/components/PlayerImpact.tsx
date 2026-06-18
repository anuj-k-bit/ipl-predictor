// src/components/PlayerImpact.tsx
import type { PlayerData } from "../types";
import { getTeamColor } from "../teamColors";

interface Props {
  open: boolean;
  onToggle: () => void;
  team1: string;
  team2: string;
  team1Players: PlayerData[];
  team2Players: PlayerData[];
  onTogglePlayer: (team: 1 | 2, name: string) => void;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

interface PlayerRowProps {
  player: PlayerData;
  teamColor: string;
  onToggle: () => void;
}

const PlayerRow = ({ player, teamColor, onToggle }: PlayerRowProps) => {
  const maxImpact = 6.0;
  const barPercent = Math.min(100, Math.max(0, (player.impact / maxImpact) * 100));

  return (
    <div className={`player-row${player.active ? "" : " player-inactive"}`}>
      <div className="player-row-left">
        <span className="player-dot" style={{ background: teamColor }} />
        <span className="player-name">{player.name}</span>
      </div>
      <div className="player-row-right">
        {/* Horizontal bar indicator */}
        <div className="player-bar-container">
          <div
            className="player-bar-fill"
            style={{
              width: player.active ? `${barPercent}%` : "0%",
              background: teamColor,
            }}
          />
        </div>
        <span className="player-impact" style={{ color: player.active ? teamColor : "var(--text-muted)" }}>
          {player.active ? `+${player.impact}%` : `−${player.impact}%`}
        </span>
        <label className="toggle-switch">
          <input type="checkbox" checked={player.active} onChange={onToggle} />
          <span className="toggle-slider" style={{ ["--tc" as string]: teamColor }} />
        </label>
      </div>
    </div>
  );
};

const PlayerImpact = ({
  open, onToggle, team1, team2,
  team1Players, team2Players, onTogglePlayer,
}: Props) => {
  if (!team1 || !team2) return null;

  const c1 = getTeamColor(team1);
  const c2 = getTeamColor(team2);

  return (
    <div className="card card-full">
      <button className="collapsible-toggle" onClick={onToggle}>
        <span className="card-title" style={{ marginBottom: 0 }}>Key player impact</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="player-impact-body fade-in">
          <p className="conditions-hint" style={{ marginTop: "12px" }}>
            Toggle players off to simulate their absence and see probability change.
          </p>

          <div className="player-teams-grid">
            {/* Team 1 */}
            <div>
              <div className="player-team-header" style={{ borderColor: c1, color: c1 }}>
                <span className="team-dot" style={{ background: c1 }} />
                {team1.split(" ").slice(-2).join(" ")}
              </div>
              {team1Players.map(p => (
                <PlayerRow key={p.name} player={p} teamColor={c1}
                  onToggle={() => onTogglePlayer(1, p.name)} />
              ))}
            </div>

            {/* Team 2 */}
            <div>
              <div className="player-team-header" style={{ borderColor: c2, color: c2 }}>
                <span className="team-dot" style={{ background: c2 }} />
                {team2.split(" ").slice(-2).join(" ")}
              </div>
              {team2Players.map(p => (
                <PlayerRow key={p.name} player={p} teamColor={c2}
                  onToggle={() => onTogglePlayer(2, p.name)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerImpact;
