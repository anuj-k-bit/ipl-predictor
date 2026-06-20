"""
app.py — Flask REST API for the IPL Win Predictor
Run: python app.py
Endpoints:
  GET  /api/teams   → list of teams & venues
  POST /api/predict → win probability prediction
  GET  /api/h2h     → head-to-head historical stats
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os, logging

# ── Setup ──────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

BASE_DIR  = os.path.dirname(__file__)
MODEL_PKL = os.path.join(BASE_DIR, "model.pkl")

# ── Try loading real model; fall back to mock ──────────────────────────────────
use_mock = True
model_data = None

try:
    import joblib
    if os.path.exists(MODEL_PKL):
        model_data = joblib.load(MODEL_PKL)
        use_mock   = False
        logging.info("✅ Loaded real model from model.pkl")
    else:
        logging.warning("⚠️  model.pkl not found — using mock predictor")
except Exception as e:
    logging.warning(f"⚠️  Could not load model.pkl ({e}) — using mock predictor")

from mock_model import (
    mock_predict, mock_h2h,
    ALL_TEAMS as MOCK_TEAMS,
    ALL_VENUES as MOCK_VENUES,
)

# ── Helper: real model predict ─────────────────────────────────────────────────
def real_predict(team1, team2, venue, toss_winner, toss_decision):
    import numpy as np
    m          = model_data["model"]
    le_team    = model_data["le_team"]
    le_venue   = model_data["le_venue"]
    le_toss    = model_data["le_toss"]

    known_teams  = list(le_team.classes_)
    known_venues = list(le_venue.classes_)

    # Validate inputs
    for t in [team1, team2, toss_winner]:
        if t not in known_teams:
            raise ValueError(f"Unknown team: {t}")
    if venue not in known_venues:
        raise ValueError(f"Unknown venue: {venue}")
    if toss_decision not in ["bat", "field"]:
        raise ValueError("toss_decision must be 'bat' or 'field'")

    toss_bat = 1 if toss_decision == "bat" else 0
    team1_won_toss = 1 if toss_winner == team1 else 0

    x = np.array([[
        le_team.transform([team1])[0],
        le_team.transform([team2])[0],
        le_venue.transform([venue])[0],
        le_team.transform([toss_winner])[0],
        le_toss.transform([toss_decision])[0],
        toss_bat,
        team1_won_toss,
    ]])

    proba = m.predict_proba(x)[0]
    # Class 1 corresponds to team1 winning, Class 0 to team2 winning
    p1 = round(proba[1] * 100, 1)
    p2 = round(100.0 - p1, 1)

    return {
        "team1": team1, "team2": team2,
        "team1_win_prob": p1, "team2_win_prob": p2,
        "predicted_winner": team1 if p1 > p2 else team2,
    }


def real_h2h(team1, team2):
    """Compute head-to-head from matches.csv if available."""
    try:
        import pandas as pd
        csv = os.path.join(BASE_DIR, "matches.csv")
        if not os.path.exists(csv):
            raise FileNotFoundError
        df = pd.read_csv(csv)
        mask = (
            ((df["team1"] == team1) & (df["team2"] == team2)) |
            ((df["team1"] == team2) & (df["team2"] == team1))
        )
        h2h = df[mask].dropna(subset=["winner"])
        t1_wins = int((h2h["winner"] == team1).sum())
        t2_wins = int((h2h["winner"] == team2).sum())
        total   = t1_wins + t2_wins
        return {
            "team1": team1, "team2": team2,
            "team1_wins": t1_wins, "team2_wins": t2_wins,
            "total_matches": total,
        }
    except Exception:
        return mock_h2h(team1, team2)


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/api/teams", methods=["GET"])
def get_teams():
    """Return all IPL teams and venues."""
    if use_mock:
        teams  = MOCK_TEAMS
        venues = MOCK_VENUES
    else:
        teams  = sorted(model_data["teams"])
        venues = sorted(model_data["venues"])

    return jsonify({"teams": teams, "venues": venues})


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    POST body (JSON):
      { team1, team2, venue, toss_winner, toss_decision }
    Returns:
      { team1, team2, team1_win_prob, team2_win_prob, predicted_winner }
    """
    data = request.get_json(force=True)
    required = ["team1", "team2", "venue", "toss_winner", "toss_decision"]
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    team1         = data["team1"]
    team2         = data["team2"]
    venue         = data["venue"]
    toss_winner   = data["toss_winner"]
    toss_decision = data["toss_decision"]

    if team1 == team2:
        return jsonify({"error": "Team 1 and Team 2 cannot be the same"}), 400

    try:
        if use_mock:
            result = mock_predict(team1, team2, venue, toss_winner, toss_decision)
        else:
            result = real_predict(team1, team2, venue, toss_winner, toss_decision)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logging.error(f"Prediction error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/api/h2h", methods=["GET"])
