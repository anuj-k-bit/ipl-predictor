"""
train.py  Train IPL Win Predictor Model
Run: python train.py
Generates model.pkl which Flask auto-loads on next start.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
import joblib
import os
import warnings
warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(__file__)

#  Load dataset 
csv_path = os.path.join(BASE_DIR, "matches.csv")
if not os.path.exists(csv_path):
    print(" matches.csv not found. Run: python generate_dataset.py first")
    exit(1)

matches = pd.read_csv(csv_path)
print(f" Loaded matches.csv  {len(matches)} rows")

#  Normalise column names (handles different Kaggle CSV formats) 
matches.columns = [c.strip().lower().replace(" ", "_") for c in matches.columns]

# Map common alternate column names
rename_map = {
    "match_winner": "winner",
    "winning_team": "winner",
    "match_id":     "id",
    "toss_decision":"toss_decision",
}
matches.rename(columns=rename_map, inplace=True)

# Drop no-result matches
if "winner" in matches.columns:
    matches = matches.dropna(subset=["winner"])
    matches = matches[matches["winner"].str.strip() != ""]
else:
    print(" 'winner' column not found. Columns available:", list(matches.columns))
    exit(1)

required = ["team1", "team2", "venue", "toss_winner", "toss_decision", "winner"]
for col in required:
    if col not in matches.columns:
        print(f" Missing column: '{col}'. Found: {list(matches.columns)}")
        exit(1)

# Clean strings
for col in ["team1","team2","venue","toss_winner","toss_decision","winner"]:
    matches[col] = matches[col].str.strip()

# Normalise toss_decision to bat/field
matches["toss_decision"] = matches["toss_decision"].str.lower()
matches["toss_decision"] = matches["toss_decision"].map(
    {"bat":"bat","batting":"bat","field":"field","bowling":"field","fielding":"field"}
).fillna("field")

print(f" Clean rows: {len(matches)}")
print(f"   Seasons: {matches['season'].min() if 'season' in matches.columns else 'N/A'}  "
      f"{matches['season'].max() if 'season' in matches.columns else 'N/A'}")

#  Feature engineering 
all_teams  = sorted(set(matches["team1"].tolist() + matches["team2"].tolist()))
all_venues = sorted(matches["venue"].unique().tolist())

le_team  = LabelEncoder().fit(all_teams)
le_venue = LabelEncoder().fit(all_venues)
le_toss  = LabelEncoder().fit(["bat", "field"])

matches["team1_enc"]         = le_team.transform(matches["team1"])
matches["team2_enc"]         = le_team.transform(matches["team2"])
matches["venue_enc"]         = le_venue.transform(matches["venue"])
matches["toss_winner_enc"]   = le_team.transform(matches["toss_winner"])
matches["toss_decision_enc"] = le_toss.transform(matches["toss_decision"])

# Extra feature: did toss winner choose to bat?
matches["toss_bat"]          = (matches["toss_decision"] == "bat").astype(int)
# Is team1 the toss winner?
matches["team1_won_toss"]    = (matches["toss_winner"] == matches["team1"]).astype(int)

# Target: 1 if team1 wins, 0 if team2 wins
matches["target"] = (matches["winner"] == matches["team1"]).astype(int)

feature_cols = [
    "team1_enc", "team2_enc", "venue_enc",
    "toss_winner_enc", "toss_decision_enc",
    "toss_bat", "team1_won_toss",
]

X = matches[feature_cols]
y = matches["target"]

print(f"\n Class balance  team1 wins: {y.mean():.1%} | team2 wins: {(1-y).mean():.1%}")

#  Train multiple models, pick the best 
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, C=1.0),
    "Random Forest":       RandomForestClassifier(n_estimators=200, max_depth=8,
                                                   random_state=42, n_jobs=-1),
    "Gradient Boosting":   GradientBoostingClassifier(n_estimators=150, learning_rate=0.1,
                                                       max_depth=4, random_state=42),
}

print("\n Training models...\n")
best_model, best_acc, best_name = None, 0, ""

for name, clf in models.items():
    clf.fit(X_train, y_train)
    train_acc = clf.score(X_train, y_train)
    test_acc  = clf.score(X_test,  y_test)
    cv_scores = cross_val_score(clf, X, y, cv=5, scoring="accuracy")
    print(f"  {name:<25} train={train_acc:.2%}  test={test_acc:.2%}  cv={cv_scores.mean():.2%}  {cv_scores.std():.2%}")
    if test_acc > best_acc:
        best_acc, best_model, best_name = test_acc, clf, name

print(f"\n Best model: {best_name} (test accuracy: {best_acc:.2%})")

#  Feature importance (for Random Forest / GB) 
if hasattr(best_model, "feature_importances_"):
    fi = sorted(zip(feature_cols, best_model.feature_importances_), key=lambda x: -x[1])
    print("\n Feature importances:")
    for feat, imp in fi:
        print(f"   {feat:<25} {imp:.4f}")

#  Save artifact 
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
print(f"\n model.pkl saved  {out_path}")
print(f"   Model: {best_name} | Accuracy: {best_acc:.2%}")
print("\n Restart Flask server to activate real ML mode!")

