// ============================================================
// MATCH DATA CONFIG FILE — Edit this file to update the app!
// ============================================================

export const TOURNAMENT_NAME = "TATA IPL 2026";
export const TOTAL_LEAGUE_MATCHES = 70;

// IPL Team data
export interface TeamInfo {
  name: string;
  short: string;
  color: string;
  bg: string;
  logo: string; // URL to team logo
}

export const IPL_TEAMS: Record<string, TeamInfo> = {
  RCB: { name: 'Royal Challengers Bengaluru', short: 'RCB', color: '#c8102e', bg: 'rgba(200,16,46,0.12)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Roundbig/RCBroundbig.png' },
  MI: { name: 'Mumbai Indians', short: 'MI', color: '#004ba0', bg: 'rgba(0,75,160,0.12)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/Roundbig/MIroundbig.png' },
  CSK: { name: 'Chennai Super Kings', short: 'CSK', color: '#f9cd05', bg: 'rgba(249,205,5,0.12)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CSK/Logos/Roundbig/CSKroundbig.png' },
  KKR: { name: 'Kolkata Knight Riders', short: 'KKR', color: '#3a225d', bg: 'rgba(58,34,93,0.15)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/KKR/Logos/Roundbig/KKRroundbig.png' },
  SRH: { name: 'Sunrisers Hyderabad', short: 'SRH', color: '#f7a721', bg: 'rgba(247,167,33,0.12)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Roundbig/SRHroundbig.png' },
  RR: { name: 'Rajasthan Royals', short: 'RR', color: '#e73895', bg: 'rgba(231,56,149,0.12)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Roundbig/RRroundbig.png' },
  DC: { name: 'Delhi Capitals', short: 'DC', color: '#004c93', bg: 'rgba(0,76,147,0.12)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/DC/Logos/Roundbig/DCroundbig.png' },
  GT: { name: 'Gujarat Titans', short: 'GT', color: '#1c1c2b', bg: 'rgba(28,28,43,0.2)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/GT/Logos/Roundbig/GTroundbig.png' },
  PBKS: { name: 'Punjab Kings', short: 'PBKS', color: '#ed1b24', bg: 'rgba(237,27,36,0.12)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/PBKS/Logos/Roundbig/PBKSroundbig.png' },
  LSG: { name: 'Lucknow Super Giants', short: 'LSG', color: '#003f7f', bg: 'rgba(0,63,127,0.12)', logo: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/LSG/Logos/Roundbig/LSGroundbig.png' },
};

// Parse team codes from "RCB vs SRH" style strings
export function parseTeams(teamsStr: string): [string, string] {
  const parts = teamsStr.split(' vs ')
  return [parts[0].trim(), parts[1].trim()]
}

// Player names — order determines dropdown order
export const PLAYERS = [
  "Nachiketh",
  "Avaneesha",
  "Sgmrvk18",
  "Shreeram",
  "Lohith",
  "Ahad",
  "Sudarshan",
] as const;

export type PlayerName = (typeof PLAYERS)[number];

// Leaderboard points awarded per rank (index 0 = 1st place)
export const RANK_POINTS = [10, 8, 6, 5, 4, 3, 2] as const;

// Column names in Supabase for each player's fantasy points
export const PLAYER_COLUMNS: Record<PlayerName, string> = {
  Nachiketh: "nachiketh_points",
  Avaneesha: "avaneesha_points",
  Sgmrvk18: "sharanbassapa_points",
  Shreeram: "shreeram_points",
  Lohith: "lohith_points",
  Ahad: "ahad_points",
  Sudarshan: "sudarshan_points",
};

export const PLAYER_RANK_COLUMNS: Record<PlayerName, string> = {
  Nachiketh: "nachiketh_rank",
  Avaneesha: "avaneesha_rank",
  Sgmrvk18: "sharanbassapa_rank",
  Shreeram: "shreeram_rank",
  Lohith: "lohith_rank",
  Ahad: "ahad_rank",
  Sudarshan: "sudarshan_rank",
};

export interface Match {
  match: number;
  date: string; // "YYYY-MM-DD"
  teams: string;
  venue: string;
  time: string; // e.g. "7:30 PM IST"
}

// =============================================
// LEAGUE SCHEDULE — Edit dates/teams/venue here
// =============================================
export const LEAGUE_SCHEDULE: Match[] = [
  { match: 1, date: "2026-03-28", teams: "RCB vs SRH", venue: "Bengaluru", time: "7:30 PM IST" },
  { match: 2, date: "2026-03-29", teams: "MI vs KKR", venue: "Mumbai", time: "7:30 PM IST" },
  { match: 3, date: "2026-03-30", teams: "RR vs CSK", venue: "Guwahati", time: "7:30 PM IST" },
  { match: 4, date: "2026-03-31", teams: "PBKS vs GT", venue: "New Chandigarh", time: "7:30 PM IST" },
  { match: 5, date: "2026-04-01", teams: "LSG vs DC", venue: "Lucknow", time: "7:30 PM IST" },
  { match: 6, date: "2026-04-02", teams: "KKR vs SRH", venue: "Kolkata", time: "7:30 PM IST" },
  { match: 7, date: "2026-04-03", teams: "CSK vs PBKS", venue: "Chennai", time: "7:30 PM IST" },
  { match: 8, date: "2026-04-04", teams: "DC vs MI", venue: "Delhi", time: "3:30 PM IST" },
  { match: 9, date: "2026-04-04", teams: "GT vs RR", venue: "Ahmedabad", time: "7:30 PM IST" },
  { match: 10, date: "2026-04-05", teams: "SRH vs LSG", venue: "Hyderabad", time: "3:30 PM IST" },
  { match: 11, date: "2026-04-05", teams: "RCB vs CSK", venue: "Bengaluru", time: "7:30 PM IST" },
  { match: 12, date: "2026-04-06", teams: "KKR vs PBKS", venue: "Kolkata", time: "7:30 PM IST" },
  { match: 13, date: "2026-04-07", teams: "RR vs MI", venue: "Guwahati", time: "7:30 PM IST" },
  { match: 14, date: "2026-04-08", teams: "DC vs GT", venue: "Delhi", time: "7:30 PM IST" },
  { match: 15, date: "2026-04-09", teams: "KKR vs LSG", venue: "Kolkata", time: "7:30 PM IST" },
  { match: 16, date: "2026-04-10", teams: "RR vs RCB", venue: "Guwahati", time: "7:30 PM IST" },
  { match: 17, date: "2026-04-11", teams: "PBKS vs SRH", venue: "New Chandigarh", time: "3:30 PM IST" },
  { match: 18, date: "2026-04-11", teams: "CSK vs DC", venue: "Chennai", time: "7:30 PM IST" },
  { match: 19, date: "2026-04-12", teams: "LSG vs GT", venue: "Lucknow", time: "3:30 PM IST" },
  { match: 20, date: "2026-04-12", teams: "MI vs RCB", venue: "Mumbai", time: "7:30 PM IST" },
  { match: 21, date: "2026-04-13", teams: "SRH vs RR", venue: "Hyderabad", time: "7:30 PM IST" },
  { match: 22, date: "2026-04-14", teams: "KKR vs CSK", venue: "Chennai", time: "7:30 PM IST" },
  { match: 23, date: "2026-04-15", teams: "LSG vs RCB", venue: "Bengaluru", time: "7:30 PM IST" },
  { match: 24, date: "2026-04-16", teams: "PBKS vs MI", venue: "Mumbai", time: "7:30 PM IST" },
  { match: 25, date: "2026-04-17", teams: "KKR vs GT", venue: "Ahmedabad", time: "7:30 PM IST" },
  { match: 26, date: "2026-04-18", teams: "DC vs RCB", venue: "Bengaluru", time: "3:30 PM IST" },
  { match: 27, date: "2026-04-18", teams: "CSK vs SRH", venue: "Hyderabad", time: "7:30 PM IST" },
  { match: 28, date: "2026-04-19", teams: "RR vs KKR", venue: "Kolkata", time: "3:30 PM IST" },
  { match: 29, date: "2026-04-19", teams: "LSG vs PBKS", venue: "New Chandigarh", time: "7:30 PM IST" },
  { match: 30, date: "2026-04-20", teams: "MI vs GT", venue: "Ahmedabad", time: "7:30 PM IST" },
  { match: 31, date: "2026-04-21", teams: "DC vs SRH", venue: "Hyderabad", time: "7:30 PM IST" },
  { match: 32, date: "2026-04-22", teams: "RR vs LSG", venue: "Lucknow", time: "7:30 PM IST" },
  { match: 33, date: "2026-04-23", teams: "CSK vs MI", venue: "Mumbai", time: "7:30 PM IST" },
  { match: 34, date: "2026-04-24", teams: "GT vs RCB", venue: "Bengaluru", time: "7:30 PM IST" },
  { match: 35, date: "2026-04-25", teams: "PBKS vs DC", venue: "Delhi", time: "3:30 PM IST" },
  { match: 36, date: "2026-04-25", teams: "SRH vs RR", venue: "Jaipur", time: "7:30 PM IST" },
  { match: 37, date: "2026-04-26", teams: "CSK vs GT", venue: "Ahmedabad", time: "3:30 PM IST" },
  { match: 38, date: "2026-04-26", teams: "KKR vs LSG", venue: "Lucknow", time: "7:30 PM IST" },
  { match: 39, date: "2026-04-27", teams: "RCB vs DC", venue: "Delhi", time: "7:30 PM IST" },
  { match: 40, date: "2026-04-28", teams: "RR vs PBKS", venue: "New Chandigarh", time: "7:30 PM IST" },
  { match: 41, date: "2026-04-29", teams: "SRH vs MI", venue: "Mumbai", time: "7:30 PM IST" },
  { match: 42, date: "2026-04-30", teams: "RCB vs GT", venue: "Ahmedabad", time: "7:30 PM IST" },
  { match: 43, date: "2026-05-01", teams: "DC vs RR", venue: "Jaipur", time: "7:30 PM IST" },
  { match: 44, date: "2026-05-02", teams: "MI vs CSK", venue: "Chennai", time: "7:30 PM IST" },
  { match: 45, date: "2026-05-03", teams: "KKR vs SRH", venue: "Hyderabad", time: "3:30 PM IST" },
  { match: 46, date: "2026-05-03", teams: "PBKS vs GT", venue: "Ahmedabad", time: "7:30 PM IST" },
  { match: 47, date: "2026-05-04", teams: "LSG vs MI", venue: "Mumbai", time: "7:30 PM IST" },
  { match: 48, date: "2026-05-05", teams: "CSK vs DC", venue: "Delhi", time: "7:30 PM IST" },
  { match: 49, date: "2026-05-06", teams: "PBKS vs SRH", venue: "Hyderabad", time: "7:30 PM IST" },
  { match: 50, date: "2026-05-07", teams: "RCB vs LSG", venue: "Lucknow", time: "7:30 PM IST" },
  { match: 51, date: "2026-05-08", teams: "KKR vs DC", venue: "Delhi", time: "7:30 PM IST" },
  { match: 52, date: "2026-05-09", teams: "GT vs RR", venue: "Jaipur", time: "7:30 PM IST" },
  { match: 53, date: "2026-05-10", teams: "LSG vs CSK", venue: "Chennai", time: "3:30 PM IST" },
  { match: 54, date: "2026-05-10", teams: "MI vs RCB", venue: "Raipur", time: "7:30 PM IST" },
  { match: 55, date: "2026-05-11", teams: "DC vs PBKS", venue: "Dharamshala", time: "7:30 PM IST" },
  { match: 56, date: "2026-05-12", teams: "SRH vs GT", venue: "Ahmedabad", time: "7:30 PM IST" },
  { match: 57, date: "2026-05-13", teams: "KKR vs RCB", venue: "Raipur", time: "7:30 PM IST" },
  { match: 58, date: "2026-05-14", teams: "MI vs PBKS", venue: "Dharamshala", time: "7:30 PM IST" },
  { match: 59, date: "2026-05-15", teams: "CSK vs LSG", venue: "Lucknow", time: "7:30 PM IST" },
  { match: 60, date: "2026-05-16", teams: "GT vs KKR", venue: "Kolkata", time: "7:30 PM IST" },
  { match: 61, date: "2026-05-17", teams: "RCB vs PBKS", venue: "Dharamshala", time: "3:30 PM IST" },
  { match: 62, date: "2026-05-17", teams: "RR vs DC", venue: "Delhi", time: "7:30 PM IST" },
  { match: 63, date: "2026-05-18", teams: "SRH vs CSK", venue: "Chennai", time: "7:30 PM IST" },
  { match: 64, date: "2026-05-19", teams: "LSG vs RR", venue: "Jaipur", time: "7:30 PM IST" },
  { match: 65, date: "2026-05-20", teams: "MI vs KKR", venue: "Kolkata", time: "7:30 PM IST" },
  { match: 66, date: "2026-05-21", teams: "GT vs CSK", venue: "Chennai", time: "7:30 PM IST" },
  { match: 67, date: "2026-05-22", teams: "RCB vs SRH", venue: "Hyderabad", time: "7:30 PM IST" },
  { match: 68, date: "2026-05-23", teams: "PBKS vs LSG", venue: "Lucknow", time: "7:30 PM IST" },
  { match: 69, date: "2026-05-24", teams: "RR vs MI", venue: "Mumbai", time: "3:30 PM IST" },
  { match: 70, date: "2026-05-24", teams: "KKR vs DC", venue: "Kolkata", time: "7:30 PM IST" },
];

export interface Playoff {
  name: string;
  date: string;
  venue: string;
}

export const PLAYOFFS: Playoff[] = [
  { name: "Qualifier 1", date: "2026-05-26", venue: "Bengaluru" },
  { name: "Eliminator", date: "2026-05-27", venue: "TBD" },
  { name: "Qualifier 2", date: "2026-05-29", venue: "TBD" },
  { name: "FINAL", date: "2026-05-31", venue: "M.Chinnaswamy Stadium, Bengaluru" },
];

// Humiliation messages for last place
export const HUMILIATION_MESSAGES = [
  "Certified bottom-feeder. Congrats on being consistently terrible. You're the reason last place exists.",
];

// Royal messages for 1st place
export const ROYAL_MESSAGES = [
  "BOW DOWN. The undisputed king of fantasy cricket. Cricketing genius.",
];

// Roast messages for 2nd-to-last
export const SECOND_LAST_MESSAGES = [
  "The participation trophy is calling your name.",
];
