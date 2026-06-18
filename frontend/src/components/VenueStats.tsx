// src/components/VenueStats.tsx
import type { VenueStatsData } from "../types";
import { VENUE_STATS } from "../mockData";

interface Props { venue: string; }

interface MetricProps { label: string; value: string; icon: string; sub?: string; }

const Metric = ({ label, value, icon, sub }: MetricProps) => (
  <div className="venue-metric-card">
    <span className="venue-metric-icon">{icon}</span>
    <span className="venue-metric-value">{value}</span>
    <span className="venue-metric-label">{label}</span>
    {sub && <span className="venue-metric-sub">{sub}</span>}
  </div>
);

const VenueStats = ({ venue }: Props) => {
  if (!venue) return null;

  const stats: VenueStatsData | undefined = VENUE_STATS[venue];
  const fallback: VenueStatsData = {
    avg_first_innings: 165, chasing_win_pct: 49,
    best_team: "—", total_matches: 40,
  };
  const s = stats ?? fallback;

  return (
    <div className="card card-full venue-stats-card fade-in">
      <p className="card-title">Venue stats</p>
      <div className="venue-stats-grid">
        <Metric icon="🏏" label="Avg 1st innings" value={`${s.avg_first_innings}`} sub="runs" />
        <Metric icon="🏃" label="Chasing win %" value={`${s.chasing_win_pct}%`} sub="batting 2nd" />
        <Metric icon="🏆" label="Best team here" value={s.best_team.split(" ").slice(-2).join(" ")} />
        <Metric icon="📅" label="Total matches" value={`${s.total_matches}`} sub="all seasons" />
      </div>
    </div>
  );
};

export default VenueStats;
