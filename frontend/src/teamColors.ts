// src/teamColors.ts — Official IPL brand colors
export const TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians":               "#004BA0",
  "Chennai Super Kings":          "#F9CD05",
  "Royal Challengers Bangalore":  "#C8102E",
  "Kolkata Knight Riders":        "#3A225D",
  "Sunrisers Hyderabad":          "#FF822A",
  "Delhi Capitals":               "#0078BC",
  "Rajasthan Royals":             "#EA1A85",
  "Punjab Kings":                 "#AA1E2D",
  "Lucknow Super Giants":         "#00B4D8",
  "Gujarat Titans":               "#1B4B7A",
};

export const getTeamColor = (team: string): string =>
  TEAM_COLORS[team] ?? "#60a5fa";
