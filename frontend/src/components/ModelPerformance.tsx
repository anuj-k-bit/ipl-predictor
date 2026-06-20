// src/components/ModelPerformance.tsx
import { useState, useEffect } from "react";
import { fetchBacktest } from "../api/iplApi";
import type { BacktestResponse } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface Props {
  open: boolean;
  onToggle: () => void;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-bright)",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "13px",
      boxShadow: "var(--shadow)",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
        Match #{data.match_no}
      </p>
      <p style={{ color: "#60a5fa", margin: 0, fontWeight: 600 }}>
        Rolling Accuracy: {data.accuracy}%
      </p>
    </div>
  );
};

const ModelPerformance = ({ open, onToggle }: Props) => {
  const [data, setData] = useState<BacktestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !data) {
      setLoading(true);
      setError(null);
      fetchBacktest()
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Backtest load error:", err);
          setError("Failed to fetch model performance stats.");
          setLoading(false);
        });
    }
  }, [open, data]);

  return (
    <div className="card card-full" style={{ marginTop: "20px" }}>
      <button className="collapsible-toggle" onClick={onToggle}>
        <span className="card-title" style={{ marginBottom: 0 }}>
          📊 Model Performance — Backtested on 800+ historical matches
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="fade-in" style={{ marginTop: "20px" }}>
          {loading && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
              <div className="spinner" style={{ margin: "0 auto 12px", width: "32px", height: "32px" }} />
              <p style={{ fontSize: "14px" }}>Loading performance data…</p>
            </div>
          )}

          {error && (
            <div style={{ color: "var(--red)", fontSize: "14px", textAlign: "center", padding: "10px" }}>
              ⚠️ {error}
            </div>
          )}

          {data && data.status === "no_data" && (
            <div style={{
              background: "rgba(246, 201, 14, 0.08)",
              border: "1px solid rgba(246, 201, 14, 0.25)",
              borderRadius: "10px",
              padding: "16px",
              fontSize: "14px",
              color: "var(--gold)",
              lineHeight: "1.5",
              textAlign: "center"
            }}>
              <p style={{ fontWeight: 600, marginBottom: "4px" }}>📋 Backtest Log Not Found</p>
              <p>Run the backtesting script in your backend terminal to generate this data:</p>
              <code style={{
                display: "block",
                background: "var(--bg-secondary)",
                padding: "8px",
                borderRadius: "6px",
                marginTop: "8px",
                fontFamily: "monospace",
                color: "var(--text-primary)",
                border: "1px solid var(--border)"
              }}>
                python backend/backtest.py
              </code>
            </div>
          )}

          {data && data.status === "success" && (
            <div>
              {/* Stat Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "24px"
              }}>
                <div className="venue-metric-card">
                  <span className="venue-metric-value" style={{ color: "var(--blue-bright)" }}>
                    {data.overall_accuracy}%
                  </span>
                  <span className="venue-metric-label">Overall Accuracy</span>
                  <span className="venue-metric-sub">
                    {data.correct_predictions} / {data.total_matches} matches
                  </span>
                </div>

                <div className="venue-metric-card">
                  <span className="venue-metric-value" style={{ color: "var(--green)" }}>
                    {data.high_confidence_accuracy}%
                  </span>
                  <span className="venue-metric-label">High Confidence (≥60%)</span>
                  <span className="venue-metric-sub">
                    {data.high_confidence_count} matches evaluated
                  </span>
                </div>

                <div className="venue-metric-card">
                  <span className="venue-metric-value" style={{ color: "var(--text-muted)" }}>
                    {data.low_confidence_accuracy}%
                  </span>
                  <span className="venue-metric-label">Low Confidence (&lt;60%)</span>
                  <span className="venue-metric-sub">
                    {data.low_confidence_count} matches evaluated
                  </span>
                </div>
              </div>

              {/* Interactive Rolling Accuracy Chart */}
              <div style={{ marginTop: "16px" }}>
                <p className="card-title" style={{ marginBottom: "12px", textTransform: "none", fontSize: "12px", color: "var(--text-secondary)" }}>
                  50-Match Rolling Accuracy Trend vs Baselines
                </p>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.chart_data}
                      margin={{ top: 10, right: 10, left: -22, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.07)" vertical={false} />
                      <XAxis
                        dataKey="match_no"
                        tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "Outfit" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[30, 100]}
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* 50% Random guessing baseline */}
                      <ReferenceLine
                        y={50}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{
                          value: "50% Baseline (Random)",
                          fill: "#ef4444",
                          fontSize: 9,
                          position: "insideBottomLeft",
                          offset: 5
                        }}
                      />

                      {/* Overall accuracy baseline */}
                      <ReferenceLine
                        y={data.overall_accuracy}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        label={{
                          value: `Overall: ${data.overall_accuracy}%`,
                          fill: "#10b981",
                          fontSize: 9,
                          position: "insideTopLeft",
                          offset: 5
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                        name="Rolling Accuracy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "8px",
                  lineHeight: "1.4"
                }}>
                  💡 *The rolling accuracy line shows model prediction correctness over the preceding 50 matches chronologically. Accuracy climbs in high confidence scenarios, showing that the model is self-aware of when it can make a more reliable prediction.*
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelPerformance;
