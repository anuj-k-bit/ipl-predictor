// src/mockData.ts — All static mock data for demo mode
import type { VenueStatsData, PlayerData, PointsEntry, SeasonWins } from "./types";

// ── Venue Statistics ──────────────────────────────────────────────────────────
export const VENUE_STATS: Record<string, VenueStatsData> = {
  "Wankhede Stadium, Mumbai":
    { avg_first_innings: 172, chasing_win_pct: 54, best_team: "Mumbai Indians",               total_matches: 87 },
  "M. A. Chidambaram Stadium, Chennai":
    { avg_first_innings: 163, chasing_win_pct: 42, best_team: "Chennai Super Kings",          total_matches: 79 },
  "Eden Gardens, Kolkata":
    { avg_first_innings: 168, chasing_win_pct: 48, best_team: "Kolkata Knight Riders",        total_matches: 73 },
  "M. Chinnaswamy Stadium, Bangalore":
    { avg_first_innings: 181, chasing_win_pct: 58, best_team: "Royal Challengers Bangalore",  total_matches: 82 },
  "Rajiv Gandhi International Cricket Stadium, Hyderabad":
    { avg_first_innings: 167, chasing_win_pct: 46, best_team: "Sunrisers Hyderabad",          total_matches: 68 },
  "Arun Jaitley Stadium, Delhi":
    { avg_first_innings: 169, chasing_win_pct: 50, best_team: "Delhi Capitals",               total_matches: 76 },
  "Sawai Mansingh Stadium, Jaipur":
    { avg_first_innings: 164, chasing_win_pct: 45, best_team: "Rajasthan Royals",             total_matches: 58 },
  "Punjab Cricket Association Stadium, Mohali":
    { avg_first_innings: 170, chasing_win_pct: 52, best_team: "Punjab Kings",                 total_matches: 62 },
  "Narendra Modi Stadium, Ahmedabad":
    { avg_first_innings: 175, chasing_win_pct: 49, best_team: "Gujarat Titans",               total_matches: 35 },
  "BRSABV Ekana Cricket Stadium, Lucknow":
    { avg_first_innings: 165, chasing_win_pct: 47, best_team: "Lucknow Super Giants",         total_matches: 28 },
  "Dr. Y.S. Rajasekhara Reddy Cricket Stadium, Vishakhapatnam":
    { avg_first_innings: 162, chasing_win_pct: 44, best_team: "Sunrisers Hyderabad",          total_matches: 18 },
  "Brabourne Stadium, Mumbai":
    { avg_first_innings: 169, chasing_win_pct: 51, best_team: "Mumbai Indians",               total_matches: 22 },
  "DY Patil Stadium, Mumbai":
    { avg_first_innings: 173, chasing_win_pct: 53, best_team: "Mumbai Indians",               total_matches: 26 },
};

// ── Recent Form (last 5, most recent first) ───────────────────────────────────
export const RECENT_FORM: Record<string, ("W" | "L")[]> = {
  "Mumbai Indians":               ["W", "W", "L", "W", "L"],
  "Chennai Super Kings":          ["W", "W", "W", "L", "W"],
  "Royal Challengers Bangalore":  ["L", "W", "L", "L", "W"],
  "Kolkata Knight Riders":        ["W", "L", "W", "W", "L"],
  "Sunrisers Hyderabad":          ["L", "L", "W", "L", "W"],
  "Delhi Capitals":               ["W", "L", "L", "W", "L"],
  "Rajasthan Royals":             ["W", "W", "L", "W", "W"],
  "Punjab Kings":                 ["L", "W", "L", "L", "L"],
  "Lucknow Super Giants":         ["W", "L", "W", "L", "W"],
  "Gujarat Titans":               ["L", "W", "W", "L", "W"],
};

// ── Season-wise H2H (deterministic from string hash) ─────────────────────────
const SEASONS = [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024];

function strHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return Math.abs(h);
}

