// src/components/PointsTable.tsx
import { POINTS_TABLE } from "../mockData";
import { getTeamColor } from "../teamColors";

interface Props { open: boolean; onToggle: () => void; }

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const PointsTable = ({ open, onToggle }: Props) => (
  <div className="card card-full" style={{ marginTop: "20px" }}>
    <button className="collapsible-toggle" onClick={onToggle}>
      <span className="card-title" style={{ marginBottom: 0 }}>2024 Points table</span>
      <ChevronIcon open={open} />
    </button>

    {open && (
      <div className="fade-in" style={{ marginTop: "16px", overflowX: "auto" }}>
        <table className="pts-table">
          <thead>
            <tr>
              <th>#</th>
              <th style={{ textAlign: "left" }}>Team</th>
              <th>P</th><th>W</th><th>L</th><th>NR</th><th>NRR</th><th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {POINTS_TABLE.map((row, i) => {
              const isPlayoff = i < 4;
              const color = getTeamColor(row.team);
              return (
                <tr key={row.team} className={isPlayoff ? "playoff-row" : ""}>
                  <td className="pts-rank">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      {isPlayoff ? (
                        <>
                          <span className="playoff-badge">{i + 1}</span>
                          <span className="q-badge" title="Qualified for Playoffs">Q</span>
                        </>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="team-dot" style={{ background: color }} />
                      <span style={{ fontSize: "0.85rem" }}>{row.team}</span>
                    </div>
                  </td>
                  <td>{row.played}</td>
                  <td style={{ color: "var(--green)", fontWeight: 600 }}>{row.won}</td>
                  <td style={{ color: "var(--red)" }}>{row.lost}</td>
                  <td>{row.nr}</td>
                  <td style={{ color: row.nrr >= 0 ? "var(--green)" : "var(--red)" }}>
                    {row.nrr >= 0 ? "+" : ""}{row.nrr.toFixed(3)}
                  </td>
                  <td style={{ fontFamily: "Outfit", fontWeight: 700, color: isPlayoff ? "#f6c90e" : "var(--text-primary)" }}>
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "10px" }}>
          🟢 Top 4 qualify for playoffs
        </p>
      </div>
    )}
  </div>
);

export default PointsTable;
