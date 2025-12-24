
export interface Member {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
}

export type MatchStatus = 'scheduled' | 'live' | 'completed';

export interface GameScore {
  team1: number;
  team2: number;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  status: MatchStatus;
  format: 1 | 3 | 5; // Best of
  pointsTarget: 15 | 21 | 30;
  currentGame: number;
  scores: GameScore[]; // Array of scores for each game played
  winnerId?: string;
  createdAt: number;
}

export interface StandingsEntry {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
}

export type ViewState = 'dashboard' | 'teams' | 'matches' | 'scorer' | 'standings';