// Known matchup overrides (for realism)
const H2H_OVERRIDES: Record<string, SeasonWins[]> = {
  "Chennai Super Kings_Mumbai Indians": [
    {season:2008,t1:1,t2:1},{season:2009,t1:2,t2:0},{season:2010,t1:2,t2:0},
    {season:2011,t1:1,t2:1},{season:2012,t1:1,t2:2},{season:2013,t1:2,t2:0},
    {season:2014,t1:1,t2:2},{season:2015,t1:2,t2:0},{season:2016,t1:1,t2:2},
    {season:2017,t1:0,t2:2},{season:2018,t1:2,t2:0},{season:2019,t1:1,t2:1},
    {season:2020,t1:1,t2:2},{season:2021,t1:1,t2:2},{season:2022,t1:1,t2:2},
    {season:2023,t1:2,t2:1},{season:2024,t1:1,t2:2},
  ],
  "Kolkata Knight Riders_Mumbai Indians": [
    {season:2008,t1:1,t2:1},{season:2009,t1:1,t2:1},{season:2010,t1:0,t2:2},
    {season:2011,t1:0,t2:2},{season:2012,t1:0,t2:2},{season:2013,t1:0,t2:2},
    {season:2014,t1:1,t2:1},{season:2015,t1:0,t2:2},{season:2016,t1:0,t2:2},
    {season:2017,t1:0,t2:2},{season:2018,t1:0,t2:2},{season:2019,t1:1,t2:1},
    {season:2020,t1:1,t2:1},{season:2021,t1:0,t2:2},{season:2022,t1:0,t2:2},
    {season:2023,t1:0,t2:2},{season:2024,t1:2,t2:0},
  ],
};

export function getSeasonH2H(team1: string, team2: string): SeasonWins[] {
  // Check overrides (both orderings)
  const key1 = `${team1}_${team2}`;
  const key2 = `${team2}_${team1}`;
  if (H2H_OVERRIDES[key1]) return H2H_OVERRIDES[key1];
  if (H2H_OVERRIDES[key2]) return H2H_OVERRIDES[key2].map(d => ({ ...d, t1: d.t2, t2: d.t1 }));

  // Deterministic fallback
  return SEASONS.map(season => {
    const seed = strHash(`${team1}${team2}${season}`);
    const t1 = seed % 3;
    const t2 = (seed >> 4) % 3;
    return { season, t1, t2 };
  });
}

