// src/components/HeadToHead.tsx — BUG FIX: Use white text for win numbers (KKR #3A225D was invisible)
// ADDED: Season-wise H2H chart below win count cards
import type { H2HResponse } from "../types";
import { getTeamColor } from "../teamColors";
import { getSeasonH2H } from "../mockData";
import SeasonH2HChart from "./SeasonH2HChart";

interface Props { data: H2HResponse | null; }

const HeadToHead = ({ data }: Props) => (
  <div className="card card-full">
    <p className="card-title">Head-to-head history</p>

    {!data ? (
      <div className="h2h-empty">
        <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>⚔️</div>
        <p>Select two teams to see their head-to-head record</p>
      </div>
    ) : (
      <div className="fade-in">
        {/* ── Win count cards ── */}
        <div className="h2h-grid">
          {/* Team 1 */}
          <div className="h2h-win-card"
            style={{ borderLeft: `3px solid ${getTeamColor(data.team1)}` }}>
            {/* FIX: text is always white — team color only as left border accent */}
            <span className="h2h-win-number">{data.team1_wins}</span>
            <span className="h2h-win-label">wins</span>
            <span className="h2h-team-name">{data.team1}</span>
          </div>

          {/* Centre */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div className="h2h-matches-pill">{data.total_matches} matches</div>
            <div className="h2h-vs">VS</div>
          </div>

          {/* Team 2 */}
          <div className="h2h-win-card"
            style={{ borderLeft: `3px solid ${getTeamColor(data.team2)}` }}>
            <span className="h2h-win-number">{data.team2_wins}</span>
            <span className="h2h-win-label">wins</span>
            <span className="h2h-team-name">{data.team2}</span>
          </div>
        </div>

        {/* ── Win ratio bar ── */}
        {data.total_matches > 0 && (
          <>
            <div className="h2h-bar-track" style={{ marginTop: "20px" }}>
              <div className="h2h-bar-fill"
                style={{
                  width: `${(data.team1_wins / data.total_matches) * 100}%`,
                  background: getTeamColor(data.team1),
                }}
              />
              <div className="h2h-bar-fill"
                style={{
                  width: `${(data.team2_wins / data.total_matches) * 100}%`,
                  background: getTeamColor(data.team2),
                }}
              />
            </div>
            <div className="h2h-legend">
              <span style={{ color: getTeamColor(data.team1) }}>
                ■ {data.team1.split(" ").pop()} ({Math.round((data.team1_wins / data.total_matches) * 100)}%)
              </span>
              <span style={{ color: getTeamColor(data.team2) }}>
                ■ {data.team2.split(" ").pop()} ({Math.round((data.team2_wins / data.total_matches) * 100)}%)
              </span>
            </div>
          </>
        )}

        {/* ── Season-wise chart ── */}
        <SeasonH2HChart
          team1={data.team1}
          team2={data.team2}
          data={getSeasonH2H(data.team1, data.team2)}
        />
      </div>
    )}
  </div>
);

export default HeadToHead;