def head_to_head():
    """
    GET /api/h2h?team1=...&team2=...
    Returns: { team1, team2, team1_wins, team2_wins, total_matches }
    """
    team1 = request.args.get("team1", "")
    team2 = request.args.get("team2", "")
    if not team1 or not team2:
        return jsonify({"error": "team1 and team2 query params required"}), 400
    if team1 == team2:
        return jsonify({"error": "Teams must be different"}), 400

    try:
        if use_mock:
            result = mock_h2h(team1, team2)
        else:
            result = real_h2h(team1, team2)
        return jsonify(result)
    except Exception as e:
        logging.error(f"H2H error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "mode": "mock" if use_mock else "real"})


@app.route("/api/backtest", methods=["GET"])
def get_backtest_results():
    import pandas as pd
    csv_path = os.path.join(BASE_DIR, "backtest_results.csv")
    if not os.path.exists(csv_path):
        return jsonify({
            "status": "no_data",
            "message": "Backtest results not generated yet. Please run: python backend/backtest.py"
        })

    try:
        df = pd.read_csv(csv_path)
        total_matches = len(df)
        if total_matches == 0:
            return jsonify({
                "status": "no_data",
                "message": "Backtest results file is empty."
            })

        correct_count = int(df["correct"].sum())
        overall_accuracy = round((correct_count / total_matches) * 100, 1)

        # High confidence >= 60%
        high_df = df[df["confidence_pct"] >= 60.0]
        high_count = len(high_df)
        high_correct = int(high_df["correct"].sum()) if high_count > 0 else 0
        high_accuracy = round((high_correct / high_count) * 100, 1) if high_count > 0 else 0.0

        # Low confidence < 60%
        low_df = df[df["confidence_pct"] < 60.0]
        low_count = len(low_df)
        low_correct = int(low_df["correct"].sum()) if low_count > 0 else 0
        low_accuracy = round((low_correct / low_count) * 100, 1) if low_count > 0 else 0.0

        # Generate chart data (50-match rolling accuracy)
        correct_signals = df["correct"].tolist()
        chart_data = []
        for i in range(len(correct_signals)):
            window = correct_signals[max(0, i-49): i+1]
            chart_data.append({
                "match_no": i + 1,
                "accuracy": round((sum(window) / len(window)) * 100, 1)
            })

        # Downsample chart_data slightly to make rendering super fast in recharts (every 3rd point)
        downsampled_chart = chart_data[::3]
        if chart_data and (chart_data[-1] not in downsampled_chart):
            downsampled_chart.append(chart_data[-1])

        return jsonify({
            "status": "success",
            "total_matches": total_matches,
            "correct_predictions": correct_count,
            "overall_accuracy": overall_accuracy,
            "high_confidence_accuracy": high_accuracy,
            "low_confidence_accuracy": low_accuracy,
            "high_confidence_count": high_count,
            "low_confidence_count": low_count,
            "chart_data": downsampled_chart
        })
    except Exception as e:
        logging.error(f"Error reading backtest results: {e}")
        return jsonify({"error": f"Failed to read backtest results: {e}", "status": "error"}), 500


@app.route("/api/backtest/chart", methods=["GET"])
def get_backtest_chart():
    chart_path = os.path.join(BASE_DIR, "backtest_accuracy_trend.png")
    if not os.path.exists(chart_path):
        return "Chart not found", 404
    from flask import send_file
    return send_file(chart_path, mimetype="image/png")


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