// ── Player Impact Data ────────────────────────────────────────────────────────
export const TEAM_PLAYERS: Record<string, PlayerData[]> = {
  "Mumbai Indians": [
    { name: "Rohit Sharma",      impact: 3.8, active: true },
    { name: "Jasprit Bumrah",    impact: 5.1, active: true },
    { name: "Suryakumar Yadav", impact: 4.2, active: true },
    { name: "Hardik Pandya",    impact: 2.9, active: true },
    { name: "Tilak Varma",      impact: 2.1, active: true },
  ],
  "Chennai Super Kings": [
    { name: "MS Dhoni",          impact: 4.5, active: true },
    { name: "Ruturaj Gaikwad",  impact: 3.9, active: true },
    { name: "Ravindra Jadeja",  impact: 3.2, active: true },
    { name: "Deepak Chahar",    impact: 2.6, active: true },
    { name: "Shivam Dube",      impact: 2.2, active: true },
  ],
  "Royal Challengers Bangalore": [
    { name: "Virat Kohli",      impact: 5.8, active: true },
    { name: "Glenn Maxwell",    impact: 4.1, active: true },
    { name: "Faf du Plessis",   impact: 3.4, active: true },
    { name: "Mohammed Siraj",   impact: 3.0, active: true },
    { name: "Dinesh Karthik",   impact: 2.5, active: true },
  ],
  "Kolkata Knight Riders": [
    { name: "Sunil Narine",           impact: 4.8, active: true },
    { name: "Andre Russell",          impact: 5.2, active: true },
    { name: "Shreyas Iyer",           impact: 4.2, active: true },
    { name: "Varun Chakaravarthy",    impact: 3.1, active: true },
    { name: "Phil Salt",              impact: 3.5, active: true },
  ],
  "Sunrisers Hyderabad": [
    { name: "Travis Head",       impact: 4.5, active: true },
    { name: "Pat Cummins",       impact: 4.0, active: true },
    { name: "Heinrich Klaasen", impact: 3.8, active: true },
    { name: "Abhishek Sharma",  impact: 3.2, active: true },
    { name: "T Natarajan",      impact: 2.8, active: true },
  ],
  "Delhi Capitals": [
    { name: "Rishabh Pant",     impact: 4.7, active: true },
    { name: "Kuldeep Yadav",    impact: 3.8, active: true },
    { name: "David Warner",     impact: 3.9, active: true },
    { name: "Mitchell Starc",   impact: 3.5, active: true },
    { name: "Axar Patel",       impact: 3.0, active: true },
  ],
  "Rajasthan Royals": [
    { name: "Jos Buttler",           impact: 4.9, active: true },
    { name: "Yashasvi Jaiswal",     impact: 4.3, active: true },
    { name: "Sanju Samson",         impact: 4.1, active: true },
    { name: "Trent Boult",          impact: 3.6, active: true },
    { name: "Ravichandran Ashwin",  impact: 2.9, active: true },
  ],
  "Punjab Kings": [
    { name: "Shikhar Dhawan",   impact: 3.2, active: true },
    { name: "Kagiso Rabada",    impact: 3.7, active: true },
    { name: "Liam Livingstone", impact: 3.8, active: true },
    { name: "Arshdeep Singh",   impact: 3.5, active: true },
    { name: "Sam Curran",       impact: 3.1, active: true },
  ],
  "Lucknow Super Giants": [
    { name: "KL Rahul",           impact: 4.3, active: true },
    { name: "Quinton de Kock",   impact: 3.9, active: true },
    { name: "Nicholas Pooran",   impact: 3.5, active: true },
    { name: "Mark Wood",         impact: 3.4, active: true },
    { name: "Ravi Bishnoi",      impact: 3.0, active: true },
  ],
  "Gujarat Titans": [
    { name: "Shubman Gill",    impact: 4.6, active: true },
    { name: "Rashid Khan",     impact: 4.8, active: true },
    { name: "Mohammad Shami",  impact: 4.2, active: true },
    { name: "David Miller",    impact: 3.5, active: true },
    { name: "Hardik Pandya",  impact: 4.0, active: true },
  ],
};

// ── IPL 2024 Points Table ─────────────────────────────────────────────────────
export const POINTS_TABLE: PointsEntry[] = [
  { team: "Kolkata Knight Riders",       played: 14, won: 9, lost: 5,  nr: 0, nrr:  0.427, points: 18 },
  { team: "Sunrisers Hyderabad",         played: 14, won: 8, lost: 6,  nr: 0, nrr:  0.449, points: 16 },
  { team: "Rajasthan Royals",            played: 14, won: 8, lost: 6,  nr: 0, nrr:  0.228, points: 16 },
  { team: "Royal Challengers Bangalore", played: 14, won: 7, lost: 7,  nr: 0, nrr:  0.374, points: 14 },
  { team: "Chennai Super Kings",         played: 14, won: 7, lost: 7,  nr: 0, nrr: -0.010, points: 14 },
  { team: "Delhi Capitals",              played: 14, won: 7, lost: 7,  nr: 0, nrr: -0.377, points: 14 },
  { team: "Mumbai Indians",              played: 14, won: 6, lost: 8,  nr: 0, nrr:  0.003, points: 12 },
  { team: "Lucknow Super Giants",        played: 14, won: 6, lost: 8,  nr: 0, nrr: -0.165, points: 12 },
  { team: "Gujarat Titans",              played: 14, won: 5, lost: 9,  nr: 0, nrr: -0.260, points: 10 },
  { team: "Punjab Kings",                played: 14, won: 3, lost: 11, nr: 0, nrr: -0.786, points:  6 },
];
