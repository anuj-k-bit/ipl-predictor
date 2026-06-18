"""
generate_dataset.py — Generates a realistic IPL matches.csv (2008–2024)
based on historical H2H win records and team strengths.
Run once: python generate_dataset.py
"""

import pandas as pd
import numpy as np
import random
import os

random.seed(42)
np.random.seed(42)

# ── Team strengths (historical win rate) ──────────────────────────────────────
TEAM_STRENGTH = {
    "Mumbai Indians":               0.62,
    "Chennai Super Kings":          0.60,
    "Kolkata Knight Riders":        0.52,
    "Royal Challengers Bangalore":  0.50,
    "Sunrisers Hyderabad":          0.50,
    "Delhi Capitals":               0.48,
    "Rajasthan Royals":             0.48,
    "Punjab Kings":                 0.45,
    "Lucknow Super Giants":         0.50,
    "Gujarat Titans":               0.53,
    "Deccan Chargers":              0.46,
    "Pune Warriors":                0.38,
    "Kochi Tuskers Kerala":         0.40,
    "Rising Pune Supergiant":       0.46,
}

# Teams active per season
SEASON_TEAMS = {
    2008: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Deccan Chargers"],
    2009: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Deccan Chargers"],
    2010: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Deccan Chargers"],
    2011: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Deccan Chargers","Kochi Tuskers Kerala","Pune Warriors"],
    2012: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Pune Warriors","Deccan Chargers"],
    2013: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Pune Warriors"],
    2014: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings"],
    2015: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings"],
    2016: ["Mumbai Indians","Kolkata Knight Riders","Royal Challengers Bangalore",
           "Sunrisers Hyderabad","Delhi Capitals","Rajasthan Royals",
           "Punjab Kings","Rising Pune Supergiant","Gujarat Titans"],
    2017: ["Mumbai Indians","Kolkata Knight Riders","Royal Challengers Bangalore",
           "Sunrisers Hyderabad","Delhi Capitals","Rajasthan Royals",
           "Punjab Kings","Rising Pune Supergiant"],
    2018: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings"],
    2019: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings"],
    2020: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings"],
    2021: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings"],
    2022: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Lucknow Super Giants","Gujarat Titans"],
    2023: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Lucknow Super Giants","Gujarat Titans"],
    2024: ["Mumbai Indians","Chennai Super Kings","Kolkata Knight Riders",
           "Royal Challengers Bangalore","Sunrisers Hyderabad","Delhi Capitals",
           "Rajasthan Royals","Punjab Kings","Lucknow Super Giants","Gujarat Titans"],
}

VENUES = [
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
    "Brabourne Stadium, Mumbai",
    "DY Patil Stadium, Mumbai",
    "Dr. Y.S. Rajasekhara Reddy Cricket Stadium, Vishakhapatnam",
    "Himachal Pradesh Cricket Association Stadium, Dharamsala",
    "Subrata Roy Sahara Stadium, Pune",
    "Sharjah Cricket Stadium",
    "Dubai International Cricket Stadium",
    "Sheikh Zayed Stadium, Abu Dhabi",
]

# Home venue advantage
HOME_VENUE = {
    "Mumbai Indians":               "Wankhede Stadium, Mumbai",
    "Chennai Super Kings":          "M. A. Chidambaram Stadium, Chennai",
    "Kolkata Knight Riders":        "Eden Gardens, Kolkata",
    "Royal Challengers Bangalore":  "M. Chinnaswamy Stadium, Bangalore",
    "Sunrisers Hyderabad":          "Rajiv Gandhi International Cricket Stadium, Hyderabad",
    "Delhi Capitals":               "Arun Jaitley Stadium, Delhi",
    "Rajasthan Royals":             "Sawai Mansingh Stadium, Jaipur",
    "Punjab Kings":                 "Punjab Cricket Association Stadium, Mohali",
    "Gujarat Titans":               "Narendra Modi Stadium, Ahmedabad",
    "Lucknow Super Giants":         "BRSABV Ekana Cricket Stadium, Lucknow",
}

def pick_winner(team1, team2, toss_winner, toss_decision, venue):
    s1 = TEAM_STRENGTH.get(team1, 0.48)
    s2 = TEAM_STRENGTH.get(team2, 0.48)

    # Toss effect
    if toss_winner == team1:
        s1 += 0.03 if toss_decision == "bat" else 0.02
    else:
        s2 += 0.03 if toss_decision == "bat" else 0.02

    # Home advantage
    if HOME_VENUE.get(team1) == venue:
        s1 += 0.04
    elif HOME_VENUE.get(team2) == venue:
        s2 += 0.04

    # Small noise
    s1 += random.uniform(-0.06, 0.06)
    p1 = s1 / (s1 + s2)
    return team1 if random.random() < p1 else team2

rows = []
match_id = 1

for season, teams in SEASON_TEAMS.items():
    # Round-robin: each pair plays twice per season
    pairs = [(t1, t2) for i, t1 in enumerate(teams) for t2 in teams[i+1:]]
    matches_this_season = []

    for team1, team2 in pairs:
        for game in range(2):
            # Alternate which team is listed first
            if game == 1:
                team1, team2 = team2, team1

            # Pick venue
            if season == 2020:  # UAE bubble
                venue = random.choice(["Sharjah Cricket Stadium",
                                       "Dubai International Cricket Stadium",
                                       "Sheikh Zayed Stadium, Abu Dhabi"])
            else:
                home1 = HOME_VENUE.get(team1)
                home2 = HOME_VENUE.get(team2)
                venue_pool = [v for v in [home1, home2] if v] + [random.choice(VENUES)]
                venue = random.choice(venue_pool)

            toss_winner  = random.choice([team1, team2])
            toss_decision = random.choice(["bat", "field"])
            winner = pick_winner(team1, team2, toss_winner, toss_decision, venue)

            matches_this_season.append({
                "id":            match_id,
                "season":        season,
                "venue":         venue,
                "team1":         team1,
                "team2":         team2,
                "toss_winner":   toss_winner,
                "toss_decision": toss_decision,
                "winner":        winner,
                "result":        "normal",
            })
            match_id += 1

    rows.extend(matches_this_season)

df = pd.DataFrame(rows)
out = os.path.join(os.path.dirname(__file__), "matches.csv")
df.to_csv(out, index=False)
print(f"[OK] Generated matches.csv -- {len(df)} matches across {len(SEASON_TEAMS)} seasons")
print(f"   Teams: {df['team1'].nunique() + df['team2'].nunique()} unique entries")
print(f"   Seasons: {df['season'].min()} -- {df['season'].max()}")
print(df["winner"].value_counts().head(5).to_string())
