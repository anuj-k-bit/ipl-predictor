// src/components/SeasonH2HChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { SeasonWins } from "../types";
import { getTeamColor } from "../teamColors";

interface Props { team1: string; team2: string; data: SeasonWins[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-bright)",
      borderRadius: "10px", padding: "10px 14px", fontSize: "0.82rem",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
        IPL {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill, marginBottom: 2 }}>
          {p.name}: {p.value} win{p.value !== 1 ? "s" : ""}
        </p>
      ))}
    </div>
  );
};

const SeasonH2HChart = ({ team1, team2, data }: Props) => {
  const c1 = getTeamColor(team1);
  const c2 = getTeamColor(team2);
  const t1Short = team1.split(" ").pop() || team1;
  const t2Short = team2.split(" ").pop() || team2;

  const chartData = data.map(d => ({
    season: d.season,
    [t1Short]: d.t1,
    [t2Short]: d.t2,
  }));

  return (
    <div style={{ marginTop: "24px" }}>
      <p className="card-title" style={{ marginBottom: "12px" }}>Season-by-season wins</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
          barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.07)" vertical={false} />
          <XAxis dataKey="season"
            tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "Outfit" }}
            axisLine={false} tickLine={false}
            tickFormatter={v => String(v).slice(2)}
          />
          <YAxis allowDecimals={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />}
            cursor={{ fill: "rgba(99,179,237,0.05)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-secondary)", paddingTop: 8 }}
          />
          <Bar dataKey={t1Short} fill={c1} radius={[4, 4, 0, 0]} maxBarSize={14} />
          <Bar dataKey={t2Short} fill={c2} radius={[4, 4, 0, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeasonH2HChart;
