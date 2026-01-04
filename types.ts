
export interface HandbookSectionData {
  id: string;
  title: string;
  iconName: 'Trophy' | 'Activity' | 'Users' | 'Target' | 'Swords' | 'Info';
  content: string;
  items: { label: string; desc: string }[];
}

export interface Tournament {
  id: string;
  name: string;
  format: 'League' | 'Knockout';
  createdAt: number;
  status: 'active' | 'archived';
  matchPasscode?: string;
  handbook?: HandbookSectionData[];
}

export interface Team {
  id: string;
  tournamentId: string;
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
  tournamentId: string;
  team1Id: string;
  team2Id: string;
  status: MatchStatus;
  format: 1 | 3 | 5; // Best of
  pointsTarget: 15 | 21 | 30;
  currentGame: number;
  scores: GameScore[]; 
  winnerId?: string;
  createdAt: number;
  scheduledAt?: number; // Optional timestamp for match date/time
  order: number; 
  umpireNames?: string[]; 
}

export interface StandingsEntry {
  teamId: string;
  teamName: string;
  points: number; // New points system (3 for 2-0, 2 for 2-1)
  wins: number;
  losses: number;
  gamesWon: number;
  gamesLost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
}

export type ViewState = 'dashboard' | 'teams' | 'matches' | 'scorer' | 'standings' | 'team-dashboard';
