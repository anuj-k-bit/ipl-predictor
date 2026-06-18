// src/components/WinProbabilityChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { PredictResponse } from "../types";

interface Props {
  result: PredictResponse | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-bright)",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "0.85rem",
          color: "var(--text-primary)",
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{payload[0].payload.team}</p>
        <p style={{ color: "var(--gold)" }}>Win Probability: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const WinProbabilityChart = ({ result }: Props) => {
  if (!result) {
    return (
      <div className="card">
        <p className="card-title">Probability Chart</p>
        <div className="prob-empty">
          <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📊</div>
          <p>Chart will appear after prediction</p>
        </div>
      </div>
    );
  }

  const data = [
    {
      team: result.team1.split(" ").slice(-2).join(" "),
      fullName: result.team1,
      probability: result.team1_win_prob,
    },
    {
      team: result.team2.split(" ").slice(-2).join(" "),
      fullName: result.team2,
      probability: result.team2_win_prob,
    },
  ];

  const isT1Winner = result.team1_win_prob >= result.team2_win_prob;

  return (
    <div className="card fade-in">
      <p className="card-title">Probability Chart</p>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            barCategoryGap="35%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(99,179,237,0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="team"
              tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "Outfit" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,179,237,0.05)" }} />
            <Bar dataKey="probability" radius={[8, 8, 0, 0]} maxBarSize={80}>
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={
                    (index === 0 && isT1Winner) || (index === 1 && !isT1Winner)
                      ? "url(#goldGrad)"
                      : "url(#blueGrad)"
                  }
                />
              ))}
              <LabelList
                dataKey="probability"
                position="top"
                formatter={(v: any) => `${v}%`}
                style={{ fill: "#f0f6ff", fontSize: 13, fontWeight: 700, fontFamily: "Outfit" }}
              />
            </Bar>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f6c90e" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WinProbabilityChart;
