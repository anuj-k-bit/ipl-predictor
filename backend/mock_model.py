"""
mock_model.py — Mock IPL predictor used when model.pkl is absent.
Returns realistic-looking win probabilities based on heuristics so
the full UI can be tested without real training data.
"""

import random
from typing import Dict, Any

# IPL teams strength bias (higher = stronger historically)
TEAM_STRENGTH: Dict[str, float] = {
    "Mumbai Indians":          0.62,
    "Chennai Super Kings":     0.60,
    "Kolkata Knight Riders":   0.52,
    "Royal Challengers Bangalore": 0.50,
    "Sunrisers Hyderabad":     0.50,
    "Delhi Capitals":          0.48,
    "Rajasthan Royals":        0.48,
    "Punjab Kings":            0.45,
    "Lucknow Super Giants":    0.50,
    "Gujarat Titans":          0.53,
}

# Historical head-to-head wins (team1 vs team2)
H2H_DATA: Dict[str, Dict[str, int]] = {
    "Mumbai Indians": {
        "Chennai Super Kings": 20, "Kolkata Knight Riders": 22,
        "Royal Challengers Bangalore": 19, "Sunrisers Hyderabad": 14,
        "Delhi Capitals": 17, "Rajasthan Royals": 16,
        "Punjab Kings": 18, "Lucknow Super Giants": 4,
        "Gujarat Titans": 3,
    },
    "Chennai Super Kings": {
        "Mumbai Indians": 18, "Kolkata Knight Riders": 16,
        "Royal Challengers Bangalore": 21, "Sunrisers Hyderabad": 12,
        "Delhi Capitals": 15, "Rajasthan Royals": 14,
        "Punjab Kings": 17, "Lucknow Super Giants": 3,
        "Gujarat Titans": 3,
    },
    "Kolkata Knight Riders": {
        "Mumbai Indians": 14, "Chennai Super Kings": 15,
        "Royal Challengers Bangalore": 17, "Sunrisers Hyderabad": 13,
        "Delhi Capitals": 14, "Rajasthan Royals": 13,
        "Punjab Kings": 15, "Lucknow Super Giants": 3,
        "Gujarat Titans": 3,
    },
    "Royal Challengers Bangalore": {
        "Mumbai Indians": 12, "Chennai Super Kings": 10,
        "Kolkata Knight Riders": 11, "Sunrisers Hyderabad": 11,
        "Delhi Capitals": 14, "Rajasthan Royals": 13,
        "Punjab Kings": 16, "Lucknow Super Giants": 3,
        "Gujarat Titans": 2,
    },
    "Sunrisers Hyderabad": {
        "Mumbai Indians": 10, "Chennai Super Kings": 11,
        "Kolkata Knight Riders": 10, "Royal Challengers Bangalore": 12,
        "Delhi Capitals": 11, "Rajasthan Royals": 10,
        "Punjab Kings": 12, "Lucknow Super Giants": 2,
        "Gujarat Titans": 2,
    },
    "Delhi Capitals": {
        "Mumbai Indians": 9, "Chennai Super Kings": 10,
        "Kolkata Knight Riders": 10, "Royal Challengers Bangalore": 10,
        "Sunrisers Hyderabad": 11, "Rajasthan Royals": 11,
        "Punjab Kings": 13, "Lucknow Super Giants": 3,
        "Gujarat Titans": 2,
    },
    "Rajasthan Royals": {
        "Mumbai Indians": 10, "Chennai Super Kings": 11,
        "Kolkata Knight Riders": 11, "Royal Challengers Bangalore": 11,
        "Sunrisers Hyderabad": 12, "Delhi Capitals": 10,
        "Punjab Kings": 14, "Lucknow Super Giants": 3,
        "Gujarat Titans": 3,
    },
    "Punjab Kings": {
        "Mumbai Indians": 8, "Chennai Super Kings": 9,
        "Kolkata Knight Riders": 10, "Royal Challengers Bangalore": 9,
        "Sunrisers Hyderabad": 10, "Delhi Capitals": 9,
        "Rajasthan Royals": 8, "Lucknow Super Giants": 2,
        "Gujarat Titans": 2,
    },
    "Lucknow Super Giants": {
        "Mumbai Indians": 3, "Chennai Super Kings": 4,
        "Kolkata Knight Riders": 3, "Royal Challengers Bangalore": 3,
        "Sunrisers Hyderabad": 4, "Delhi Capitals": 3,
        "Rajasthan Royals": 3, "Punjab Kings": 4,
        "Gujarat Titans": 3,
    },
    "Gujarat Titans": {
        "Mumbai Indians": 4, "Chennai Super Kings": 4,
        "Kolkata Knight Riders": 3, "Royal Challengers Bangalore": 4,
        "Sunrisers Hyderabad": 4, "Delhi Capitals": 4,
        "Rajasthan Royals": 3, "Punjab Kings": 4,
        "Lucknow Super Giants": 2,
    },
}

ALL_TEAMS = sorted(TEAM_STRENGTH.keys())

ALL_VENUES = [
    "Wankhede Stadium, Mumbai",
    "M. A. Chidambaram Stadium, Chennai",
    "Eden Gardens, Kolkata",
    "M. Chinnaswamy Stadium, Bangalore",
    "Rajiv Gandhi International Cricket Stadium, Hyderabad",
    "Arun Jaitley Stadium, Delhi",
    "Sawai Mansingh Stadium, Jaipur",
    "Punjab Cricket Association Stadium, Mohali",
    "Narendra Modi Stadium, Ahmedabad",
    "BRSABV Ekana Cricket Stadium, Lucknow",
    "Dr. Y.S. Rajasekhara Reddy Cricket Stadium, Vishakhapatnam",
    "Brabourne Stadium, Mumbai",
    "DY Patil Stadium, Mumbai",
]


def mock_predict(team1: str, team2: str, venue: str,
                 toss_winner: str, toss_decision: str) -> Dict[str, Any]:
    """Return mock win probability for team1 vs team2."""
    s1 = TEAM_STRENGTH.get(team1, 0.50)
    s2 = TEAM_STRENGTH.get(team2, 0.50)

    # Toss advantage
    if toss_winner == team1 and toss_decision == "bat":
        s1 += 0.03
    elif toss_winner == team1 and toss_decision == "field":
        s1 += 0.02
    elif toss_winner == team2 and toss_decision == "bat":
        s2 += 0.03
    elif toss_winner == team2 and toss_decision == "field":
        s2 += 0.02

    # Small random noise ±5 %
    noise = random.uniform(-0.05, 0.05)
    s1 += noise

    total = s1 + s2
    p1 = round((s1 / total) * 100, 1)
    p2 = round(100.0 - p1, 1)

    return {
        "team1": team1,
        "team2": team2,
        "team1_win_prob": p1,
        "team2_win_prob": p2,
        "predicted_winner": team1 if p1 > p2 else team2,
    }


def mock_h2h(team1: str, team2: str) -> Dict[str, Any]:
    """Return mock head-to-head wins."""
    t1_wins = H2H_DATA.get(team1, {}).get(team2, 5)
    t2_wins = H2H_DATA.get(team2, {}).get(team1, 5)
    total   = t1_wins + t2_wins
    return {
        "team1": team1,
        "team2": team2,
        "team1_wins": t1_wins,
        "team2_wins": t2_wins,
        "total_matches": total,
    }
