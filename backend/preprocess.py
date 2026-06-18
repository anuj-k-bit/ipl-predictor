"""
preprocess.py — Extracts match-level data from IPL ball-by-ball CSV
Then retrains the ML model using the real dataset.
Run: python preprocess.py
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
import joblib
import os
import warnings
warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(__file__)

# ── Step 1: Load ball-by-ball CSV ─────────────────────────────────────────────
print("Loading IPL.csv (ball-by-ball)...")
df = pd.read_csv(os.path.join(BASE_DIR, "IPL.csv"), low_memory=False)
print(f"  {len(df):,} deliveries loaded")
print(f"  Columns: {list(df.columns)}\n")

# ── Step 2: Extract one row per match ─────────────────────────────────────────
# Each match_id appears many times — grab the first row per match (metadata is same)
matches = df.drop_duplicates(subset=["match_id"]).copy()

# Identify team1 (batting in innings 1) and team2 (bowling in innings 1)
inn1 = df[df["innings"] == 1].drop_duplicates(subset=["match_id"])[
    ["match_id", "batting_team", "bowling_team"]
].rename(columns={"batting_team": "team1", "bowling_team": "team2"})

matches = matches.merge(inn1, on="match_id", how="left")

# Use match_won_by as winner
matches = matches.rename(columns={"match_won_by": "winner"})

# Normalize team names (historical renames)
TEAM_MAP = {
    "Delhi Daredevils":          "Delhi Capitals",
    "Kings XI Punjab":           "Punjab Kings",
    "Rising Pune Supergiant":    "Rising Pune Supergiant",
    "Rising Pune Supergiants":   "Rising Pune Supergiant",
    "Royal Challengers Bengaluru": "Royal Challengers Bangalore",
    "Deccan Chargers":           "Deccan Chargers",
    "Pune Warriors":             "Pune Warriors",
    "Gujarat Lions":             "Gujarat Lions",
    "Kochi Tuskers Kerala":      "Kochi Tuskers Kerala",
}

for col in ["team1", "team2", "toss_winner", "winner"]:
    if col in matches.columns:
        matches[col] = matches[col].map(lambda x: TEAM_MAP.get(str(x).strip(), str(x).strip()) if pd.notna(x) else x)

# Normalize venue names
VENUE_MAP = {
    "M Chinnaswamy Stadium":                         "M. Chinnaswamy Stadium, Bangalore",
    "M. Chinnaswamy Stadium":                        "M. Chinnaswamy Stadium, Bangalore",
    "Wankhede Stadium":                              "Wankhede Stadium, Mumbai",
    "Feroz Shah Kotla":                              "Arun Jaitley Stadium, Delhi",
    "Arun Jaitley Stadium":                          "Arun Jaitley Stadium, Delhi",
    "Eden Gardens":                                  "Eden Gardens, Kolkata",
    "MA Chidambaram Stadium, Chepauk":               "M. A. Chidambaram Stadium, Chennai",
    "MA Chidambaram Stadium":                        "M. A. Chidambaram Stadium, Chennai",
    "M.A. Chidambaram Stadium":                      "M. A. Chidambaram Stadium, Chennai",
    "Rajiv Gandhi International Cricket Stadium":    "Rajiv Gandhi International Cricket Stadium, Hyderabad",
    "Rajiv Gandhi International Cricket Stadium, Uppal": "Rajiv Gandhi International Cricket Stadium, Hyderabad",
    "Punjab Cricket Association IS Bindra Stadium":  "Punjab Cricket Association Stadium, Mohali",
    "Punjab Cricket Association Stadium, Mohali":    "Punjab Cricket Association Stadium, Mohali",
    "Sawai Mansingh Stadium":                        "Sawai Mansingh Stadium, Jaipur",
    "Sardar Patel Stadium, Motera":                  "Narendra Modi Stadium, Ahmedabad",
    "Narendra Modi Stadium":                         "Narendra Modi Stadium, Ahmedabad",
    "BRSABV Ekana Cricket Stadium":                  "BRSABV Ekana Cricket Stadium, Lucknow",
    "Brabourne Stadium":                             "Brabourne Stadium, Mumbai",
    "DY Patil Stadium":                              "DY Patil Stadium, Mumbai",
    "Dr DY Patil Sports Academy":                    "DY Patil Stadium, Mumbai",
    "Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium": "Dr. Y.S. Rajasekhara Reddy Cricket Stadium, Vishakhapatnam",
}

if "venue" in matches.columns:
    matches["venue"] = matches["venue"].map(
        lambda x: VENUE_MAP.get(str(x).strip(), str(x).strip()) if pd.notna(x) else x
    )

# Clean toss_decision: normalize to bat/field
matches["toss_decision"] = matches["toss_decision"].str.lower().str.strip()
matches["toss_decision"] = matches["toss_decision"].map({
    "bat": "bat", "batting": "bat",
    "field": "field", "bowling": "field", "fielding": "field"
}).fillna("field")

# Use year as season
if "year" in matches.columns:
    matches["season"] = matches["year"]

# Keep only needed columns
keep = ["match_id", "season", "team1", "team2", "venue",
        "toss_winner", "toss_decision", "winner"]
matches = matches[[c for c in keep if c in matches.columns]]

# Drop rows with missing critical fields
matches = matches.dropna(subset=["team1", "team2", "winner", "toss_winner", "toss_decision"])
matches = matches[matches["winner"].str.strip() != ""]

# Remove non-team winners (e.g. "No result", "Tie")
valid_teams = set(matches["team1"].tolist() + matches["team2"].tolist())
matches = matches[matches["winner"].isin(valid_teams)]
matches = matches[matches["toss_winner"].isin(valid_teams)]

print(f"Extracted {len(matches)} matches from {matches['season'].nunique()} seasons")
print(f"Seasons: {sorted(matches['season'].dropna().unique().astype(int).tolist())}")
print(f"Teams ({matches['team1'].nunique()} unique):")
print("  " + ", ".join(sorted(matches["team1"].unique())))
print(f"\nTop venues:")
print(matches["venue"].value_counts().head(5).to_string())

# Save extracted matches
matches_path = os.path.join(BASE_DIR, "matches.csv")
matches.to_csv(matches_path, index=False)
print(f"\nSaved matches.csv ({len(matches)} rows)")

# ── Step 3: Feature engineering ───────────────────────────────────────────────
all_teams  = sorted(set(matches["team1"].tolist() + matches["team2"].tolist()))
all_venues = sorted(matches["venue"].dropna().unique().tolist())

le_team  = LabelEncoder().fit(all_teams)
le_venue = LabelEncoder().fit(all_venues)
le_toss  = LabelEncoder().fit(["bat", "field"])

# Fill missing venues with most common
matches["venue"] = matches["venue"].fillna(matches["venue"].mode()[0])

matches["team1_enc"]         = le_team.transform(matches["team1"])
matches["team2_enc"]         = le_team.transform(matches["team2"])
matches["venue_enc"]         = le_venue.transform(matches["venue"])
matches["toss_winner_enc"]   = le_team.transform(matches["toss_winner"])
matches["toss_decision_enc"] = le_toss.transform(matches["toss_decision"])
matches["toss_bat"]          = (matches["toss_decision"] == "bat").astype(int)
matches["team1_won_toss"]    = (matches["toss_winner"] == matches["team1"]).astype(int)
matches["target"]            = (matches["winner"] == matches["team1"]).astype(int)

feature_cols = [
    "team1_enc", "team2_enc", "venue_enc",
    "toss_winner_enc", "toss_decision_enc",
    "toss_bat", "team1_won_toss",
]

X = matches[feature_cols]
y = matches["target"]

print(f"\nClass balance: team1 wins {y.mean():.1%} | team2 wins {(1-y).mean():.1%}")

# ── Step 4: Train multiple models ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, C=1.0),
    "Random Forest":       RandomForestClassifier(n_estimators=300, max_depth=10,
                                                   min_samples_leaf=5, random_state=42, n_jobs=-1),
    "Gradient Boosting":   GradientBoostingClassifier(n_estimators=200, learning_rate=0.08,
                                                       max_depth=5, random_state=42),
}

print("\nTraining models on REAL IPL data...\n")
best_model, best_acc, best_name = None, 0, ""

for name, clf in models.items():
    clf.fit(X_train, y_train)
    train_acc = clf.score(X_train, y_train)
    test_acc  = clf.score(X_test,  y_test)
    cv        = cross_val_score(clf, X, y, cv=5, scoring="accuracy")
    print(f"  {name:<25} train={train_acc:.2%}  test={test_acc:.2%}  "
          f"cv={cv.mean():.2%} +/- {cv.std():.2%}")
    if test_acc > best_acc:
        best_acc, best_model, best_name = test_acc, clf, name

print(f"\nBest model: {best_name}  (test accuracy: {best_acc:.2%})")

if hasattr(best_model, "feature_importances_"):
    fi = sorted(zip(feature_cols, best_model.feature_importances_), key=lambda x: -x[1])
    print("\nFeature importances:")
    for feat, imp in fi:
        print(f"  {feat:<25} {imp:.4f}")

# ── Step 5: Save model ────────────────────────────────────────────────────────
save = {
    "model":        best_model,
    "model_name":   best_name,
    "accuracy":     round(best_acc, 4),
    "le_team":      le_team,
    "le_venue":     le_venue,
    "le_toss":      le_toss,
    "feature_cols": feature_cols,
    "teams":        sorted(all_teams),
    "venues":       sorted(all_venues),
}
out_path = os.path.join(BASE_DIR, "model.pkl")
joblib.dump(save, out_path)
print(f"\nmodel.pkl saved -> {out_path}")
print(f"Model: {best_name} | Accuracy: {best_acc:.2%}")
print("\nRestart Flask to activate real ML!")
